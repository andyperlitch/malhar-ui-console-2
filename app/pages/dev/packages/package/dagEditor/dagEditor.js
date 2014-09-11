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
  'app.components.directives.uiResizable',
  'app.components.services.confirm',
  'app.components.services.dtText'
])

// Routing
.config(function($routeProvider, settings) {

  $routeProvider.when(settings.pages.DagEditor, {
    controller: 'DagEditorCtrl',
    templateUrl: 'pages/dev/packages/package/dagEditor/dagEditor.html',
    label: 'edit DAG'
  });
})

// Page Controller
.controller('DagEditorCtrl', function($scope, mockOperatorsData, $routeParams, settings) {

  // Deselects everything
  $scope.deselectAll = function() {
    $scope.selected = null;
    $scope.selected_type = null;
  };

  // Selects an entity in the DAG
  $scope.selectEntity = function($event, type, entity) {
    if (typeof $event.preventDefault === 'function') {
      $event.preventDefault();
    }
    $scope.selected = entity;
    $scope.selected_type = type;
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  };

  // Listen for entity selections
  $scope.$on('selectEntity', $scope.selectEntity);

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

  // Canvas resizable options
  $scope.canvasResizeOptions = {
    handles: 's'
  };

  // Stream localities
  $scope.streamLocalities = settings.STREAM_LOCALITIES;

  // Initialize selection info
  $scope.deselectAll();

})

// Factory: default appearance/functionality options
// for the dag editor jsPlumb
.factory('dagEditorOptions', function() {
  var options = {};

  options.connectorPaintStyle = {
    lineWidth:4,
    joinstyle:'round',
    outlineColor:'#eaedef',
    outlineWidth:2
  };

  options.connectorHoverStyle = {
    lineWidth:4,
    outlineWidth:2,
    outlineColor:'white'
  };

  options.endpointHoverStyle = {
      fillStyle:'#5C96BC',
      outlineWidth:0
  };

  options.inputEndpointOptions = {
    cssClass: 'inputEndpoint',
    endpoint:'Dot',
    maxConnections: 1,     
    paintStyle:{
      strokeStyle:'#1da8db',
      fillStyle:'transparent',
      radius:9,
      lineWidth:3
    },
    hoverPaintStyle:options.endpointHoverStyle,
    dropOptions:{ hoverClass:'hover', activeClass:'active' },
    isTarget:true,      
      overlays:[
        [ 'Label', { 
            location:[-1, 0.5], 
            label:'Drop', 
            cssClass:'endpointTargetLabel', 
            id: 'label'
        } ]
      ]
  };
  options.outputEndpointOptions = {
    cssClass: 'outputEndpoint',
    endpoint:'Dot',
    maxConnections: -1,
    paintStyle:{ 
      strokeStyle:'#1da8db',
      fillStyle:'#64c539',
      radius:9,
      lineWidth:3
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
            location:[2.2, 0.5], 
            label:'Drag',
            cssClass:'endpointSourceLabel',
            id: 'label'
          } ]
      ]
  };

  return options;
})

