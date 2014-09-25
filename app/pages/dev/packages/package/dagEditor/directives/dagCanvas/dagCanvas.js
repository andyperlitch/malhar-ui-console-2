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

angular.module('app.pages.dev.packages.package.dagEditor.directives.dagCanvas', [
  'app.components.services.jsPlumb',
  'app.settings',
  'monospaced.mousewheel'
])

// Directive: DAG editor canvas
.directive('dagCanvas', function(settings, $log, $jsPlumb, $compile, $document) {

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
  function getClass(name, scope) {
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
  function addOperator(opClass, x, y, scope) {
    var operator = {
      name: generateNewName('name', scope.app.operators, settings.dagEditor.DEFAULT_OPERATOR_NAME),
      opClass: opClass,
      x: x,
      y: y,
      properties: {},
      inputPorts: copyPorts(opClass.inputPorts, 'input'),
      outputPorts: copyPorts(opClass.outputPorts, 'output')
    };
    scope.app.operators.push(operator);
    scope.$emit('selectEntity', 'operator', operator);
  }

  function addStream(sourceOperator, sourcePort, sinkOperator, sinkPort, sinkConnection, scope) {
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

  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'pages/dev/packages/package/dagEditor/directives/dagCanvas/dagCanvas.html',
    scope: {
      operatorClasses: '=',
      app: '=',
      selected: '='
    },
    link: function(scope, element){

      /**
       * Listeners for connections
       */
      $jsPlumb.bind('connection', function(info, originalEvent) {
        $log.info('Stream connection made: ', info, originalEvent);
        var sourceOperator = info.sourceEndpoint.operator;
        var sourcePort = info.sourceEndpoint.port;
        var sinkOperator = info.targetEndpoint.operator;
        var sinkPort = info.targetEndpoint.port;

        addStream(sourceOperator, sourcePort, sinkOperator, sinkPort, info.connection, scope);
      });

      $jsPlumb.bind('connectionDetached', function(info, originalEvent) {
        $log.info('Stream connection detached: ', info, originalEvent);
        scope.$broadcast('connectionDetached', info.connection);
      });

      $jsPlumb.bind('connectionMoved', function(info, originalEvent) {
        $log.info('Stream connection moved:' , info, originalEvent);
        scope.$broadcast('connectionDetached', info.connection, true);
      });

      /**
       * Sets up the droppable state of the canvas.
       */
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
            var opClass = getClass(dragEl.data('classname'), scope);
            $log.info('Operator class dropped on DAG canvas: ', opClass);
            var droppedOffset = ui.offset;
            var droppableOffset = dropEl.offset();
            var x = droppedOffset.left - droppableOffset.left;
            var y = droppedOffset.top - droppableOffset.top;

            addOperator(opClass, x / scope.zoom - scope.translate[0], y / scope.zoom - scope.translate[1], scope);
          }

          scope.$apply();
        }
      });

      /**
       * Keyboard/Zoom controls
       */
      scope.zoom = 1;
      scope.translate = [0,0];
      scope.keysPressed = {};

      scope.captureKeydown = function(e) {
        if (e.which === 16) {
          scope.keysPressed.shift = true;
        }
        if (e.which === 18) {
          scope.keysPressed.option = true;
        }
        if (e.which === 32) {
          // check input, textarea, select
          var tagname = e.target.tagName && e.target.tagName.toLowerCase();
          if (['textarea', 'input', 'select'].indexOf(tagname) === -1) {
            e.preventDefault();
            e.stopPropagation();
            scope.keysPressed.spacebar = true;
          }
        }
        scope.$digest();
      };

      scope.captureKeyup = function(e) {
        if (e.which === 16) {
          scope.keysPressed.shift = false;
        }
        if (e.which === 18) {
          scope.keysPressed.option = false;
        }
        if (e.which === 32) {
          scope.keysPressed.spacebar = false;
        }
        scope.$digest();
      };

      $document.on('keydown', scope.captureKeydown);
      $document.on('keyup', scope.captureKeyup);

      // methods for zoom in/out buttons
      scope.zoomIn = function() {
        var canvasCenter = [element.width() / 2, element.height() / 2];
        scope.setZoom(settings.dagEditor.ZOOM_STEP_CLICK, canvasCenter);
      };
      scope.zoomOut = function() {
        var canvasCenter = [element.width() / 2, element.height() / 2];
        scope.setZoom(-1 * settings.dagEditor.ZOOM_STEP_CLICK, canvasCenter);
      };

      scope.setZoom = function(zoomDelta, controlPoint) {

        // The "real" point on the dag canvas coordinate system
        // realPoint = controlPoint/zoom - translate
        var realPoint = [
          controlPoint[0]/scope.zoom - scope.translate[0],
          controlPoint[1]/scope.zoom - scope.translate[1]
        ];

        var newZoom = scope.zoom + zoomDelta;
        newZoom = Math.min(newZoom, settings.dagEditor.MAX_ZOOM_LEVEL);
        newZoom = Math.max(newZoom, settings.dagEditor.MIN_ZOOM_LEVEL);

        // After zoom, the realPoint should equal the controlPoint
        // translate = controlPoint - realPoint*zoom
        var newTranslate = [
          controlPoint[0]/newZoom - realPoint[0],
          controlPoint[1]/newZoom - realPoint[1]
        ];

        // Update zoom and translate on scope
        scope.zoom = newZoom;
        scope.translate = newTranslate;
        scope.updateZoomAndTransform();
      };

      scope.updateZoomAndTransform = function() {
        var el = $jsPlumb.getContainer();
        var p = [ 'webkit', 'moz', 'ms', 'o' ],
            s = 'scale(' + scope.zoom + ') translate(' + (scope.translate[0]) + 'px, ' + (scope.translate[1]) + 'px)',
            oString = '0% 0%';

        for (var i = 0; i < p.length; i++) {
          el.style[p[i] + 'Transform'] = s;
          el.style[p[i] + 'TransformOrigin'] = oString;
        }

        el.style.transform = s;
        el.style.transformOrigin = oString;
        $jsPlumb.setZoom(scope.zoom);
      };

      scope.onZoomWheel = function($event, $delta, $deltaX, $deltaY) {
        $event.preventDefault();
        $event.stopPropagation();
        var delta = $deltaY * settings.dagEditor.ZOOM_STEP_MOUSEWHEEL;
        var controlCoords = [$event.offsetX, $event.offsetY];
        scope.setZoom(delta, controlCoords);
      };

      scope.onZoomClick = function($event) {
        $event.preventDefault();
        $event.originalEvent.preventDefault();
        $event.stopPropagation();
        var delta = (scope.keysPressed.shift ? -1 : 1) * settings.dagEditor.ZOOM_STEP_CLICK;
        var controlCoords = [$event.offsetX, $event.offsetY];
        scope.setZoom(delta, controlCoords);
      };

      scope.onPanWheel = function($event, $delta, $deltaX, $deltaY) {
        $event.preventDefault();
        scope.translate = [
          scope.translate[0] - $deltaX/scope.zoom,
          scope.translate[1] + $deltaY/scope.zoom
        ];
        scope.updateZoomAndTransform();
      };

      scope.grabPanCanvas = function($event) {
        $event.preventDefault();
        var anchor = [$event.offsetX, $event.offsetY];
        var initTranslate = scope.translate.slice();

        var mousemove = function(e) {
          var delta = [e.offsetX - anchor[0], e.offsetY - anchor[1]];
          scope.translate = [
            initTranslate[0] + delta[0]/scope.zoom,
            initTranslate[1] + delta[1]/scope.zoom
          ];
          scope.updateZoomAndTransform();
        };
        var mouseup = function() {
          $document.off('mousemove', mousemove);
          $document.off('mousemove', mouseup);
        };
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      };

      scope.fitToContent = function() {
        if (!scope.app.operators.length) {
          scope.zoom = 1;
          scope.translate = [0,0];
          scope.updateZoomAndTransform();
          return;
        }

        var operatorDiameter = element.find('.dag-operator').outerWidth();
        var firstOperator = scope.app.operators[0];

        if (scope.app.operators.length === 1) {
          var halfViewportWidth = (element.width() / 2) - operatorDiameter / 2;
          var halfViewportHeight = (element.height() / 2) - operatorDiameter / 2;
          scope.zoom = 1;
          scope.translate = [ -firstOperator.x + halfViewportWidth , -firstOperator.y + halfViewportHeight ];
          scope.updateZoomAndTransform();
          return;
        }

        var minX = firstOperator.x;
        var minY = firstOperator.y;
        var maxX = firstOperator.x;
        var maxY = firstOperator.y;

        _.each(scope.app.operators, function(o) {
          minX = Math.min(minX, o.x);
          maxX = Math.max(maxX, o.x);
          minY = Math.min(minY, o.y);
          maxY = Math.max(maxY, o.y);
        });


        var targetLabelWidths = element.find('.endpointTargetLabel').map(function(i,el) {
          return $(el).width();
        });
        var sourceLabelWidths = element.find('.endpointSourceLabel').map(function(i,el) {
          return $(el).width();
        });


        minX -= Math.max.apply(null, targetLabelWidths) * 2;
        maxX += operatorDiameter + Math.max.apply(null, sourceLabelWidths) * 2;
        maxY += operatorDiameter;

        scope.setViewBox([minX, minY], [maxX,maxY]);
      };

      scope.setViewBox = function(topLeft, bottomRight) {

        var boxWidth = bottomRight[0] - topLeft[0];
        var boxHeight = bottomRight[1] - topLeft[1];
        var boxRelHeight = boxHeight/boxWidth;
        var boxRelWidth = 1/boxRelHeight;

        var viewportWidth = element.width();
        var viewportHeight = element.height();
        var viewportRelHeight = viewportHeight/viewportWidth;
        var viewportRelWidth = 1/viewportRelHeight;


        // determine dominant dimension (the side that gets fit)
        // and recessive dimension (the side that gets centered)
        // 
        //  +-------------------------+
        //  |                         |
        //  |+-----------------------+| <-+ 
        //  ||                       ||   |
        //  ||                       ||   |--= recessive
        //  ||                       ||   |
        //  ||                       ||   |
        //  |+-----------------------+| <-+
        //  |                         |
        //  +-------------------------+
        //   ^                       ^
        //   |                       |
        //   +-----------------------+
        //               |
        //            dominant

        var dominant = 0;  // default to width
        var recessive = 1; // default to height
        var recessiveBoxRealLength = boxHeight;
        var recessiveBoxRelLength = boxRelHeight;
        var recessiveViewportRelLength = viewportRelHeight;
        var newZoom =  viewportWidth / boxWidth;


        if (boxRelHeight > viewportRelHeight) {
          dominant = 1;
          recessive = 0;
          recessiveBoxRealLength = boxWidth;
          recessiveBoxRelLength = boxRelWidth;
          recessiveViewportRelLength = viewportRelWidth;
          newZoom = viewportHeight / boxHeight;
        }

        // Set the translate
        var newTranslate = [];
        newTranslate[dominant] = -topLeft[dominant];
        var adjustedRecessiveLength = (Math.abs(topLeft[recessive] - bottomRight[recessive])/recessiveBoxRelLength)*recessiveViewportRelLength;
        var amountToAdjust = (adjustedRecessiveLength - recessiveBoxRealLength) / 2;
        newTranslate[recessive] = -(topLeft[recessive] - amountToAdjust);


        // Set the zoom
        scope.zoom = newZoom;

        scope.translate = newTranslate;
        scope.updateZoomAndTransform();
      };

      scope.$on('firstLoadComplete', scope.fitToContent);

      // receive the message from dagEditor that the save/launch state has changed
      scope.$on('saveLaunchStateChange', function(event, saveLaunchState) {
        scope.saveLaunchState = saveLaunchState;
      });

      // bubble up launch request to parent scope
      scope.launch = function() {
        scope.$emit('launchRequest');
      };

      scope.$on('$destroy', function() {
        $jsPlumb.unbind();
        $document.off('keydown', scope.captureKeydown);
        $document.off('keyup', scope.captureKeyup);
      });

    }
  };
});
