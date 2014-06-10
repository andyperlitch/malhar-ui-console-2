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
