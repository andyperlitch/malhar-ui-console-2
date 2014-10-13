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
  .controller('AppDataCtrl', function ($scope, $routeParams, $q, ApplicationModel, KafkaDiscovery) {
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
      $scope.fetched = true;
    });
  })
  .controller('AppDataDashboardCtrl', function ($scope, $routeParams, defaultOnSettingsClose, KafkaBarChartWidgetDataModel, KafkaLineChartWidgetDataModel, KafkaTimeSeriesWidgetDataModel, KafkaMetricsWidgetDataModel, ClusterMetricsWidget, AppsListWidget,
                                                dashboardOptionsFactory, clientSettings) {
    function onSettingsClose (result, widget) {
      defaultOnSettingsClose(result, widget);
      if (widget.dataModel && widget.dataModel.updateQuery) {
        var query = widget.dataModel.query; //TODO
        widget.dataModel.updateQuery(query);
      }
    }

    var widgetDefinitions = [
      {
        name: 'Time Series Bar Chart',
        title: 'Time Series Bar Chart',
        directive: 'wt-time-series',
        dataAttrName: 'data',
        //dataModelType: KafkaTimeSeriesWidgetDataModel,
        dataModelType: KafkaBarChartWidgetDataModel,
        dataModelOptions: {
        },
        attrs: {
          'metric-value': 'metricValue',
          'exclude-metrics': 'excludeMetrics',
          'time-axis-format': 'timeAxisFormat'
        },
        size: {
          width: '50%'
        },
        settingsModalOptions: {
          partialTemplateUrl: 'pages/dev/kafka/configurableWidgetModalOptions.html'
        },
        onSettingsClose: onSettingsClose
      },
      {
        name: 'Time Series Line Chart',
        title: 'Time Series Line Chart',
        directive: 'wt-nvd3-line-chart',
        dataAttrName: 'data',
        //dataModelType: KafkaMetricsWidgetDataModel,
        dataModelType: KafkaLineChartWidgetDataModel,
        dataModelOptions: {
        },
        attrs: {
          style: 'height:300px',
          'show-time-range': false,
          'show-legend': true,
          'time-axis-format': 'timeAxisFormat'
        },
        size: {
          width: '50%'
        },
        settingsModalOptions: {
          partialTemplateUrl: 'pages/dev/kafka/configurableWidgetModalOptions.html'
        },
        onSettingsClose: onSettingsClose
      },
      {
        name: 'Kafka Debug',
        title: 'Kafka Debug',
        templateUrl: 'pages/dev/kafka/widgets/kafkaDebug/kafkaDebug.html',
        size: {
          width: '100%'
        },
        dataModelOptions: {
          query: clientSettings.kafka.defaultQuery
        }
      },
      {
        name: 'Kafka Discovery',
        title: 'Kafka Discovery',
        templateUrl: 'pages/ops/appInstance/appData/widgets/discovery/discovery.html',
        size: {
          width: '100%'
        },
        dataModelOptions: {
          query: {
            keys: {
              publisherId: 1,
              advertiserId: 0,
              adUnit: 0
            }
          }
        }
      }
    ];

    $scope.dashboardOptions = dashboardOptionsFactory({
      storage: localStorage,
      storageId: clientSettings.dashboard.appData.storageKey + '_' + $scope.appInstance.data.name,
      widgetButtons: false,
      widgetDefinitions: widgetDefinitions,
      defaultLayouts: clientSettings.dashboard.appData.layouts
    });
  })
  .controller('KafkaOptionsCtrl', function ($scope) {
    var widget = $scope.widget;
    $scope.result.queryText = JSON.stringify(widget.dataModel.query, null, ' ');
  });