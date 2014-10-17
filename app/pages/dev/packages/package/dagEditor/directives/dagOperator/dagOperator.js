/*
* Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
'use strict';

angular.module('app.pages.dev.packages.package.dagEditor.directives.dagOperator', [
  'app.components.services.jsPlumb',
  'app.components.services.dtText',
  'app.components.services.confirm',
  'app.pages.dev.packages.package.dagEditor.services.dagEditorOptions'
])
// Directive: operator on the canvas
.directive('dagOperator', function($jsPlumb, dagEditorOptions, $log, $compile) {

  var portTypes = {
    inputPorts: {
      position: 0,
      incident: -1,
      options: dagEditorOptions.inputEndpointOptions
    },
    outputPorts: {
      position: 1,
      incident: 1,
      options: dagEditorOptions.outputEndpointOptions
    }
  };

  function angularizeEndpoint(endpoint, port, operator, scope) {

    // Get the element
    var element = endpoint.canvas;

    // create the scope to be attached to the endpoint.
    var epScope = scope.$new();
    // attach the port and operator
    epScope.port = port;
    epScope.operator = operator;
    epScope.endpoint = endpoint;

    // apply the directive
    element.setAttribute('dag-port', 'true');
    $compile(element)(epScope);
  }

  function getYPosition(len, idx) {
    var theta = Math.PI / (len + 1);
    var angle = theta * (idx + 1);
    var h = 0.5;
    var cos = Math.cos(angle);
    var a = h * cos;
    return 0.5 + a;
  }

  function getXPosition(incident, len, idx) {
    var theta = Math.PI / (len + 1);
    var angle = theta * (idx + 1);
    var h = 0.5;
    var sin = Math.sin(angle);
    var o = h * sin;
    return 0.5 + incident * o;
  }

  function setPortEndpoints(operator, element, scope) {

    var endpoints = [];

    _.each(portTypes, function(type, portKey) {

      var ports = operator[portKey];

      if (!ports || !ports.length) {
        return true;
      }

      var lastOptions = $.extend(true, {}, type.options);

      if (ports.length > 10) {
        lastOptions.paintStyle.radius = 6;
        lastOptions.paintStyle.lineWidth = 1;
      }

      for (var i = 0, len = ports.length; i < len; i++) {
        var port = ports[i];
        var y_pos = getYPosition(len, i);
        var x_pos = getXPosition(type.incident, len, i);
        var endpointOptions = {
          // anchor placement
          anchor: [
            x_pos,
            y_pos,
            type.incident,
            0
          ],
          // scope
          scope: port.type
          // activeClass: 'dragActive'
        };

        var endpoint = $jsPlumb.addEndpoint(element, endpointOptions, lastOptions);
        var label = endpoint.getOverlay('label');
        label.setLabel(port.name);

        // Set location for labels
        var width = $(label.getElement()).outerWidth() - 20;
        var radius = lastOptions.paintStyle.radius;
        if (lastOptions.paintStyle.lineWidth) {
          radius += lastOptions.paintStyle.lineWidth;
        }
        var label_x_pos = width / (radius * 4);
        label_x_pos += type.position + 0.3;
        label_x_pos *= type.incident;
        label.setLocation([ label_x_pos , 0.5 ]);

        // // connection detection relies on this being the exact portname
        endpoint.canvas.title = port.name;

        // Set references to port and operator models
        endpoint.port = port;
        endpoint.operator = operator;

        // Angularize the endpoint
        angularizeEndpoint(endpoint, port, operator, scope);

        // Push to result array
        endpoints.push(endpoint);
      }

    });

    return endpoints;

  }

  return {
    restrict: 'A',
    templateUrl: 'pages/dev/packages/package/dagEditor/directives/dagOperator/dagOperator.html',
    replace: true,
    scope: {
      operator: '=dagOperator',
      app: '=',
      selected: '='
    },
    controller: 'DagOperatorCtrl',
    link: function(scope, element) {
      // Set the editing state on the scope
      scope.editing = {};

      // Holds new values
      scope.changes = {};

      // Set the initial position
      element.css({
        left: scope.operator.x + 'px',
        top: scope.operator.y + 'px'
      });

      // Make it draggable via jsPlumb
      $jsPlumb.draggable(element, {
        stop: function(event, ui) {
          var position = ui.position;
          scope.operator.x = position.left;
          scope.operator.y = position.top;
          $log.info('Operator moved on DAG canvas: ', position, scope.operator);
        }
      });

      // Set the ports as anchors/endpoints
      scope.endpoints = setPortEndpoints(scope.operator, element, scope);

      // Start by editing name if this is a real drop (not thawing)
      if (!scope.app.thawing) {
        scope.editName({
          target: element.find('.dag-operator-name')[0]
        }, scope.operator);
      }

      // destroy event
      scope.$on('$destroy', function() {
        $jsPlumb.detachAllConnections(element);
        _.each(scope.endpoints, function(ep) {
          ep.fire('destroy');
          $jsPlumb.deleteEndpoint(ep);
        });
      });
    }
  };
})
// Controller: for operators on the canvas
.controller('DagOperatorCtrl', function($scope, $timeout, confirm, dtText) {
  $scope.editName = function($event) {
    var operator = $scope.operator;
    $scope.editing.name = true;
    $scope.changes.name = operator.name;
    var $trg = $($event.target);
    var $input = $trg.next('.edit-name-form').find('input');
    $timeout(function() {
      var len = $input.val().length;
      $input.focus();
      $input[0].setSelectionRange(0, len);
    });
  };
  $scope.saveName = function($event, checkForEnter) {

    // If we are checking for enter, this is probably
    // a keyup event, so nothing should happen if it
    // is not the enter key.
    if (checkForEnter && $event.which !== 13) {
      return;
    }

    // prevent saving when editing.name is false
    if (!$scope.editing.name || $scope.dag_operator_name_form.$invalid) {
      $scope.editing.name = false;
      return;
    }

    var operator = $scope.operator;

    var newName = $scope.changes.name;

    operator.name = newName;

    $scope.editing.name = false;
  };

  // listen for remove events broadcast from the parent scope
  $scope.$on('remove', function(e, data) {
    if (data.selected === $scope.operator) {
      // broadcasted "remove" message was for this instance, so remove
      $scope.remove();
    }
  });

  // listen for selected element events broadcast from the parent
  $scope.$on('selected', function(e, selected) {
    if (selected !== $scope.operator) {
      $scope.saveName(e);
    }
  });

  // delete this operator
  $scope.remove = function() {

    // Check if streams will be destroyed
    var destroyed_streams = _.map($scope.app.streams, function(stream) {

      // check if source is this operator
      if (stream.source.operator === $scope.operator) {
        return stream.name;
      }

      // check if all sinks are from this operator
      if (_.every(stream.sinks, function(sink) {
        return sink.operator === $scope.operator;
      })) {
        return stream.name;
      }

    });

    destroyed_streams = _.filter(destroyed_streams);

    if (destroyed_streams.length) {
      return confirm({
        title: dtText.get('Operator Delete'),
        body: dtText.get('Are you sure you want to delete this operator? Doing so will delete the following streams: ') + destroyed_streams.join(', ') + '.'
      })
      .then(function() {
        var index = $scope.app.operators.indexOf($scope.operator);
        $scope.app.operators.splice(index, 1);
      });
    }

    var index = $scope.app.operators.indexOf($scope.operator);
    $scope.app.operators.splice(index, 1);
  };
  $scope.selectOperator = function($event) {
    $event.stopPropagation();
    $scope.$emit('selectEntity', 'operator', $scope.operator);
  };
}).filter('camelToZeroSpace', function() {
  // inserts a zero-width space
  return function(str) {
    return str.replace(/(?!^)([A-Z])/g, '\u200b$1');
  };
});

