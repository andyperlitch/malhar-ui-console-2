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

angular.module('app.pages.ops.appInstance.container', [
  'app.settings',
  'app.components.services.dtText',
  'app.components.services.dashboardOptionsFactory',
  'app.components.resources.ApplicationModel',
  'app.components.resources.ContainerModel',
  'app.components.services.containerManager',

  'app.pages.ops.appInstance.container.widgets.ContainerOverview'
])
// Route
  .config(function($routeProvider, settings) {
    $routeProvider
      .when(settings.pages.Container, {
        controller: 'ContainerCtrl',
        templateUrl: 'pages/ops/ops.html',
        label: 'Container'
      });
  })

// Controller
  .controller('ContainerCtrl', function(
    $scope,
    $routeParams,
    dtText,
    breadcrumbs,
    $filter,
    ApplicationModel,
    ContainerModel,
    dashboardOptionsFactory,
    ContainerOverviewWidgetDef,
    settings,
    containerManager
  ) {
    // Set up breadcrumb label
    breadcrumbs.options['App Instance'] = $routeParams.appId;
    breadcrumbs.options.Container = $routeParams.containerId;

    // Set appId on scope for use
    $scope.appId = $routeParams.appId;

    // Store array of active container states
    $scope.NONENDED_CONTAINER_STATES = settings.NONENDED_CONTAINER_STATES;

    // Expose containerManager to scope
    $scope.containerManager = containerManager;

    // Create new app instance on scope
    $scope.appInstance = new ApplicationModel({ id: $routeParams.appId });
    $scope.appInstance.fetch();

    // Create the container model
    $scope.container = new ContainerModel({
      id: $routeParams.containerId,
      appId: $routeParams.appId
    });

    $scope.container.fetch();
    $scope.container.subscribe($scope);
    
    // Set dashboard options
    var widgetDefinitions = [
      new ContainerOverviewWidgetDef({ name: 'Overview' })
    ];
    var defaultWidgets = [
      { name: 'Overview' }
    ];
    $scope.dashboardOptions = dashboardOptionsFactory({
      storageId: 'dashboard.ops.appInstance.container',
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      defaultLayouts: [
        { title: 'default', active: false }
      ]
    });

  });