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
      x: Math.max(0, x),
      y: Math.max(0, y),
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
            var opClass = getClass(dragEl.data('classname'), scope);
            $log.info('Operator class dropped on DAG canvas: ', opClass);
            var droppedOffset = ui.offset;
            var droppableOffset = dropEl.offset();
            var x = droppedOffset.left - droppableOffset.left;
            var y = droppedOffset.top - droppableOffset.top;

            addOperator(opClass, x, y, scope);
          }

          scope.$apply();
        }
      });

      scope.$on('$destroy', function() {
        $jsPlumb.unbind();
      });
    }
  };
});