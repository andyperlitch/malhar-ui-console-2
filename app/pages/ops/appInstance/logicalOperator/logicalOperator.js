/*
* Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
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

angular.module('app.pages.ops.appInstance.logicalOperator', [
  'app.settings',
  'app.components.resources.LogicalOperatorModel',
  'app.components.resources.ApplicationModel',
  'app.components.services.dashboardOptionsFactory',
  'app.pages.ops.appInstance.logicalOperator.widgets.LogicalOperatorOverview',
  'app.components.widgets.PhysicalOperatorsList',
  'app.pages.ops.appInstance.logicalOperator.widgets.metrics'
])

// Route
  .config(function($routeProvider, settings) {
    $routeProvider
      .when(settings.pages.LogicalOperator, {
        controller: 'LogicalOperatorCtrl',
        templateUrl: 'pages/ops/appInstance/logicalOperator/logicalOperator.html',
        label: 'Logical Operator'
      });
  })

// Controller
  .controller('LogicalOperatorCtrl', function(
    $scope,
    $routeParams,
    breadcrumbs,
    ApplicationModel,
    LogicalOperatorModel,
    dashboardOptionsFactory,
    LogicalOperatorOverviewWidgetDef,
    PhysicalOperatorsListWidgetDef,
    OpMetricsWidgetDef
  ) {
    
    // Set up breadcrumb label
    breadcrumbs.options['App Instance'] = $routeParams.appId;
    breadcrumbs.options['Logical Operator'] = 'Logical Operator: ' + $routeParams.operatorName;

    // Set scope info for use by widgets
    $scope.operatorName = $routeParams.operatorName;
    $scope.appId = $routeParams.appId;

    // Instantiate resources
    $scope.appInstance = new ApplicationModel({
      id: $routeParams.appId
    });
    $scope.appInstance.fetch();

    $scope.logicalOperator = new LogicalOperatorModel({
      name: $routeParams.operatorName,
      appId: $routeParams.appId
    });
    $scope.logicalOperator.fetch();
    $scope.logicalOperator.subscribe($scope);
    $scope.$on('$destroy', function() {
      $scope.logicalOperator.unsubscribe();
    });

    // Create widgets arrays
    var widgetDefinitions = [
      new LogicalOperatorOverviewWidgetDef({ name: 'Overview'}),
      new PhysicalOperatorsListWidgetDef({ name: 'Partitions'}),
      new OpMetricsWidgetDef({ name: 'Metrics Chart' })
    ];
    var defaultWidgets = [
      { name: 'Overview' },
      { name: 'Partitions', title: 'Partitions'},
      { name: 'Metrics Chart'}
    ];

    // Set dashboard options
    $scope.dashboardOptions = dashboardOptionsFactory({
      storageId: 'dashboard.ops.appInstance.logicalOperator',
      storageHash: 'asd98at',
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      defaultLayouts: [
        { title: 'default', active: false }
      ]
    });

  });