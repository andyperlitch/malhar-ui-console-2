'use strict';

angular.module('dtConsoleApp')
  .controller(
    'OpsCtrl', 
    [
      '$scope',
      'OverviewDataModel',
      'overviewFields/clusterMetricsOverviewFields',
      'TableDataModel',
      'ClusterMetrics',
      function (
        $scope,
        OverviewDataModel,
        clusterMetricsOverviewFields,
        TableDataModel,
        ClusterMetrics
      ){
        
        var widgetDefinitions = [
          {
            name: 'ClusterMetrics',
            title: 'Cluster Info',
            template: '<div dt-overview fields="fields" data="widgetData"></div>',
            dataModelType: OverviewDataModel,
            dataAttrName: 'data',
            dataModelOptions: {
              topic: 'ClusterMetrics',
              resource: ClusterMetrics,
              fields: clusterMetricsOverviewFields
            },
            style: {
              width: '100%'
            }
          },
          {
            name: 'AppList',
            title: 'Application List',
            template: '<div dt-table columns="columns" rows="rows"></div>',
            dataModelType: TableDataModel,
            dataAttrName: 'rows',
            dataModelOptions: {
              topic: 'Applications'
            }
          }
        ];

        var defaultWidgets = _.clone(widgetDefinitions);
    
        $scope.dashboardOptions = {
          storage: localStorage,
          storageKey: 'dashboard.ops',
          widgetButtons: true,
          widgetDefinitions: widgetDefinitions,
          defaultWidgets: defaultWidgets
        };
    
      }]);
