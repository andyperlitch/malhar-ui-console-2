/*
* Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the 'License');
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an 'AS IS' BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
'use strict';

angular.module('app.pages.dev.packages.package.dagEditor', [
  // MOCK DATA: FOR TESTING ONLY
  'app.pages.dev.packages.package.dagEditor.mockOperatorsData',

  'app.components.services.jsPlumb',
  'app.components.filters.camel2spaces',
  'app.components.directives.uiResizable'
])

// Routing
.config(function($routeProvider, settings) {

  $routeProvider.when(settings.pages.DagEditor, {
    controller: 'DagEditorCtrl',
    templateUrl: 'pages/dev/packages/package/dagEditor/dagEditor.html',
    label: 'edit DAG'
  });
})

// Controller
.controller('DagEditorCtrl', function($scope, mockOperatorsData, $routeParams) {

  // Deselects everything
  $scope.deselectAll = function() {
    $scope.selected = null;
    $scope.selected_type = null;
  };

  // Listen for entity selections
  $scope.$on('selectEntity', function(event, type, entity) {
    $scope.selected = entity;
    $scope.selected_type = type;
  });

  // Search object
  $scope.operatorClassSearch = { term: '' };
  
  // Operator Classes:
  $scope.operatorClasses = mockOperatorsData;

  // Expose appName to scope
  $scope.appName = $routeParams.appName;
  
  // Models the application
  $scope.app = {
    operators: [],
    streams: []
  };

  // Palette resizable options
  $scope.paletteResizeOptions = {
    handles: 's'
  };

  // Initialize selection info
  $scope.deselectAll();

})

// Factory: default appearance/functionality options
// for the dag editor jsPlumb
.factory('dagEditorOptions', function() {
  var options = {};

  options.connectorPaintStyle = {
    lineWidth:4,
    strokeStyle:'#5C96BC',
    joinstyle:'round',
    outlineColor:'#eaedef',
    outlineWidth:2
  };

  options.connectorHoverStyle = {
    lineWidth:4,
    strokeStyle:'#deea18',
    outlineWidth:2,
    outlineColor:'white'
  };

  options.endpointHoverStyle = {
      fillStyle:'#5C96BC',
      outlineWidth:0
  };

  options.inputEndpointOptions = {
    endpoint:'Dot',
    maxConnections: 1,     
    paintStyle:{
        strokeStyle:'#1da8db',
      fillStyle:'transparent',
      radius:9,
      lineWidth:2
    },
    hoverPaintStyle:options.endpointHoverStyle,
    dropOptions:{ hoverClass:'hover', activeClass:'active' },
    isTarget:true,      
      overlays:[
        [ 'Label', { 
            location:[0, -0.5], 
            label:'Drop', 
            cssClass:'endpointTargetLabel', 
            id: 'label'
        } ]
      ]
  };
  options.outputEndpointOptions = {
    endpoint:'Dot',
    maxConnections: -1,
    paintStyle:{ 
      fillStyle:'#64c539',
      radius:10
    },        
    isSource:true,
    // connector:[ 'Flowchart', { stub:[40, 60], gap:10, cornerRadius:5, alwaysRespectStubs:true } ],
    // connector:[ 'StateMachine', { margin: 30, curviness: 150, proximityLimit: 200 } ],
    connector:[ 'Bezier', { curviness: 150 } ],
    connectorStyle: options.connectorPaintStyle,
    hoverPaintStyle: options.endpointHoverStyle,
      connectorHoverStyle: options.connectorHoverStyle,
      dragOptions:{},
      overlays:[
        [ 'Label', { 
            location:[1, 1.5], 
            label:'Drag',
            cssClass:'endpointSourceLabel',
            id: 'label'
          } ]
      ]
  };

  return options;
})

// Directive: DAG editor palette
.directive('dagPalette', function(settings, $log, $jsPlumb, $compile) {

  function angularizeSinkConnection(connection, stream, scope) {
    // console.log(connection.canvas);
    // console.log(connection.canvas);
    var streamScope = scope.$new();
    streamScope.stream = stream;
    streamScope.connection = connection;
    connection.canvas.setAttribute('dag-stream', 'true');
    $compile(connection.canvas)(streamScope);
  }

  return {
    restrict: 'A',
    templateUrl: 'pages/dev/packages/package/dagEditor/dagPalette.html',
    scope: {
      operatorClasses: '=',
      app: '=',
      selected: '='
    },
    link: function(scope, element){

      function generateNewName(key, collection, defaultName) {
        var name = defaultName;
        var i = 0;
        var existing;

        var finder = function(o) {
          return o[key] === name;
        };

        do {
          existing = _.find(collection, finder);
          if (existing) {
            i++;
            name = name.replace(/\s+\d+$/, '') + ' ' + i;
          }  
        } while (existing);

        return name;
      }

      /**
       * helper function to get the operatorClass 
       * that got dropped onto the palette.
       * 
       * @param  {String} name The className of the operator
       * @return {Object}      The class object
       */
      function getClass(name) {
        return _.find(scope.operatorClasses, function(c) {
          return c.name === name;
        });
      }

      /**
       * Adds an operator to the application.
       *  
       * @param {Object} opClass Operator Class object
       * @param {Number} x       Position to put the operator
       * @param {Number} y       Position to put the operator
       */
      function addOperator(opClass, x, y) {
        var operator = {
          name: generateNewName('name', scope.app.operators, settings.dagEditor.DEFAULT_OPERATOR_NAME),
          opClass: opClass,
          x: x,
          y: y
        };
        scope.app.operators.push(operator);
        scope.$emit('selectEntity', 'operator', operator);
        scope.$digest();
      }

      function addStream(sourceOperator, sourcePort, sinkOperator, sinkPort, sinkConnection) {

        // Check for existing stream
        var stream = _.find(scope.app.streams, function(s) {
          return s.source.operator === sourceOperator && s.source.port === sourcePort;
        });

        if (!stream) {
          // No existing
          stream = {
            name: generateNewName('name', scope.app.streams, settings.dagEditor.DEFAULT_STREAM_NAME),
            source: {
              operator: sourceOperator,
              port: sourcePort
            },
            sinks: [
              {
                operator: sinkOperator,
                port: sinkPort,
                connection: sinkConnection
              }
            ]
          };

          angularizeSinkConnection(sinkConnection, stream, scope);

          scope.app.streams.push(stream);
          scope.$emit('selectEntity', 'stream', stream);
          scope.$apply();
          return stream;
        }

        // Stream exists, check for sink
        var sink = _.find(stream.sinks, function(k) {
          return k.operator === sinkOperator && k.port === sinkPort;
        });

        // Add sink
        if (!sink) {
          stream.sinks.push({
            operator: sinkOperator,
            port: sinkPort,
            connection: sinkConnection
          });

          angularizeSinkConnection(sinkConnection, stream, scope);
        }

        // Select the stream
        scope.$emit('selectEntity', 'stream', stream);
        scope.$apply();
        return stream;

      }

      // function addSinkToStream(stream, sinkOperator, sinkPort) {
      //   // First check if this is not already a sink
      //   var exists = _.find(stream.sinks, function(sink) {
      //     return sink.operatorName === sinkOperator && sink.portName === sinkPort;
      //   });

      //   if (exists) {
      //     return;
      //   }

      //   stream.sinks.push({
      //     operatorName: sinkOperator,
      //     portName: sinkPort
      //   });
      //   scope.$emit('selectEntity', 'stream', stream);
      //   scope.$apply();
      // }

      /**
       * Listeners for connections
       */
      $jsPlumb.bind('connection', function(info, originalEvent) {

        $log.info('Stream connection made: ', info, originalEvent);
        var sourceOperator = info.sourceEndpoint.operator;
        var sourcePort = info.sourceEndpoint.port;
        var sinkOperator = info.targetEndpoint.operator;
        var sinkPort = info.targetEndpoint.port;

        addStream(sourceOperator, sourcePort, sinkOperator, sinkPort, info.connection);

      });

      $jsPlumb.bind('connectionDetached', function(info, originalEvent) {
        $log.info('Stream connection detached: ', info, originalEvent);
      });

      $jsPlumb.bind('connectionMoved', function(info, originalEvent) {
        $log.info('Stream connection moved:' , info, originalEvent);
      });




      // Sets up the droppable state of the palette.
      element.droppable({

        /**
         * Listens for operator classes being dropped
         * onto the palette.
         *  
         * @param  {Object} event DOM event from the drop.
         * @param  {Object} ui    The jquery UI event, holding information on where it was dropped, etc.
         */
        drop:function(event,ui) {
          // angular uses angular.element to get jQuery element, subsequently data() of jQuery is used to get
          // the data-identifier attribute
          var dragEl = angular.element(ui.draggable);
          var dropEl = angular.element(this);

          // if dragged item has class menu-item and dropped div has class drop-container, add module 
          if (dragEl.hasClass('operator-class') && dropEl.hasClass('dag-palette')) {
            var opClass = getClass(dragEl.data('classname'));
            $log.info('Operator class dropped on DAG palette: ', opClass);
            var droppedOffset = ui.offset;
            var droppableOffset = dropEl.offset();
            var x = droppedOffset.left - droppableOffset.left;
            var y = droppedOffset.top - droppableOffset.top;

            addOperator(opClass, x, y);
          }

          scope.$apply();
        }
      });



      scope.$on('$destroy', function() {
        $jsPlumb.unbind();
      });
    }
  };
})

