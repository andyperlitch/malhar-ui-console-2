'use strict';

angular.module('dtConsoleApp')
  .controller(
    'OpsCtrl', 
    [
      '$scope',
      'OverviewDataModel',
      'widgets/dtOverview/clusterMetricsOverviewFields',
      'TableDataModel',
      'ClusterMetrics',
      'Applications',
      'widgets/dtTable/applicationsListColumns',
      function ($scope, OverviewDataModel, clusterMetricsOverviewFields, TableDataModel, ClusterMetrics, Applications, applicationsListColumns ){
        
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
            template: '<div columns="columns" rows="rows"></div>',
            dataModelType: TableDataModel,
            dataAttrName: 'rows',
            dataModelOptions: {
              topic: 'Applications',
              resource: Applications,
              resourceAction: 'getRunning',
              columns: applicationsListColumns
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
