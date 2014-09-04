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
.controller('DagEditorCtrl', function($scope, mockOperatorsData) {

  // Search object
  $scope.operatorClassSearch = { term: '' };
  
  // Operator Classes:
  $scope.operatorClasses = mockOperatorsData;
  
  // Chosen Operators
  $scope.operators = [];

  // Created Streams
  $scope.streams = [];

  // Palette resizable options
  $scope.paletteResizeOptions = {
    handles: 's'
  };

  // Holds selection
  $scope.selected = null;

  // Deselects everything
  $scope.deselectAll = function() {
    $scope.selected = null;
  };

  // Listen for entity selections
  $scope.$on('selectEntity', function(event, entity) {
    $scope.selected = entity;
  });

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
.directive('dagPalette', function() {

  return {
    restrict: 'A',
    scope: {
      operatorClasses: '=',
      operators: '='
    },
    link: function(scope, element){

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

      function addOperator(opClass, x, y) {
        var operator = {
          name: 'Untitled',
          opClass: opClass,
          x: x,
          y: y
        };
        scope.operators.push(operator);
        scope.$emit('selectEntity', operator);
        scope.$digest();
      }

      element.droppable({
        drop:function(event,ui) {
          // angular uses angular.element to get jQuery element, subsequently data() of jQuery is used to get
          // the data-identifier attribute
          var dragEl = angular.element(ui.draggable);
          var dropEl = angular.element(this);

          // if dragged item has class menu-item and dropped div has class drop-container, add module 
          if (dragEl.hasClass('operator-class') && dropEl.hasClass('dag-palette')) {
            var opClass = getClass(dragEl.data('classname'));
            console.log('Dropped class', opClass);
            var droppedOffset = ui.offset;
            var droppableOffset = dropEl.offset();
            var x = droppedOffset.left - droppableOffset.left;
            var y = droppedOffset.top - droppableOffset.top;

            addOperator(opClass, x, y);
          }

          scope.$apply();
        }
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
.directive('dagOperator', function($jsPlumb, dagEditorOptions) {

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
      operators: '=',
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
        containment: element.parent()
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

    // prevent saving when editing.name is false
    if (!$scope.editing.name) {
      return;
    }

    var operator = $scope.operator;
    if (checkForEnter && $event.which !== 13) {
      return;
    }

    var newName = $scope.changes.name;

    // check if an operator with that name exists
    var current = _.find($scope.operators, function(o) {
      return o !== operator && o.name === newName;
    });

    console.log(current);

    operator.name = newName;

    $scope.editing.name = false;
  };
  $scope.remove = function() {
    var index = $scope.operators.indexOf($scope.operator);
    $scope.operators.splice(index, 1);
  };
  $scope.selectOperator = function($event) {
    $event.stopPropagation();
    $scope.$emit('selectEntity', $scope.operator);
  };
});