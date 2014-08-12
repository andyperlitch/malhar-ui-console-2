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

/**
 * Application Instance page module
 */

angular.module('app.pages.ops.appInstance', [
  'ngRoute',
  'app.settings',
  'app.components.services.appManager',
  'app.components.services.dashboardOptionsFactory',
  'app.components.resources.ApplicationModel',
  'app.pages.ops.appInstance.widgets.AppInstanceOverview',
  'app.pages.ops.appInstance.widgets.LogicalOperatorsList',
  'app.components.widgets.PhysicalOperatorsList',
  'app.pages.ops.appInstance.widgets.ContainersList',
  'app.pages.ops.appInstance.widgets.StramEvents',
  'app.pages.ops.appinstance.widgets.dag.LogicalDag',
  'app.pages.ops.appinstance.widgets.dag.PhysicalDag',
  'ui.widgets',
  'ui.models'
])

// Route
  .config(function($routeProvider, settings) {
    $routeProvider
      .when(settings.pages.AppInstance, {
        controller: 'AppInstanceCtrl',
        templateUrl: 'pages/ops/ops.html',
        label: 'App Instance'
      });
  })

// Controller
  .controller('AppInstanceCtrl', function (
    $scope,
    $routeParams,
    ApplicationModel,
    LogicalDagWidgetDefinition,
    PhysicalDagWidgetDefinition,
    AppInstanceOverviewWidgetDef,
    StramEventsWidgetDef,
    LogicalOperatorsListWidgetDef,
    PhysicalOperatorsListWidgetDef,
    ContainersListWidgetDef,
    breadcrumbs,
    dashboardOptionsFactory,
    RandomNVD3TimeSeriesDataModel
  ) {

    // Set up breadcrumb label
    breadcrumbs.options['App Instance'] = $routeParams.appId;

    // Set appId on scope for use
    $scope.appId = $routeParams.appId;

    // Create new app instance on scope
    $scope.appInstance = new ApplicationModel({ id: $routeParams.appId });
    $scope.appInstance.fetch();
    $scope.appInstance.subscribe($scope);
    $scope.$on('$destroy', function() {
      $scope.appInstance.unsubscribe();
    });


    var widgetDefinitions = [
      new AppInstanceOverviewWidgetDef({ name:  'Application Overview', style: { width: '66%' } }),
      new StramEventsWidgetDef({ name: 'Stram Events', style: { width: '34%', 'float':'right' } }),
      new LogicalDagWidgetDefinition({
        name: 'Logical DAG',
        dataModelArgs: { appId: $scope.appId },
        style: {
          width: '66%'
        }
      }),
      new PhysicalDagWidgetDefinition({
        name: 'Physical DAG',
        dataModelArgs: { appId: $scope.appId },
        style: {
          width: '100%'
        }
      }),
      new LogicalOperatorsListWidgetDef({ name: 'Logical Operators List' }),
      new PhysicalOperatorsListWidgetDef({ name: 'Physical Operators List' }),
      new ContainersListWidgetDef({
        name: 'Containers List',
        style: {
          width: '66%'
        }
      }),
      {
        name: 'Metrics Chart',
        title: 'Metrics Chart',
        directive: 'wt-nvd3-line-chart',
        dataAttrName: 'data',
        dataModelType: RandomNVD3TimeSeriesDataModel,
        style: {
          width: '100%'
        }
      }
    ];

    var logicalLayoutWidgets = _.map(['Application Overview', 'Stram Events', 'Logical DAG', 'Logical Operators List', 'Metrics Chart'], function (name) {
      return { name: name };
    });

    var physicalLayoutWidgets = _.map(['Application Overview', 'Stram Events', 'Containers List', 'Physical Operators List' ], function (name) {
      return { name: name };
    });

    var physicalDagViewLayoutWidgets = [
      {
        name: 'Application Overview',
        style: {
          width: '100%' //TODO if this widget is added again it will have width from widgetDefinitions
        }
      },
      { name: 'Physical DAG' }
    ];

    var metricViewLayoutWidgets = [
      {
        name: 'Application Overview',
        style: {
          width: '100%' //TODO if this widget is added again it will have width from widgetDefinitions
        }
      },
      { name: 'Metrics Chart' }
    ];

    $scope.dashboardOptions = dashboardOptionsFactory({
      storageId: 'dashboard.ops.appInstance',
      storageHash: 'owjkne79273sjf',
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: logicalLayoutWidgets,
      defaultLayouts: [
        { title: 'metric-view', active: false , defaultWidgets: metricViewLayoutWidgets },
        { title: 'physical-dag-view', active: false , defaultWidgets: physicalDagViewLayoutWidgets },
        { title: 'physical', active: false , defaultWidgets: physicalLayoutWidgets },
        { title: 'logical', active: true , defaultWidgets: logicalLayoutWidgets }
      ]
    });

  });