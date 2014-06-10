'use strict';

angular.module('dtConsoleApp')
  .controller(
    'OpsCtrl',
    ['$scope','OverviewDataModel','clusterMetricsOverviewFields','ClusterMetrics','AppListDataModel',
    function ($scope, OverviewDataModel, clusterMetricsOverviewFields, ClusterMetrics, AppListDataModel){
      
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
          templateUrl: 'scripts/widgets/dt-table/app-list.tpl.html',
          dataModelType: AppListDataModel
        }
      ];

      var defaultWidgets = _.clone(widgetDefinitions);
  
      $scope.dashboardOptions = {
        storage: localStorage,
        storageKey: 'dashboard.ops',
        widgetButtons: false,
        widgetDefinitions: widgetDefinitions,
        defaultWidgets: defaultWidgets,
        defaultLayouts: [
          { title: 'default', active: true , defaultWidgets: defaultWidgets },
        ]
      };
  
    }]);
