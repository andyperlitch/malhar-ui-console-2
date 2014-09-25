/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
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

angular.module('app.settings', [])
  .constant('settings', {
    //wsRoot: 'http://localhost:3000',
    alertUrlRoot: '/alerts',
    GATEWAY_WEBSOCKET_HOST: null,
    GATEWAY_API_VERSION: 'v1',
    STREAM_LOCALITIES: [
      'THREAD_LOCAL',
      'CONTAINER_LOCAL',
      'NODE_LOCAL'
      // 'RACK_LOCAL'
    ],
    PORT_ATTRIBUTES: [
      { name: 'AUTO_RECORD',        type: 'Boolean', description: 'Whether or not to auto record the tuples.' },
      { name: 'PARTITION_PARALLEL', type: 'Boolean', portType: 'input', description: 
        'Input port attribute. Extend partitioning of an upstream operator w/o intermediate merge. ' +
        'Can be used to form parallel partitions that span a group of operators. ' +
        'Defined on input port to allow for stream to be shared with non-partitioned sinks. ' +
        'If multiple ports of an operator have the setting, incoming streams must track back to ' +
        'a common root partition, i.e. the operator join forks of the same origin.'
      },
      { name: 'QUEUE_CAPACITY',     type: 'Integer', description: 'Number of tuples the poll buffer can cache without blocking the input stream to the port.' },
      { name: 'SPIN_MILLIS',        type: 'Integer', description: 'Poll period in milliseconds when the port buffer reaches its limits.' },
      { name: 'UNIFIER_LIMIT',      type: 'Integer', portType: 'output', description: 
        'Attribute of output port to specify how many partitions should be merged by a single unifier instance. If the ' +
        'number of partitions exceeds the limit set, a cascading unifier plan will be created. For example, 4 partitions ' +
        'with the limit set to 2 will result in 3 unifiers arranged in 2 levels. The setting can be used to cap the ' +
        'network I/O or other resource requirement for each unifier container (depends on the specific functionality of ' +
        'the unifier), enabling horizontal scale by overcoming the single unifier bottleneck.'
      }
    ],
    maxAlertActions: 3,
    statusOrder: ['SUBMITTED','ACCEPTED','RUNNING','FAILED','FINISHED','KILLED'],
    NONENDED_APP_STATES: ['SUBMITTED','ACCEPTED','RUNNING'],
    STARTING_APP_STATES: ['SUBMITTED', 'ACCEPTED'],
    NONENDED_CONTAINER_STATES: ['ACTIVE', 'ALLOCATED'],
    STORAGE_KEY: 'datatorrent-ui-console',
    VISIBILITY_TIMEOUT: 20000,
    urls: {

      Alert                    :'/ws/:v/applications/:appId/alerts',
      AlertTemplate            :'/ws/:v/alertTemplates',
      Application              :'/ws/:v/applications',
      AppRecordings            :'/ws/:v/applications/:appId/recordings',
      ClusterMetrics           :'/ws/:v/cluster/metrics',
      ConfigIPAddresses        :'/ws/:v/config/ipAddresses',
      ConfigIssue              :'/ws/:v/config/issues',
      ConfigProperty           :'/ws/:v/config/properties',
      Container                :'/ws/:v/applications/:appId/physicalPlan/containers',
      ContainerLog             :'/ws/:v/applications/:appId/physicalPlan/containers/:containerId/logs',
      DependencyJar            :'/ws/:v/dependencyJars',
      GatewayInfo              :'/ws/:v/about',
      GatewayRestart           :'/ws/:v/config/restart',
      HadoopLocation           :'/ws/:v/config/hadoopInstallDirectory',
      Jar                      :'/ws/:v/jars',
      JarApps                  :'/ws/:v/jars/:fileName/applications',
      JarDependencies          :'/ws/:v/jars/:fileName/dependencyJars',
      License                  :'/ws/:v/licenses/files/current',
      LicenseAgent             :'/ws/:v/licenses/agents',
      LicenseFiles             :'/ws/:v/licenses/files',
      LicenseRequest           :'/ws/:v/licenses/request',
      LicenseLastRequest       :'/ws/:v/licenses/lastRequest',
      LogicalOperator          :'/ws/:v/applications/:appId/logicalPlan/operators',
      LogicalPlan              :'/ws/:v/applications/:appId/logicalPlan',
      LogicalStream            :'/ws/:v/applications/:appId/logicalPlan/streams',
      OpProperties             :'/ws/:v/applications/:appId/logicalPlan/operators/:operatorName/properties',
      PackageOperatorClass     :'/ws/:v/appPackages/:packageName/:packageVersion/operators',
      PhysicalOperator         :'/ws/:v/applications/:appId/physicalPlan/operators',
      PhysicalPlan             :'/ws/:v/applications/:appId/physicalPlan',
      Port                     :'/ws/:v/applications/:appid/physicalPlan/operators/:operatorId/ports',
      Recording                :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/recordings',
      RecordingTuples          :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/recordings/:startTime/tuples',
      StramEvent               :'/ws/:v/applications/:appId/events',
      PhysicalStream           :'/ws/:v/applications/:appId/physicalPlan/streams',
      User                     :'/ws/:v/profile/user',
      Packages                 :'/ws/:v/appPackages',
      Package                  :'/ws/:v/appPackages/:packageName/:packageVersion',
      PackageImport            :'/ws/:v/appPackages/import',
      PackageApplications      :'/ws/:v/appPackages/:packageName/:packageVersion/applications',
      PackageApplication       :'/ws/:v/appPackages/:packageName/:packageVersion/applications/:appName'
    },
    
    actions: {
      startOpRecording         :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/recordings/start',
      stopOpRecording          :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/recordings/stop',
      startPortRecording       :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/ports/:portName/recordings/start',
      stopPortRecording        :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/ports/:portName/recordings/stop',
      shutdownApp              :'/ws/:v/applications/:appId/shutdown',
      killApp                  :'/ws/:v/applications/:appId/kill',
      killContainer            :'/ws/:v/applications/:appId/physicalPlan/containers/:containerId/kill',
      launchApp                :'/ws/:v/jars/:fileName/applications/:appName/launch',
      specifyDepJars           :'/ws/:v/jars/:fileName/dependencyJars',
      restartGateway           :'/ws/:v/config/restart'
    },
    
    topics: {
      
      ClusterMetrics           :'cluster.metrics',
      Applications             :'applications',
      Application              :'applications.:id',
      PhysicalOperators        :'applications.:appId.physicalOperators',
      LogicalOperators         :'applications.:appId.logicalOperators',
      Containers               :'applications.:appId.containers',
      StramEvents              :'applications.:appId.events',
      TupleRecorder            :'tupleRecorder.:startTime'

    },

    // Page Routes
    // 
    // Used by routing definitions and 
    // by the dt-page-href directive.
    // This is the single source of truth
    // for routes.
    pages: {
      // Operations
      AppInstance              :'/ops/apps/:appId',
      Container                :'/ops/apps/:appId/logicalPlan/containers/:containerId',
      ContainerLog             :'/ops/apps/:appId/logicalPlan/containers/:containerId/logs/:logName',
      LogicalOperator          :'/ops/apps/:appId/logicalPlan/operators/:operatorName',
      LogicalStream            :'/ops/apps/:appId/logicalPlan/streams/:streamName',
      PhysicalOperator         :'/ops/apps/:appId/physicalPlan/operators/:operatorId',
      Port                     :'/ops/apps/:appId/physicalPlan/operators/:operatorId/ports/:portId',

      // Development
      Packages                 :'/packages',
      Package                  :'/packages/:packageName/:packageVersion',
      PackageImport            :'/packages/import',
      PackageApplication       :'/packages/:packageName/:packageVersion/applications/:appName',
      DagEditor                :'/packages/:packageName/:packageVersion/applications/:appName/dagEditor'
    },

    breadcrumbs: {
      appInstance              :':appId',
      container                :':containerId',
      logicalOperator          :':operatorName',
      physicalOperator         :':operatorId',
      logicalStream            :':streamName',
      containerLog             :':logName',
      port                     :':portId',
      packageName              :':packageName @ :packageVersion',
      appName                  :':appName'
    },

    stramEvents: {
      INITIAL_LIMIT: 50
    },

    containerLogs: {
      GOTO_PADDING_BYTES: 1024 * 1,
      DEFAULT_START_OFFSET: -1 * 64 * 1024, // in byes
      DEFAULT_SCROLL_REQUEST_KB: 64 * 1024, // in byes
      UNSET_REQUEST_FLAG_WAIT: 100,
      RETRIEVE_DEBOUNCE_WAIT: 500,
      GREP_DEBOUNCE_WAIT: 500,
      CONFIRM_REQUEST_THRESHOLD_KB: 8 * 1024 // in byes
    },

    dagEditor: {
      DEFAULT_OPERATOR_NAME: 'Operator',
      DEFAULT_STREAM_NAME: 'Stream',
      ZOOM_STEP_MOUSEWHEEL: 0.005,
      ZOOM_STEP_CLICK: 0.2,
      MAX_ZOOM_LEVEL: 5,
      MIN_ZOOM_LEVEL: 0.1
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
