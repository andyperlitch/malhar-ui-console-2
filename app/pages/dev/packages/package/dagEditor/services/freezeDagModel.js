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

angular.module('app.pages.dev.packages.package.dagEditor.services.freezeDagModel', [])

.factory('freezeDagModel', function($log) {
  // return frozen (transformed to API spec) copy of app model
  function freezeDagModel(scope) {
    // due to the way events are wired up, we can be thawing and trigger a call to freeze
    if (scope.thawing) { return; }

    // set up the skeleton object to fill with cherry-picking from our
    // internal operator object
    var frozenModel = {
      'displayName': scope.app.displayName,
      'description': scope.app.description,
      // collect the list of operators
      'operators': _.map(scope.app.operators, function(operator)
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
          'name': operator.name,
          'attributes':  _(operator.attributes).clone(),
          'class': operator.opClass.name,
          // collect the list of operator ports
          'ports': _.map(allports, function (port) {
            return {
              'name': port.name,
              'attributes': _(port.attributes).clone()
            };
          }),
          'properties': _(operator.properties).clone(),
          'x': operator.x,
          'y': operator.y
        };
      }),
      // collect the list of streams
      'streams': _.map(scope.app.streams, function(stream) {
        return {
          'name': stream.name,
          'locality': stream.locality,
          // collect the list of sinks
          'sinks': _.map(stream.sinks, function(sink) {
            return {
                'operatorName': sink.operator.name,
                'portName': sink.port.name
            };
          }),
          'source': {
            'operatorName': stream.source.operator.name,
            'portName': stream.source.port.name
          }
        };
      })
    };
    $log.info('Froze DAG Model', frozenModel);

    return frozenModel;
  }
  return freezeDagModel;
});
