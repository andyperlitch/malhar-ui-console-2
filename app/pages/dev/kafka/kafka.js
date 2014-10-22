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

angular.module('app.pages.dev.kafka', [
  'ui.widgets',
  'ui.models',
  'app.pages.dev.kafka.widgets.timeSeries',
  'app.pages.dev.kafka.widgets.kafkaDebug',
  'app.pages.dev.kafka.widgets.textContent',
  'app.pages.dev.kafka.socket',
  'app.pages.dev.kafka.KafkaSocketService',
  'app.pages.dev.kafka.widgetDataModels.KafkaTimeSeriesWidgetDataModel',
  'app.pages.dev.kafka.widgetDataModels.KafkaMetricsWidgetDataModel',
  'app.pages.dev.kafka.widgetDataModels.TopNWidgetDataModel',
  'app.pages.dev.kafka.widgetDataModels.TableWidgetDataModel',
  'app.pages.dev.kafka.appDataWidgetDefinitions'
])

// Route
  .config(function ($routeProvider, socketProvider, clientSettings) {
    socketProvider.setWebSocketURL(clientSettings.dataServerHost);

    $routeProvider
      .when('/kafka', {
        controller: 'KafkaCtrl',
        templateUrl: 'pages/ops/ops.html',
        label: 'Application Data'
      })
      .when('/appdata', {
        controller: 'KafkaCtrl',
        templateUrl: 'pages/ops/ops.html',
        label: 'Application Data'
      });
  })

// Controller
  .controller('KafkaCtrl', function (webSocket, $scope, appDataWidgetDefinitions, KafkaBarChartWidgetDataModel, KafkaLineChartWidgetDataModel, KafkaTimeSeriesWidgetDataModel, KafkaMetricsWidgetDataModel, ClusterMetricsWidget,
                                     dashboardOptionsFactory, defaultOnSettingsClose, clientSettings) {
    $scope.dashboardOptions = dashboardOptionsFactory({
      storage: localStorage,
      storageId: clientSettings.dashboard.kafka.storageKey,
      widgetButtons: false,
      widgetDefinitions: appDataWidgetDefinitions,
      defaultLayouts: clientSettings.dashboard.kafka.layouts
    });

  })
  .controller('KafkaOptionsCtrl', function ($scope) {
    var widget = $scope.widget;
    $scope.result.query = widget.dataModel.query;
    if ($scope.kafkaDiscovery) {
      $scope.kafkaDiscovery.getFetchPromise().then(function () {
        $scope.dimensions = $scope.kafkaDiscovery.getDimensionList();
      });
    }
  });