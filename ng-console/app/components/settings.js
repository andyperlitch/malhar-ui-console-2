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

angular.module('dtConsole.settings', [])
  .constant('settings', {
    //wsRoot: 'http://localhost:3000',
    alertUrlRoot: '/alerts',
    GATEWAY_API_VERSION: 'v1',
    maxAlertActions: 3,
    statusOrder: ['RUNNING','FAILED','FINISHED','KILLED'],
    visibility_timeout: 20000,
    urls: {

      Application              :'applications',
      ClusterMetrics           :'cluster/metrics',
      ConfigProperty           :'config/properties',
      ConfigIssue              :'config/issues',
      LogicalPlan              :'applications/:appId/logicalPlan',
      PhysicalPlan             :'applications/:appId/physicalPlan',
      Operator                 :'applications/:appId/physicalPlan/operators',
      Port                     :'applications/:appid/physicalPlan/operators/:operatorId/ports',
      Container                :'applications/:appId/physicalPlan/containers',
      Alert                    :'applications/:appId/alerts',
      AppRecordings            :'applications/:appId/recordings',
      Recording                :'applications/:appId/physicalPlan/operators/:operatorId/recordings',
      RecordingTuples          :'applications/:appId/physicalPlan/operators/:operatorId/recordings/:startTime/tuples',
      AlertTemplate            :'alertTemplates',
      OpProperties             :'applications/:appId/logicalPlan/operators/:operatorName/properties',
      Jar                      :'jars',
      JarApps                  :'jars/:fileName/applications',
      JarDependencies          :'jars/:fileName/dependencyJars',
      DependencyJar            :'dependencyJars',
      License                  :'licenses/files/current',
      LicenseAgent             :'licenses/agents',
      LicenseFiles             :'licenses/files',
      LicenseRequest           :'licenses/request',
      LicenseLastRequest       :'licenses/lastRequest',
      ConfigIPAddresses        :'config/ipAddresses',
      GatewayInfo              :'about',
      HadoopLocation           :'config/hadoopInstallDirectory'

    },
    
    actions: {
      startOpRecording         :'applications/:appId/physicalPlan/operators/:operatorId/recordings/start',
      stopOpRecording          :'applications/:appId/physicalPlan/operators/:operatorId/recordings/stop',
      startPortRecording       :'applications/:appId/physicalPlan/operators/:operatorId/ports/:portName/recordings/start',
      stopPortRecording        :'applications/:appId/physicalPlan/operators/:operatorId/ports/:portName/recordings/stop',
      shutdownApp              :'applications/:appId/shutdown',
      killApp                  :'applications/:appId/kill',
      killContainer            :'applications/:appId/physicalPlan/containers/:containerId/kill',
      launchApp                :'jars/:fileName/applications/:appName/launch',
      specifyDepJars           :'jars/:fileName/dependencyJars',
      restartGateway           :'config/restart'
    },
    
    topics: {

      ClusterMetrics           :'cluster.metrics',
      Applications             :'applications',
      Application              :'applications.:appId',
      Operators                :'applications.:appId.operators',
      Containers               :'applications.:appId.containers',
      TupleRecorder            :'tupleRecorder.:startTime'

    },

    dag: {
      edges: {
        NONE: {
          displayName: 'NOT ASSIGNED',
          dasharray: '5,2'
        },
        THREAD_LOCAL: {
          dasharray: null
        },
        CONTAINER_LOCAL: {
          dasharray: '1,1'
        },
        NODE_LOCAL: {
          dasharray: '1,3'
        },
        RACK_LOCAL: {
          dasharray: '1,5'
        }
      }
    }
  });
