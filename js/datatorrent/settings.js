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

exports = module.exports = {
    //wsRoot: 'http://localhost:3000',
    alertUrlRoot: '/alerts',
    version: 'v1',
    maxAlertActions: 3,
    statusOrder: ['RUNNING','FAILED','FINISHED','KILLED'],
    visibility_timeout: 20000,
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
        OpProperties             :'/ws/:v/applications/:appId/logicalPlan/operators/:operatorName/properties',
        PhysicalOperator         :'/ws/:v/applications/:appId/physicalPlan/operators',
        PhysicalPlan             :'/ws/:v/applications/:appId/physicalPlan',
        Port                     :'/ws/:v/applications/:appid/physicalPlan/operators/:operatorId/ports',        
        Recording                :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/recordings',
        RecordingTuples          :'/ws/:v/applications/:appId/physicalPlan/operators/:operatorId/recordings/:startTime/tuples',
        StramEvent               :'/ws/:v/applications/:appId/events',
        User                     :'/ws/:v/profile/user'
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
        loggerSearch             :'/ws/v1/applications/:appId/loggers/search',
        setLogLevel              :'/ws/:v/applications/:appId/loggers',
        specifyDepJars           :'/ws/:v/jars/:fileName/dependencyJars',
        restartGateway           :'/ws/:v/config/restart',
        loginUser                :'/ws/:v/login',
        logoutUser               :'/ws/:v/logout',

    },
    
    topics: {
        
        ClusterMetrics           :'cluster.metrics',
        Applications             :'applications',
        Application              :'applications.:appId',
        PhysicalOperators        :'applications.:appId.physicalOperators',
        LogicalOperators         :'applications.:appId.logicalOperators',
        Containers               :'applications.:appId.containers',
        StramEvents              :'applications.:appId.events',
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
    },

    stramEvents: {
        TAIL_INIT_OFFSET: 50,
        ANIMATE_SCROLL_TIME: 500
    },

    containerLogs: {
        DEFAULT_START_OFFSET: -4096,
        DEFAULT_SCROLL_REQUEST_KB: 16,
        UNSET_REQUEST_FLAG_WAIT: 100,
        GREP_DEBOUNCE_WAIT: 500
    },

    loggerLevel: {
        GET_LEVEL_DEBOUNCE_WAIT: 500,
        MAX_TEASER_RESULTS: 3
    },

    interpolateParams: function(string, params) {
        return string.replace(/:(\w+)/g, function(match, paramName) {
            return encodeURIComponent(params[paramName]);
        });
    }
};