// Directive: Operator Class option
.directive('dagOperatorClass', function() {
  return {
    restrict:'A',
    link: function(scope, element) {

      // Make it draggable
      element.draggable({
        // let it go back to its original position
        revert:true,
        revertDuration: 0,
        zIndex: 1
      });

    }
  };
})

// Directive: sets the jsPlumb container
.directive('jsplumbContainer', function($jsPlumb) {
  return {
    link: function(scope, element) {
      $jsPlumb.setContainer(element);
    }
  };
})

// Directive: operator on the palette
.directive('dagOperator', function($jsPlumb, dagEditorOptions, $log) {

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

  function getYPosition(len, idx) {
    if (len === 1) {
      return 0.5;
    }
    if (len === 2) {
      return idx === 0 ? 0.33 : 0.67;
    }
    return (1 / (len - 1)) * idx;
  }

  function setPortEndpoints(operator, element) {

    var endpoints = [];

    _.each(portTypes, function(type, portKey) {

      var ports = operator.opClass[portKey];

      if (!ports || !ports.length) {
        return true;
      }

      for (var i = 0, len = ports.length; i < len; i++) {
        var port = ports[i];
        var endpointOptions = { 
          // anchor placement
          anchor: [
            type.position,
            getYPosition(len, i),
            type.incident,
            0
          ],
          // scope
          scope: port.type
        };

        var endpoint = $jsPlumb.addEndpoint(element, endpointOptions, type.options);
        var label = endpoint.getOverlay('label');
        label.setLabel(port.name);

        // // DO NOT MODIFY THIS ATTRIBUTE IN ANY WAY
        // // connection detection relies on this being the exact portname
        endpoint.canvas.title = port.name;

        endpoint.port = port;
        endpoint.operator = operator;

        endpoints.push(endpoint);
      }

    });

    return endpoints;

  }

  return {
    restrict: 'A',
    templateUrl: 'pages/dev/packages/package/dagEditor/dagOperator.html',
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
        left: scope.operator.x,
        top: scope.operator.y
      });

      // Make it draggable via jsPlumb
      $jsPlumb.draggable(element, {
        containment: element.parent(),
        stop: function(event, ui) {
          var position = ui.position;
          scope.operator.x = position.left;
          scope.operator.y = position.top;
          $log.info('Operator moved on DAG palette: ', position, scope.operator);
        }
      });

      // Set the ports as anchors/endpoints
      scope.endpoints = setPortEndpoints(scope.operator, element);
      scope.editName({
        target: element.find('.dag-operator-name')[0]
      }, scope.operator);

      // destroy event
      scope.$on('$destroy', function() {
        $jsPlumb.detachAllConnections(element);
        _.each(scope.endpoints, function(ep) {
          $jsPlumb.deleteEndpoint(ep);
        });
      });
    }
  };
})

