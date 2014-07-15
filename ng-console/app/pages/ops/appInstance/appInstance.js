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
  'app.pages.ops.appInstance.widgets.AppInstanceOverview',
  'app.pages.ops.appinstance.widgets.LogicalDag'
])

// Route
  .config(function($routeProvider) {
    $routeProvider
      .when('/ops/apps/:appId', {
        controller: 'AppInstanceCtrl',
        templateUrl: 'pages/ops/ops.html',
        label: 'App Instance'
      });
  })

// Controller
  .controller('AppInstanceCtrl', function ($scope, $routeParams, _, LogicalDagWidgetDefinition, AppInstanceOverviewWidget, AppsListWidget, breadcrumbs) {

    // Set up breadcrumb label
    breadcrumbs.options['App Instance'] = $routeParams.appId;
    $scope.appId = $routeParams.appId;

    //webSocket.subscribe('applications.' + appId, function (data) {
    //  console.log(data);
    //  $scope.fields = data;
    //  $scope.$apply();
    //}, $scope);

    var widgetDefinitions = [
      new AppInstanceOverviewWidget({ name: 'Application Overview' }),
      new LogicalDagWidgetDefinition({ name: 'LogicalDAG' })
    ];

    var defaultWidgets = _.clone(widgetDefinitions);

    $scope.dashboardOptions = {
      //storage: localStorage,
      storageKey: 'dashboard.ops',
      widgetButtons: false,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      defaultLayouts: [
        { title: 'default', active: true , defaultWidgets: defaultWidgets }
      ]
    };

  });