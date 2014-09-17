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
  'ui.grid',
  'app.components.resources.PackageOperatorClassCollection',
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

.factory('freezeDagModel', function($log) {
  // return frozen (transformed to API spec) copy of app model
  function freezeDagModel(scope) {
    // due to the way events are wired up, we can be thawing and trigger a call to freeze
    if (scope.thawing) { return; }

    // set up the skeleton object to fill with cherry-picking from our
    // internal operator object
    var frozenModel = {
      "displayName": undefined,
      "description": scope.app.description,
      // collect the list of operators
      "operators": _.map(scope.app.operators, function(operator)
      {
        // make one array from output and input ports
        var allports = [];
        if (!!operator.outputPorts) {
          allports = allports.concat(operator.outputPorts);
        }
        if (!!operator.inputPorts) {
          allports = allports.concat(operator.inputPorts);
        }

        // hash representing one operator
        return {
          "name": operator.name,
          "attributes":  {},
          "class": operator.opClass.name,
          // collect the list of operator ports
          "ports": _.map(allports, function (port) {
            return {
              "name": port.name,
              "attributes": _(port.attributes).clone()
            };
          }),
          "properties": _(operator.properties).clone(),
          "x": operator.x,
          "y": operator.y
        };
      }),
      // collect the list of streams
      "streams": _.map(scope.app.streams, function(stream) {
        return {
          "name": stream.name,
          "locality": stream.locality,
          // collect the list of sinks
          "sinks": _.map(stream.sinks, function(sink) {
            return {
                "operatorName": sink.operator.name,
                "portName": sink.port.name
            };
          }),
          "source": {
            "operatorName": stream.source.operator.name,
            "portName": stream.source.port.name
          }
        };
      })
    };
    $log.info("Froze DAG Model", frozenModel);

    return frozenModel;
  }
  return freezeDagModel;
})

.factory('thawDagModel', function(dagEditorOptions, $log) {
  // load data from frozenModel back into the scope
  function thawDagModel(frozenModel, scope, dagEditorOptions) {
    // no frozenModel stored, so bail
    if (!frozenModel) { return false; }

    $log.info("Thawing DAG Model");

    scope.thawing = true;

    // empty out streams
    _.each(jsPlumb.getAllConnections(), function(connection) {
      if (!!connection) {
        jsPlumb.detach(connection);
      }
    });

    // empty out operators
    scope.app.operators = [];

    // set up global app scope things
    scope.app.description = frozenModel.description;

    // set up operators by pushing onto app.operators
    _.each(frozenModel.operators, function(frozenOperator) {
      // find original operator class
      var opClass = _.find(scope.operatorClasses, function(operator) {
        return operator.name == frozenOperator.class;
      });
      // add operator to the canvas
      var newOperator = {
        name: frozenOperator.name,
        x: frozenOperator.x,
        y: frozenOperator.y,
        properties: _(frozenOperator.properties).clone(),
        opClass: opClass,
      };

      // now set up ports in the new operator
      _.each(["input", "output"], function(portType) {
        // handle input or output ports
        newOperator[portType + "Ports"] = _.map( portType == "input" ? opClass.inputPorts : opClass.outputPorts, function(port) {
          var frozenPort = _.find(frozenOperator.ports, function(frozenPort) {
            return frozenPort.name === port.name;
          });
          return {
            name: port.name,
            attributes: frozenPort.attributes,
            type: port.type,
            optional: port.optional,
            portType: portType,
          };
        });
      });
      scope.app.operators.push(newOperator);
    });

    // need to defer the next block so that Angular can get itself situated
    // after pushing the operators onto app.operators above
    _.defer(function() {
      // build a map of operator -> ports -> endpoint
      var endpoint_map = {};
      $("#dag-canvas .dag-operator").each(function(idx) {
        _.each(jsPlumb.getEndpoints(this), function(endpoint) {
          if (endpoint_map[endpoint.operator.name] === undefined) {
            endpoint_map[endpoint.operator.name] = {};
          }
          endpoint_map[endpoint.operator.name][endpoint.port.name] = endpoint;
        });
      });

      // call jsPlumb API method to make connections
      _.each(frozenModel.streams, function(frozenStream) {
        _.each(frozenStream.sinks, function(frozenSink) {
          // get source and target endpoints
          var source = endpoint_map[frozenStream.source.operatorName][frozenStream.source.portName];
          var target = endpoint_map[frozenSink.operatorName][frozenSink.portName];
          jsPlumb.connect({
            source: endpoint_map[frozenStream.source.operatorName][frozenStream.source.portName],
            target: endpoint_map[frozenSink.operatorName][frozenSink.portName]
          }, dagEditorOptions.outputEndpointOptions);
          // TODO: set stream name and locality from frozen structure
        });
      });

      // need to set up stream name and locality, but must defer it so that
      // Angular can update scope.app with the stream elements created above
      _.defer(function() {
        // set up stream name and locality
        _.each(frozenModel.streams, function(frozenStream) {
          // set up app with stream objects
          var appStream = _.find(scope.app.streams, function(appStream) {
            return appStream.source.operator.name == frozenStream.source.operatorName &&
              appStream.source.port.name == frozenStream.source.portName;
          });
          appStream.name = frozenStream.name;
          appStream.locality = frozenStream.locality;
        });

        // All done now

        // the last operator added ends up being selected
        scope.$emit('selectEntity'); // deselect all

        // unset the thawing flag then trigger a freeze
        scope.thawing = false;
        scope.freeze();
      });

      $log.info("Thaw Complete");
    });
  };
  return thawDagModel;
})

