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

angular.module('app.pages.ops.appInstance.appData', [
  'app.settings',
  'app.pages.dev.kafka.socket',
  'app.components.services.dtText',
  'app.components.services.dashboardOptionsFactory',
  'app.components.resources.ApplicationModel',
  'app.components.resources.ContainerModel',
  'app.components.services.containerManager',
  'app.pages.ops.appInstance.appData.service.KafkaDiscovery',
  'app.pages.ops.appInstance.appData.widgets.discovery'
])
// Route
  .config(function($routeProvider, socketProvider, settings, clientSettings) {
    socketProvider.setWebSocketURL(clientSettings.dataServerHost);

    $routeProvider
      .when(settings.pages.AppData, {
        controller: 'AppDataCtrl',
        templateUrl: 'pages/ops/appInstance/appData/appData.html',
        //controller: 'AppDataDashboardCtrl',
        //templateUrl: 'pages/ops/ops.html',
        label: 'app data'
      });
  })

// Controller
  .controller('AppDataCtrl', function ($scope, $routeParams, $q, ApplicationModel, KafkaDiscovery, clientSettings) {
    var appId = $routeParams.appId;

    $scope.appId = appId;

    $scope.appInstance = new ApplicationModel({
      id: appId
    });
    var appInstancePromise = $scope.appInstance.fetch();

    //TODO
    $scope.kafkaDiscovery = new KafkaDiscovery(appId);
    var kafkaDiscoveryPromise = $scope.kafkaDiscovery.fetch();

    $scope.fetched = false;
    $q.all([appInstancePromise, kafkaDiscoveryPromise]).then(function () {
      var discoveredType = $scope.kafkaDiscovery.getDiscoveredType();
      if (discoveredType && _.has(clientSettings.dashboard, discoveredType)) {
        $scope.dashboard = clientSettings.dashboard[discoveredType];
        $scope.fetched = true;
      } else {
        $scope.error = true;
      }
    });
  })
  .controller('AppDataDashboardCtrl', function ($scope, $routeParams, appDataWidgetDefinitions, defaultOnSettingsClose, KafkaBarChartWidgetDataModel, KafkaLineChartWidgetDataModel, KafkaTimeSeriesWidgetDataModel, KafkaMetricsWidgetDataModel, ClusterMetricsWidget, AppsListWidget,
                                                dashboardOptionsFactory) {
    var dashboard = $scope.dashboard;
    $scope.dashboardOptions = dashboardOptionsFactory({
      storage: localStorage,
      storageId: dashboard.storageKey + '_' + $scope.appInstance.data.name,
      widgetButtons: false,
      widgetDefinitions: appDataWidgetDefinitions,
      defaultLayouts: dashboard.layouts
    });
  })
  .controller('KafkaOptionsCtrl', function ($scope) {
    var widget = $scope.widget;
    $scope.result.queryText = JSON.stringify(widget.dataModel.query, null, ' ');
  });