.directive('dagStream', function() {
  return {
    link: function(scope, element, attrs) {
      
      // Set the stream label
      scope.connection.addOverlay(['Label', { label: scope.stream.name, id: 'streamLabel', cssClass: 'stream-label' }]);

      // Get it for use in the listener
      var overlay = scope.connection.getOverlay('streamLabel');

      // Update label as needed
      scope.$watch('stream.name', function(name) {
        if (name) {
          overlay.setLabel(name);
        }
      });

      // Listen for clicks on the connection
      scope.connection.bind('click', function(conn, event) {
        console.log('testing');
        event.stopPropagation();
        scope.$emit('selectEntity', 'stream', scope.stream);
        scope.$apply();
      });
    }
  };
})

// Controller: for operators on the palette
.controller('DagOperatorCtrl', function($scope, $timeout) {
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
  $scope.remove = function() {
    var index = $scope.app.operators.indexOf($scope.operator);
    $scope.app.operators.splice(index, 1);
  };
  $scope.selectOperator = function($event) {
    $event.stopPropagation();
    $scope.$emit('selectEntity', 'operator', $scope.operator);
  };
})

// Controller: Inspector for application
.controller('DagAppInspectorCtrl', function() {

})

// Controller: Inspector for operator
.controller('DagOperatorInspectorCtrl', function() {

})

.controller('DagStreamInspectorCtrl', function() {

})

// Directive: check for unique name in collection
.directive('uniqueInSet', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      var collection = scope.$eval(attrs.uniqueInSet);
      var key = attrs.uniqueKey;

      if (!collection || !key) {
        return;
      }

      var exclude = scope.$eval(attrs.exclude);
      if (exclude) {
        exclude = [].concat(exclude);
      }

      ngModel.$parsers.unshift(function(value) {
        var unique = !_.any(collection, function(o) {
          if (exclude && exclude.indexOf(o) > -1) {
            return false;
          }
          return key ? o[key] === value : o === value;
        });
        ngModel.$setValidity('uniqueInSet', unique);
        return unique ? value : ngModel.$modelValue;
      });
    }
  };
});