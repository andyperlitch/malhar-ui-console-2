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

      scope.captureKeydown = function(e) {
        if (e.which === 8) {
          // backspace
          if (document.activeElement !== document.body) {
            // something is focused, so do the normal behavior
            return;
          }
          // nothing was focused, so hijack the key to maybe delete an operator or stream
          e.preventDefault();
          // send an event up the scope chain, to be received in dagEditor
          scope.$emit('deleteSelectedEntity');
        }
        scope.$digest();
      };

      $document.on('keydown', scope.captureKeydown);

      // methods for zoom in/out buttons
      scope.zoomIn = function() {
        var canvasCenter = [element.width() / 2, element.height() / 2];
        scope.setZoom(settings.dagEditor.ZOOM_STEP_CLICK, canvasCenter);
      };
      scope.zoomOut = function() {
        var canvasCenter = [element.width() / 2, element.height() / 2];
        scope.setZoom(-1 * settings.dagEditor.ZOOM_STEP_CLICK, canvasCenter);
      };

      /**
       * Converts a point on the pixel coordinate plane to
       * the real coordinate plane.
       * 
       * @param  {Array}  point  The point from the pixel coordinate plane, e.g. from mouseclick
       * @return {Array}         The coordinate in the real plane
       */
      scope.pixelToRealCoordinate = function(point) {
        return [
          point[0]/scope.zoom - scope.translate[0],
          point[1]/scope.zoom - scope.translate[1]
        ];
      };

      /**
       * Given a zoom change and a control point (in pixel coordinates)
       * this sets the zoom level and adjusted translate.
       * 
       * @param {number} zoomDelta      Amount of change to the zoom level
       * @param {Array}  controlPoint   The pixel coordinate to zoom into/out of.
       */
      scope.setZoom = function(zoomDelta, controlPoint) {
        // The "real" point on the dag canvas coordinate system
        // realPoint = controlPoint/zoom - translate
        var realPoint = scope.pixelToRealCoordinate(controlPoint);

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

      /**
       * Updates the transform attribute of the "real" app canvas.
       */
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
        var pageOffset = element.offset();
        var controlCoords = [$event.pageX - pageOffset.left, $event.pageY - pageOffset.top];
        scope.setZoom(delta, controlCoords);
      };

      scope.grabPanCanvas = function($event) {
        element.addClass('panning');
        var $trg = $($event.target);
        if (!$trg.hasClass('dag-canvas') && !$trg.hasClass('real-canvas') && !$trg.hasClass('pan-control')) {
          return;
        }
        $event.preventDefault();
        var pageOffset = element.offset();
        var anchor = [$event.pageX - pageOffset.left, $event.pageY - pageOffset.top];
        var initTranslate = scope.translate.slice();

        var mousemove = function(e) {
          var delta = [
            e.pageX - pageOffset.left - anchor[0],
            e.pageY - pageOffset.top - anchor[1]
          ];
          scope.translate = [
            initTranslate[0] + delta[0]/scope.zoom,
            initTranslate[1] + delta[1]/scope.zoom
          ];
          scope.updateZoomAndTransform();
        };
        var mouseup = function() {
          element.removeClass('panning');
          $document.off('mousemove', mousemove);
          $document.off('mousemove', mouseup);
        };
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      };

      /**
       * Sets the zoom and translate to fit to the
       * whole application.
       */
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

      /**
       * Sets the zoom and translate so that the provided coordinates
       * are fit and centered on the canvas.
       * 
       * @param {Array} topLeft     The real coordinates of the top left corner of the box
       * @param {Array} bottomRight The real coordinates of the bottom right corner of the box
       */
      scope.setViewBox = function(topLeft, bottomRight) {

        // Holds width and height of box
        var boxDims = [];
        boxDims[0] = bottomRight[0] - topLeft[0];
        boxDims[1] = bottomRight[1] - topLeft[1];

        // Holds relative width and height
        var boxRelDims = [];
        boxRelDims[1] = boxDims[1]/boxDims[0];
        boxRelDims[0] = 1/boxRelDims[1];

        var viewportDims = [];
        viewportDims[0] = element.width();
        viewportDims[1] = element.height();

        var viewportRelDims = [];
        viewportRelDims[1] = viewportDims[1]/viewportDims[0];
        viewportRelDims[0] = 1/viewportRelDims[1];


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

        if (boxRelDims[1] > viewportRelDims[1]) {
          dominant = 1;
          recessive = 0;
        }

        var newZoom =  viewportDims[dominant] / boxDims[dominant];

        // Set up the translate
        var newTranslate = [];

        // Dominant is just the negative topLeft value
        newTranslate[dominant] = -topLeft[dominant];

        // Recessive: find the recessive length it would be to
        // match the height/width ratio of the actual viewport
        var adjustedRecessiveLength = (Math.abs(topLeft[recessive] - bottomRight[recessive])/boxRelDims[recessive])*viewportRelDims[recessive];

        // Adjust the recessive translate
        var amountToAdjust = (adjustedRecessiveLength - boxDims[recessive]) / 2;
        newTranslate[recessive] = -(topLeft[recessive] - amountToAdjust);

        // Check if the newZoom exceeds the max zoom level
        if (newZoom > settings.dagEditor.MAX_ZOOM_LEVEL) {
          var zoomRatio = settings.dagEditor.MAX_ZOOM_LEVEL / newZoom;
          newTranslate[dominant] += (boxDims[dominant] / zoomRatio - boxDims[dominant]) / 2;
          newTranslate[recessive] += (boxDims[recessive] / zoomRatio - boxDims[recessive]) / 2;
          newZoom = settings.dagEditor.MAX_ZOOM_LEVEL;
        }

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
      });
    }
  };
});
