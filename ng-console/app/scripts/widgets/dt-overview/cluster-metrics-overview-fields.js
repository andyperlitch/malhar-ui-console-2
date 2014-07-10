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

angular.module('dtConsoleApp')
  .factory('clusterMetricsOverviewFields', function (DtText, $filter) {
    // Public API here
    return [
      {
        label: DtText.get('cores_label'),
        key: 'cpuPercentage',
        filter: 'dtCpuFilter',
        filterArgs: [true]
      },
      {
        label: DtText.get('current alloc mem'),
        key: 'currentMemoryAllocatedMB',
        filter: 'dtByteFilter',
        filterArgs: ['mb']
      },
      {
        label: DtText.get('peak alloc mem'),
        key: 'maxMemoryAllocatedMB',
        filter: 'dtByteFilter',
        filterArgs: ['mb']
      },
      {
        label: DtText.get('running / pending / failed / finished / killed / submitted'),
        key: 'numAppsRunning',
        value: function(numAppsRunning, attrs) {
          return '<span class="status-running">' + $filter('dtCommaGroups')(attrs.numAppsRunning) + '</span> / ' +
          '<span class="status-pending-deploy">' + $filter('dtCommaGroups')(attrs.numAppsPending) + '</span> / ' +
          '<span class="status-failed">' + $filter('dtCommaGroups')(attrs.numAppsFailed) + '</span> / ' +
          '<span class="status-finished">' + $filter('dtCommaGroups')(attrs.numAppsFinished) + '</span> / ' +
          '<span class="status-killed">' + $filter('dtCommaGroups')(attrs.numAppsKilled) + '</span> / ' +
          '<span class="status-submitted">' + $filter('dtCommaGroups')(attrs.numAppsSubmitted) + '</span>';
        },
        trustAsHtml: true,
        default: '-'
      },
      {
        label: DtText.get('num_containers_label'),
        key: 'numContainers',
        'default': '-'
      },
      {
        label: DtText.get('num_operators_label'),
        key: 'numOperators',
        'default': '-'
      },
      {
        label: DtText.get('tuples_per_sec'),
        key: 'tuplesProcessedPSMA',
        filter: 'dtCommaGroups'
      },
      {
        label: DtText.get('emitted_per_sec'),
        key: 'tuplesEmittedPSMA',
        filter: 'dtCommaGroups'
      }
    ];
  });