// Directive: DAG editor canvas
.directive('dagCanvas', function(settings, $log, $jsPlumb, $compile) {

  function angularizeSinkConnection(connection, stream, scope) {
    // console.log(connection.canvas);
    // console.log(connection.canvas);
    var streamScope = scope.$new();
    streamScope.stream = stream;
    streamScope.connection = connection;
    connection.canvas.setAttribute('dag-stream', 'true');
    $compile(connection.canvas)(streamScope);
  }

  function copyPorts(ports, portType) {
    if (typeof ports === 'undefined') {
      return [];
    }
    return _.map(ports, function(port) {
      return {
        name: port.name,
        attributes: {},
        type: port.type,
        optional: port.optional,
        portType: portType
      };
    });
  }

  return {
    restrict: 'A',
    templateUrl: 'pages/dev/packages/package/dagEditor/dagCanvas.html',
    scope: {
      operatorClasses: '=',
      app: '=',
      selected: '='
    },
    link: function(scope, element){

      function generateNewName(key, collection, defaultName) {
        var i = 1;
        var name = defaultName + ' ' + i;
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
       * that got dropped onto the canvas.
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
          x: Math.max(0, x),
          y: Math.max(0, y),
          properties: {},
          inputPorts: copyPorts(opClass.inputPorts, 'input'),
          outputPorts: copyPorts(opClass.outputPorts, 'output')
        };
        scope.app.operators.push(operator);
        scope.$emit('selectEntity', 'operator', operator);
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
        return stream;

      }

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
        scope.$broadcast('connectionDetached', info.connection);
      });

      $jsPlumb.bind('connectionMoved', function(info, originalEvent) {
        $log.info('Stream connection moved:' , info, originalEvent);
        scope.$broadcast('connectionDetached', info.connection, true);
      });




      // Sets up the droppable state of the canvas.
      element.droppable({

        /**
         * Listens for operator classes being dropped
         * onto the canvas.
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
          if (dragEl.hasClass('operator-class') && dropEl.hasClass('dag-canvas')) {
            var opClass = getClass(dragEl.data('classname'));
            $log.info('Operator class dropped on DAG canvas: ', opClass);
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
    var cos = Math.cos(angle)
    var a = h * cos
    return 0.5 + a;
  }

  function getXPosition(incident, len, idx) {
    var theta = Math.PI / (len + 1);
    var angle = theta * (idx + 1);
    var h = 0.5;
    var sin = Math.sin(angle)
    var o = h * sin
    return 0.5 + incident * o;
  }

  function setPortEndpoints(operator, element, scope) {

    var endpoints = [];

    _.each(portTypes, function(type, portKey) {

      var ports = operator[portKey];

      if (!ports || !ports.length) {
        return true;
      }

      for (var i = 0, len = ports.length; i < len; i++) {
        var port = ports[i];
        var y_pos = getYPosition(len, i);
        // var x_pos = y_pos;
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

        var endpoint = $jsPlumb.addEndpoint(element, endpointOptions, type.options);
        var label = endpoint.getOverlay('label');
        label.setLabel(port.name);

        // Set better location for labels
        var width = $(label.getElement()).outerWidth();
        var x_pos;
        var radius = type.options.paintStyle.radius;
        if (type.options.paintStyle.lineWidth) {
          radius += type.options.paintStyle.lineWidth;
        }
        x_pos = width / (radius * 4);
        x_pos += type.position + 0.3;
        x_pos *= type.incident;
        // label.setLocation([leftOffset + 'px', 0.5]);
        label.setLocation([ x_pos , 0.5 ]);

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
          $log.info('Operator moved on DAG canvas: ', position, scope.operator);
        }
      });

      // Set the ports as anchors/endpoints
      scope.endpoints = setPortEndpoints(scope.operator, element, scope);
      
      // Start by editing name
      scope.editName({
        target: element.find('.dag-operator-name')[0]
      }, scope.operator);

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

.directive('dagStream', function($log, settings) {
  return {
    link: function(scope) {

      // Add dag-stream class
      scope.connection.addClass('dag-stream');
      
      var overlay;

      // First check for existing
      overlay = scope.connection.getOverlay('streamLabel');

      if (!overlay) {
        // Set the stream label
        scope.connection.addOverlay(['Label', { label: scope.stream.name, id: 'streamLabel', cssClass: 'stream-label' }]);  
        overlay = scope.connection.getOverlay('streamLabel');
      }

      // Update label as needed
      scope.$watch('stream.name', function(name) {
        if (name) {
          overlay.setLabel(name);
        }
      });

      // Update cssClass as locality changes
      scope.$watch('stream.locality', function(locality) {
        scope.connection.removeClass(settings.STREAM_LOCALITIES.join(' '));
        if (locality) {
          scope.connection.addClass(locality);
        }
      });

      // Watch to see if the selected stream is this one
      scope.$watch('selected', function(selected) {
        if (selected === scope.stream) {
          overlay.addClass('selected');
          scope.connection.addClass('selected');
        }
        else {
          overlay.removeClass('selected');
          scope.connection.removeClass('selected');
        }
      });

      // Listen for clicks on the connection
      scope.connection.bind('click', function(conn, event) {
        event.stopPropagation();
        scope.$emit('selectEntity', 'stream', scope.stream);
      });

      // Listen for double clicks on label, focus on name field in
      // inspector.
      overlay.bind('dblclick', function() {
        var $el = $('form[name="dag_stream_inspector"] input[name="name"]');
        var el = $el[0];
        if ($el) {
          $el.parent().effect('bounce', {}, 'slow');
          $el.focus();
          el.setSelectionRange(0, 9999);
        }
      });

      scope.$on('connectionDetached', function(event, connection) {
        if (connection === scope.connection) {

          // Remove all listeners
          connection.unbind();
          overlay.unbind();

          // Check if sink is there
          var index;
          var sink = _.find(scope.stream.sinks, function(s, i) {
            index = i;
            return s.connection === connection;
          });

          // If so, remove it
          if (sink) {
            scope.stream.sinks.splice(index, 1);
          }

          // If this was the only sink, remove the stream
          if (scope.stream.sinks.length === 0) {
            $log.info('Stream removed from app: ', scope.stream);
            var streamIndex = scope.app.streams.indexOf(scope.stream);
            if (streamIndex > -1) {
              scope.app.streams.splice(streamIndex, 1);
              scope.$emit('selectEntity'); // deselect all
            } else {
              $log.warn('Stream expected to be in app.streams, but was not found! app.streams: ', scope.app.streams, 'stream: ', scope.stream);
            }
          }
          scope.stream = null;

          // Defer destruction of this scope
          _.defer(function() {
            scope.$destroy();
          });
        }
      });

    }
  };
})

.directive('dagPort', function() {
  return {
    link: function(scope) {
      
      // set the port class
      scope.endpoint.addClass('dag-port');

      // get the overlay
      var overlay = scope.endpoint.getOverlay('label');

      // Watch to see if selected is this port
      scope.$watch('selected', function(selected) {
        if (selected === scope.port) {
          // debugger;
          scope.endpoint.addClass('selected');
          overlay.addClass('selected');
        }
        else {
          scope.endpoint.removeClass('selected');
          overlay.removeClass('selected');
        }
      });

      // Set click listener to endpoint
      scope.endpoint.bind('click', function(endpoint, event) {
        event.stopPropagation();
        scope.$emit('selectEntity', 'port', scope.port);
      });

      scope.endpoint.bind('destroy', function() {
        scope.$destroy();
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
        title: dtText.get('Delete this operator?'),
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
})

// Controller: Inspector for application
.controller('DagAppInspectorCtrl', function() {

})

// Controller: Inspector for operator
.controller('DagOperatorInspectorCtrl', function($scope) {
  $scope.canSetFilter = function(prop) {
    return prop.canSet;
  };
})

// Controller: Inspector for stream
.controller('DagStreamInspectorCtrl', function() {

})

.controller('DagPortInspectorCtrl', function($scope, settings) {
  $scope.PORT_ATTRIBUTES = settings.PORT_ATTRIBUTES;
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