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

angular.module('app.pages.dev.packages.package.dagEditor.services.thawDagModel', [
  'app.pages.dev.packages.package.dagEditor.services.dagEditorOptions',
  'app.components.services.jsPlumb'
])

.factory('thawDagModel', function(dagEditorOptions, $log, $jsPlumb) {
  // load data from frozenModel back into the scope
  function thawDagModel(frozenModel, scope, dagEditorOptions) {
    // no frozenModel stored, so bail
    if (!frozenModel) { return false; }

    $log.info('Thawing DAG Model');

    // set flag so other parts of the app know that we are thawing
    scope.app.thawing = true;

    // empty out streams
    _.each($jsPlumb.getAllConnections(), function(connection) {
      if (!!connection) {
        $jsPlumb.detach(connection);
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
        return operator.name === frozenOperator.class;
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
      _.each(['input', 'output'], function(portType) {
        // handle input or output ports
        var portList = portType === 'input' ? opClass.inputPorts : opClass.outputPorts;
        newOperator[portType + 'Ports'] = _.map(portList, function(port) {
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
      $('#dag-canvas .dag-operator').each(function() {
        _.each($jsPlumb.getEndpoints(this), function(endpoint) {
          if (endpoint_map[endpoint.operator.name] === undefined) {
            endpoint_map[endpoint.operator.name] = {};
          }
          endpoint_map[endpoint.operator.name][endpoint.port.name] = endpoint;
        });
      });

      // call $jsPlumb API method to make connections
      _.each(frozenModel.streams, function(frozenStream) {
        _.each(frozenStream.sinks, function(frozenSink) {
          $jsPlumb.connect({
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
            return appStream.source.operator.name === frozenStream.source.operatorName &&
              appStream.source.port.name === frozenStream.source.portName;
          });
          appStream.name = frozenStream.name;
          appStream.locality = frozenStream.locality;
        });

        // All done now

        // the last operator added ends up being selected
        scope.$emit('selectEntity'); // deselect all

        // unset the thawing flag then trigger a freeze
        scope.app.thawing = false;
        scope.freeze();
      });

      $log.info('Thaw Complete');
    });
  }
  return thawDagModel;
});
