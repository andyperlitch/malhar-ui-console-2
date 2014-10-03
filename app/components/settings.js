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
      { name: 'AUTO_RECORD',        display_name: 'Auto-Record', type: 'Boolean', description: 'Whether or not to auto record the tuples.' },
      { name: 'PARTITION_PARALLEL', display_name: 'Partition Parallel', type: 'Boolean', portType: 'input', description:
        'Input port attribute. Extend partitioning of an upstream operator w/o intermediate merge. ' +
        'Can be used to form parallel partitions that span a group of operators. ' +
        'Defined on input port to allow for stream to be shared with non-partitioned sinks. ' +
        'If multiple ports of an operator have the setting, incoming streams must track back to ' +
        'a common root partition, i.e. the operator join forks of the same origin.'
      },
      { name: 'QUEUE_CAPACITY',     display_name: 'Queue Capacity', type: 'Integer', description: 'Number of tuples the poll buffer can cache without blocking the input stream to the port.' },
      { name: 'SPIN_MILLIS',        display_name: 'Spin Millis', type: 'Integer', description: 'Poll period in milliseconds when the port buffer reaches its limits.' },
      { name: 'UNIFIER_LIMIT',      display_name: 'Unifier Limit', type: 'Integer', portType: 'output', description:
        'Attribute of output port to specify how many partitions should be merged by a single unifier instance. If the ' +
        'number of partitions exceeds the limit set, a cascading unifier plan will be created. For example, 4 partitions ' +
        'with the limit set to 2 will result in 3 unifiers arranged in 2 levels. The setting can be used to cap the ' +
        'network I/O or other resource requirement for each unifier container (depends on the specific functionality of ' +
        'the unifier), enabling horizontal scale by overcoming the single unifier bottleneck.'
      }
    ],
    OPERATOR_ATTRIBUTES: [
      { name: 'ACTIVATION_WINDOW_ID', display_name: 'Activation Window ID', type: 'Long', description:
        'The windowId at which the operator\'s current run got activated. ' +
        'When the operator is deployed the first time during its activation, this value is the default value ' +
        'of the operator. On subsequent run, it\'s the windowId of the checkpoint from which the operator state ' +
        'is recovered.'
      },
      { name: 'SPIN_MILLIS', display_name: 'Spin Millis', type: 'Integer', description:
        'Poll period in milliseconds when there are no tuples available on any of the input ports of the operator. ' +
        'Default value is 10 milliseconds.'
      },
      { name: 'RECOVERY_ATTEMPTS', display_name: 'Recovery Attempts', type: 'Integer', description:
        'The maximum number of attempts to restart a failing operator before shutting down the application. ' +
        'Until this number is reached, when an operator fails to start it is re-spawned in a new container. Once all the ' +
        'attempts are exhausted, the application is shutdown. The default value for this attribute is null or unset and ' +
        'is equivalent to infinity; The operator hence will be attempted to be recovered indefinitely unless this value ' +
        'is set to anything else.'
      },
      { name: 'INITIAL_PARTITION_COUNT', display_name: 'Initial Partition Count', type: 'Integer', description:
        'Count of initial partitions for the operator. The number is interpreted as follows: ' +
        '<p> ' +
        'Default partitioning (operator does not implement Partitioner):<br> ' +
        'The platform creates the initial partitions by cloning the operator from the logical plan.<br> ' +
        'Default partitioning does not consider operator state on split or merge. ' +
        '<p> ' +
        'Operator implements Partitioner:<br> ' +
        'Value given as initial capacity hint to Partitioner#definePartitions(java.util.Collection, int) ' +
        'The operator implementation controls instance number and initialization on a per partition basis.'
      },
      { name: 'PARTITION_TPS_MIN', display_name: 'Partition TPS Minimum', type: 'Integer', description:
        'The minimum rate of tuples below which the physical operators are consolidated in dynamic partitioning. When this ' +
        'attribute is set and partitioning is enabled if the number of tuples per second falls below the specified rate ' +
        'the physical operators are consolidated into fewer operators till the rate goes above the specified minimum.'
      },
      { name: 'PARTITION_TPS_MAX', display_name: 'Partition TPS Maximum', type: 'Integer', description:
        'The maximum rate of tuples above which new physical operators are spawned in dynamic partitioning. When this ' +
        'attribute is set and partitioning is enabled if the number of tuples per second goes above the specified rate new ' +
        'physical operators are spawned till the rate again goes below the specified maximum.'
      },
      { name: 'STATS_LISTENERS', display_name: 'Stats Listeners', type: 'Collection', description:
        'Specify a listener to process and optionally react to operator status updates. ' +
        'The handler will be called for each physical operator as statistics are updated during heartbeat processing.'
      },
      { name: 'STATELESS', display_name: 'Stateless', type: 'Boolean', description:
        'Conveys whether the Operator is stateful or stateless. If the operator is stateless, no checkpointing is required ' +
        'by the engine. The attribute is ignored when the operator was already declared stateless through the ' +
        'Stateless annotation.'
      },
      { name: 'MEMORY_MB', display_name: 'Memory (MB)', type: 'Integer', description:
        'Memory resource that the operator requires for optimal functioning. Used to calculate total memory requirement for containers.'
      },
      { name: 'APPLICATION_WINDOW_COUNT', display_name: 'Application Window Count', type: 'Integer', description:
        'Attribute of the operator that tells the platform how many streaming windows make 1 application window.'
      },
      { name: 'CHECKPOINT_WINDOW_COUNT', display_name: 'Checkpoint Window Count', type: 'Integer', description:
        'Attribute of the operator that hints at the optimal checkpoint boundary. ' +
        'By default checkpointing happens after every predetermined streaming windows. Application developer can override ' +
        'this behavior by defining the following attribute. When this attribute is defined, checkpointing will be done after ' +
        'completion of later of regular checkpointing window and the window whose serial number is divisible by the attribute ' +
        'value. Typically user would define this value to be the same as that of APPLICATION_WINDOW_COUNT so checkpointing ' +
        'will be done at application window boundary.'
      },
      { name: 'LOCALITY_HOST', display_name: 'Locality Host', type: 'String', description:
        'Name of host to directly control locality of an operator. Complementary to stream locality (NODE_LOCAL affinity). ' +
        'For example, the user may wish to specify a locality constraint for an input operator relative to its data source. ' +
        'The attribute can then be set to the host name that is specified in the operator specific connect string property.'
      },
      { name: 'LOCALITY_RACK', display_name: 'Locality Rack', type: 'String', description:
        'Name of rack to directly control locality of an operator. Complementary to stream locality (RACK_LOCAL affinity).'
      },
      { name: 'STORAGE_AGENT', display_name: 'Storage Agent', type: 'StorageAgent', description:
        'The agent which can be used to checkpoint the windows.'
      },
      { name: 'PROCESSING_MODE', display_name: 'Processing Mode', type: 'Operator.ProcessingMode', description:
        'The payload processing mode for this operator - at most once, exactly once, or default at least once. ' +
        'If the processing mode for an operator is specified as AT_MOST_ONCE and no processing mode is specified for the downstream ' +
        'operators if any, the processing mode of the downstream operators is automatically set to AT_MOST_ONCE. If a different processing ' +
        'mode is specified for the downstream operators it will result in an error. ' +
        'If the processing mode for an operator is specified as EXACTLY_ONCE then the processing mode for all downstream operators ' +
        'should be specified as AT_MOST_ONCE otherwise it will result in an error.'
      },
      { name: 'TIMEOUT_WINDOW_COUNT', display_name: 'Timeout Window Count', type: 'Integer', description:
        'Timeout to identify stalled processing, specified as count of streaming windows. If the last processed ' +
        'window does not advance within the specified timeout count, the operator will be considered stuck and the ' +
        'container restart. There are multiple reasons this could happen: clock drift, hardware issue, networking issue, ' +
        'blocking operator logic, etc.'
      },
      { name: 'AUTO_RECORD', display_name: 'Auto-Record', type: 'Boolean', description:
        'Whether or not to auto record the tuples'
      },
      { name: 'PARTITIONER', display_name: 'Partitioner', type: 'Partitioner', description:
        'How the operator distributes its state and share the input can be influenced by setting the Partitioner attribute. ' +
        'If this attribute is set to non null value, the instance of the partitioner is used to partition and merge the ' +
        'state of the operator and the inputs. If this attribute is set to null then default partitioning is used. ' +
        'If the attribute is not set and the operator implements Partitioner interface, then the instance of the operator ' +
        'is used otherwise default default partitioning is used.'
      },
      { name: 'COUNTERS_AGGREGATOR', display_name: 'Counters Aggregator', type: 'CountersAggregator', description:
        'Aggregates physical counters to a logical counter.'
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
      License                  :'/ws/:v/licenses/files',
      LicenseAgent             :'/ws/:v/licenses/agents',
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
      killApp                  :'/ws/:v/applications/:appId/kill',
      killContainer            :'/ws/:v/applications/:appId/physicalPlan/containers/:containerId/kill',
      launchApp                :'/ws/:v/jars/:fileName/applications/:appName/launch',
      makeLicenseCurrent       :'/ws/:v/licenses/files/:fileName/makeCurrent',
      restartGateway           :'/ws/:v/config/restart',
      shutdownApp              :'/ws/:v/applications/:appId/shutdown',
      specifyDepJars           :'/ws/:v/jars/:fileName/dependencyJars',
      startOpRecording         :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/recordings/start',
      startPortRecording       :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/ports/:portName/recordings/start',
      stopOpRecording          :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/recordings/stop',
      stopPortRecording        :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/ports/:portName/recordings/stop'
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
      // Configuration
      Config                   :'/config',
      InstallWizard            :'/config/installation-wizard',

      // Operations
      AppInstance              :'/ops/apps/:appId',
      AppData                  :'/ops/apps/:appId/appdata',
      Container                :'/ops/apps/:appId/logicalPlan/containers/:containerId',
      ContainerLog             :'/ops/apps/:appId/logicalPlan/containers/:containerId/logs/:logName',
      LogicalOperator          :'/ops/apps/:appId/logicalPlan/operators/:operatorName',
      LogicalStream            :'/ops/apps/:appId/logicalPlan/streams/:streamName',
      Operations               :'/ops',
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
      appName                  :':appName',
      container                :':containerId',
      containerLog             :':logName',
      logicalOperator          :':operatorName',
      logicalStream            :':streamName',
      packageName              :':packageName @ :packageVersion',
      physicalOperator         :':operatorId',
      port                     :':portId'
      
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
      MAX_ZOOM_LEVEL: 1,
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