// Page Controller
.controller('DagEditorCtrl', function($scope, PackageOperatorClassCollection, $routeParams, $log, settings, freezeDagModel, thawDagModel, dagEditorOptions) {

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

  // Operator Classes:
  $scope.operatorClassesResource = new PackageOperatorClassCollection({
    packageName: $routeParams.packageName,
    packageVersion: $routeParams.packageVersion
  });
  $scope.operatorClasses = $scope.operatorClassesResource.data;
  $scope.operatorClassesResource.fetch();

  // ng-grid options for operator class list
  $scope.opClassListOptions = {
    data: 'operatorClasses',
    enableFiltering: true,
    groups: ['packageName'],
    rowTemplate: 'pages/dev/packages/package/dagEditor/uiGridTemplates/rowTemplate.html',
    columnDefs: [
      // Simple (Class) Name
      {
        groupable: false,
        name: 'simpleName',
        displayName: 'class',
        field: 'simpleName'
      },
      // Package Name
      // {
      //   groupable: true,
      //   name: 'package',
      //   displayName: 'package',
      //   field: 'packageName'
      // },
      // Input Ports
      {
        name: 'inputPorts',
        field: 'inputPorts',
        displayName: 'i',
        cellTemplate: 'pages/dev/packages/package/dagEditor/uiGridTemplates/inputPortsTemplate.html',
        width: 60,
        filter: false
      },
      // Output Ports
      {
        name: 'outputPorts',
        field: 'outputPorts',
        displayName: 'o',
        cellTemplate: 'pages/dev/packages/package/dagEditor/uiGridTemplates/outputPortsTemplate.html',
        width: 60,
        filter: false
      },
    ]
  };

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

  $scope.thaw = function() {
    thawDagModel($scope.frozenModel, $scope, dagEditorOptions);
  };
  $scope.freeze = function() {
    $scope.frozenModel = freezeDagModel($scope);
  };

  // PUT the frozen model to the gateway
  var saveFrozen = function() {
    console.log("SAVE THAT DAG, YO.", $scope.frozenModel);
  };

  // debounced save function
  var debouncedSaveFrozen = _.debounce(saveFrozen, 1000);

  $scope.$watch("app", function() {
    // update the representation we send to the server
    $scope.freeze();
    debouncedSaveFrozen();
  }, true); // true set here to do deep equality check on $scope
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
            label:'',
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
        portType: portType,
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
            ]
          };
          // push the stream into the app scope
          scope.app.streams.push(stream);
        }

        // Stream exists, check for sink
        var sink = _.find(stream.sinks, function(k) {
          return k.operator === sinkOperator && k.port === sinkPort;
        });

        // Add sink if one doesn't exist
        if (!sink) {
          stream.sinks.push({
            operator: sinkOperator,
            port: sinkPort,
            connection_id: sinkConnection.id
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
        zIndex: 1,
        helper: function(event) {
          var classname = event.currentTarget.getAttribute('data-classname');
          return $('<div class="dag-operator selected">'+
            '<h4 class="dag-operator-name">Operator</h4>'+
            '<h5 class="operator-class-name">' + classname + '</h5>'+
          '</div>');
        },
        appendTo: 'body',
        cursorAt: { left: 130/2, top: 130/2 }
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

        var endpoint = $jsPlumb.addEndpoint(element, endpointOptions, lastOptions);
        var label = endpoint.getOverlay('label');
        label.setLabel(port.name);

        // Set better location for labels
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
      //scope.editName({
      //  target: element.find('.dag-operator-name')[0]
      //}, scope.operator);

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
            return s.connection_id === connection.id;
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

      scope.endpoint.bind('mouseenter', function() {
        overlay.addClass('hover');
      });

      scope.endpoint.bind('mouseleave', function() {
        overlay.removeClass('hover');
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
