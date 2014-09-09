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

angular.module('app.pages.dev.packages.package.dagEditor.mockOperatorsData', [])
.factory('mockOperatorsData', function() {
  return [
    { 
      'name': 'InputOperator',
      'description': 'Takes some input.',
      'categories': [ 'messaging', 'input' ],
      'outputPorts': [
        { 
          'name': 'output', 
          'type': 'String',
          'optional': false
        },
        { 
          'name': 'output2long name', 
          'type': 'String',
          'optional': false
        }
      ],
      'properties': [
        { 
          'name':'topic',
          'canGet': true,
          'canSet': true,
          'type':'String',
          'description': 'Connects the input stream to the DAG.'
        }
      ]
    },
    { 
      'name': 'JsonParseOperator',
      'description': 'Parses JSON strings into a one-level-deep hash map.',
      'categories': [ 'parse', 'transform' ],
      'inputPorts': [
        {
          'name': 'long input port',
          'type': 'String',
          'optional': false
        }
      ],
      'outputPorts': [ 
        { 
          'name': 'output', 
          'type': 'HashMap<String, Object>',
          'optional': false
        }
      ],
      'properties': []
    },
    {
      'name': 'DimensionsComputationOperator',
      'description': 'Computes aggregate metrics.',
      'categories': [ 'transform', 'aggregate' ],
      'inputPorts': [
        {
          'name': 'input',
          'type': 'HashMap<String, Object>',
          'optional': false
        }
      ],
      'outputPorts': [
        { 
          'name': 'output', 
          'type': 'HashMap<String, Object>',
          'optional': false
        }
      ],
      'properties': [
        { 
          'name':'dimensions',
          'canGet': true,
          'canSet': true,
          'type':'String',
          'description': 'The dimension combinations to aggregate on.'
        },
        {
          'name':'metrics',
          'canGet': true,
          'canSet': true,
          'type':'String',
          'description': 'The metrics to aggregate.'
        },
        {
          'name':'nonsettable_property',
          'canGet': true,
          'canSet': false,
          'type':'String',
          'description': 'The metrics to aggregate.'
        }
      ]
    },
    {
      'name': 'HDFSStorageOperator',
      'description': 'Stores tuples in HDFS.',
      'categories': [ 'output', 'storage', 'hdfs' ],
      'inputPorts': [
        {
          'name': 'input',
          'type': 'HashMap<String, Object>',
          'optional': false
        }
      ],
      'properties': [
        { 
          'name':'path',
          'canGet': true,
          'canSet': true,
          'type':'String',
          'description': 'The path in HDFS to put the files.'
        },
        {
          'name':'filename',
          'canGet': true,
          'canSet': true,
          'type':'String',
          'description': 'The name of the file to be created in HDFS.'
        }
      ]
    },
    {
      'name': 'WebSocketOutputOperator',
      'description': 'Publishes WebSocket messages on the specified topic.',
      'categories': [ 'output', 'websocket' ],
      'inputPorts': [
        {
          'name': 'input',
          'type': 'HashMap<String, Object>',
          'optional': false
        }
      ],
      'properties': [
        { 
          'name':'host',
          'canGet': true,
          'canSet': true,
          'type':'String',
          'description': 'The host to push WebSocket messages to.'
        },
        {
          'name':'topic',
          'canGet': true,
          'canSet': true,
          'type':'String',
          'description': 'The topic name to publish on.'
        }
      ]
    },
  ];
});