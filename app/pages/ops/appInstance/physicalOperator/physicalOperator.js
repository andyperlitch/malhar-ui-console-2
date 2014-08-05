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

angular.module('app.pages.ops.appInstance.physicalOperator', [
  'app.settings',
  'app.components.resources.PhysicalOperatorModel',
  'app.components.resources.ApplicationModel',
  'app.components.services.dashboardOptionsFactory',
  'app.pages.ops.appInstance.physicalOperator.widgets.PhysicalOperatorOverview'
])

// Route
  .config(function($routeProvider, settings) {
    $routeProvider
      .when(settings.pages.PhysicalOperator, {
        controller: 'PhysicalOperatorCtrl',
        templateUrl: 'pages/ops/appInstance/physicalOperator/physicalOperator.html',
        label: 'Physical Operator'
      });
  })

// Controller
  .controller('PhysicalOperatorCtrl', function(
    $scope,
    $routeParams,
    breadcrumbs,
    ApplicationModel,
    PhysicalOperatorModel,
    dashboardOptionsFactory,
    PhysicalOperatorOverviewWidgetDef
  ) {
    
    // Set up breadcrumb label
    breadcrumbs.options['App Instance'] = $routeParams.appId;
    breadcrumbs.options['Physical Operator'] = 'Physical Operator: ' + $routeParams.operatorId;

    // Set scope info for use by widgets
    $scope.operatorId = $routeParams.operatorId;
    $scope.appId = $routeParams.appId;

    // Instantiate resources
    $scope.appInstance = new ApplicationModel({
      id: $routeParams.appId
    });
    $scope.appInstance.fetch();

    $scope.physicalOperator = new PhysicalOperatorModel({
      id: $routeParams.operatorId,
      appId: $routeParams.appId
    });
    $scope.physicalOperator.fetch();
    $scope.physicalOperator.subscribe($scope);
    $scope.$on('$destroy', function() {
      $scope.physicalOperator.unsubscribe();
    });

    // Create widgets arrays
    var widgetDefinitions = [
      new PhysicalOperatorOverviewWidgetDef({ name: 'Overview'})
    ];
    var defaultWidgets = [
      { name: 'Overview' }
    ];

    // Set dashboard options
    $scope.dashboardOptions = dashboardOptionsFactory({
      storageId: 'dashboard.ops.appInstance.physicalOperator',
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      defaultLayouts: [
        { title: 'default', active: false }
      ]
    });

  });