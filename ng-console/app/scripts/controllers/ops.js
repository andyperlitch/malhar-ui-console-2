'use strict';

angular.module('dtConsoleApp')
  .controller('OpsCtrl', ['$scope', 'OverviewDataModel', 'DTtext', '$filter', function ($scope, OverviewDataModel, text, $filter) {
      
      var widgetDefinitions = [
        {
          name: 'ClusterMetrics',
          title: 'Cluster Info',
          template: '<div dt-overview fields="fields" data="widgetData"></div>',
          dataModelType: OverviewDataModel,
          dataAttrName: 'data',
          dataModelOptions: {
            topic: 'ClusterMetrics',
            fields: [
              {
                label: text.get('cores_label'),
                key: 'cpuPercentage',
                filter: 'dtCpuFilter',
                filterOptions: [true]
              },
              {
                label: text.get('current alloc mem'),
                key: 'currentMemoryAllocatedMB',
                filter: 'dtByteFilter',
                filterOptions: ['mb']
              },
              {
                label: text.get('peak alloc mem'),
                key: 'maxMemoryAllocatedMB',
                filter: 'dtByteFilter',
                filterOptions: ['mb']
              },
              {
                label: text.get('running / pending / failed / finished / killed / submitted'),
                key: 'numAppsRunning',
                value: function(numAppsRunning, attrs) {
                  return '<span class="status-running">' + $filter('dtCommaGroups')(attrs.numAppsRunning) + '</span> / ' +
                  '<span class="status-pending-deploy">' + $filter('dtCommaGroups')(attrs.numAppsPending) + '</span> / ' +
                  '<span class="status-failed">' + $filter('dtCommaGroups')(attrs.numAppsFailed) + '</span> / ' +
                  '<span class="status-finished">' + $filter('dtCommaGroups')(attrs.numAppsFinished) + '</span> / ' +
                  '<span class="status-killed">' + $filter('dtCommaGroups')(attrs.numAppsKilled) + '</span> / ' +
                  '<span class="status-submitted">' + $filter('dtCommaGroups')(attrs.numAppsSubmitted) + '</span>';
                },
                trustAsHtml: true
              },
              {
                label: text.get('num_containers_label'),
                key: 'numContainers'
              },
              {
                label: text.get('num_operators_label'),
                key: 'numOperators'
              },
              {
                label: text.get('tuples_per_sec'),
                key: 'tuplesProcessedPSMA',
                filter: 'dtCommaGroups'
              },
              {
                label: text.get('emitted_per_sec'),
                key: 'tuplesEmittedPSMA',
                filter: 'dtCommaGroups'
              }
            ]
          },
          style: {
            width: '100%'
          }
        }
      ];

      var defaultWidgets = _.clone(widgetDefinitions);
  
      $scope.dashboardOptions = {
        useLocalStorage: false, //TODO enable by default
        widgetButtons: true,
        widgetDefinitions: widgetDefinitions,
        defaultWidgets: defaultWidgets
      };
  
    }]);
