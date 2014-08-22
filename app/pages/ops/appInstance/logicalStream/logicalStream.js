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

angular.module('app.pages.ops.appInstance.logicalStream', [
  'ngRoute',
  'app.settings',
  'app.components.resources.LogicalStreamModel',
  'app.components.resources.ApplicationModel',
  'app.components.services.dashboardOptionsFactory',
  'app.pages.ops.appInstance.logicalStream.widgets.LogicalStreamOverview'
])
// Route
  .config(function ($routeProvider, settings) {
    $routeProvider
      .when(settings.pages.LogicalStream, {
        controller: 'LogicalStreamCtrl',
        templateUrl: 'pages/ops/ops.html',
        label: 'logicalStream',
        collection: {
          label: 'streams',
          resource: 'LogicalStreamCollection',
          resourceParams: ['appId'],
          templateUrl: 'pages/ops/appInstance/logicalStream/breadcrumbTemplate.html',
          orderBy: 'name'
        }
      });
  })

// Controller
  .controller('LogicalStreamCtrl', function (
    $scope,
    $routeParams,
    ApplicationModel,
    LogicalStreamModel,
    dashboardOptionsFactory,
    LogicalStreamOverviewWidgetDef
  ) {

    // Set scope info for use by widgets
    $scope.streamName = $routeParams.streamName;
    $scope.appId = $routeParams.appId;

    // Instantiate resources
    $scope.appInstance = new ApplicationModel({
      id: $routeParams.appId
    });
    $scope.appInstance.fetch();

    $scope.logicalStream = new LogicalStreamModel({
      name: $routeParams.streamName,
      appId: $routeParams.appId
    });
    $scope.logicalStream.fetch();
    $scope.logicalStream.subscribe($scope);
    $scope.$on('$destroy', function() {
      $scope.logicalStream.unsubscribe();
    });

    // Create widgets arrays
    var widgetDefinitions = [
      new LogicalStreamOverviewWidgetDef({ name: 'Overview'})
    ];
    var defaultWidgets = [
      { name: 'Overview' }
    ];

    // Set dashboard options
    $scope.dashboardOptions = dashboardOptionsFactory({
      storageId: 'dashboard.ops.appInstance.logicalStream',
      storageHash: 'asd98at',
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      defaultLayouts: [
        { title: 'default', active: false }
      ]
    });

  });