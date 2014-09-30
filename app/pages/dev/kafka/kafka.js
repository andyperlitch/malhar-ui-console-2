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
  'app.pages.dev.kafka.socket',
  'app.pages.dev.kafka.KafkaSocketService',
  'app.pages.dev.kafka.widgetDataModels.KafkaTimeSeriesWidgetDataModel',
  'app.pages.dev.kafka.widgetDataModels.KafkaMetricsWidgetDataModel'
])

// Route
  .config(function ($routeProvider, socketProvider) {
    socketProvider.setWebSocketURL(window.dataServerHost);
    $routeProvider
      .when('/kafka', {
        controller: 'KafkaCtrl',
        templateUrl: 'pages/ops/ops.html',
        label: 'Kafka Debug'
      });
  })

// Controller
  .controller('KafkaCtrl', function ($scope, KafkaRestService, KafkaBarChartWidgetDataModel, KafkaLineChartWidgetDataModel, KafkaTimeSeriesWidgetDataModel, KafkaMetricsWidgetDataModel, ClusterMetricsWidget, AppsListWidget, RandomPercentageDataModel, RandomNVD3TimeSeriesDataModel, RandomMinutesDataModel, dashboardOptionsFactory) {
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
          'metric-value': 'metricValue'
        },
        size: {
          width: '50%'
        },
        settingsModalOptions: {
          partialTemplateUrl: 'pages/dev/kafka/configurableWidgetModalOptions.html'
        },
        onSettingsClose: function (result, widget) {
          if (widget.dataModel && widget.dataModel.updateQuery) {
            var query = JSON.parse(result.queryText);
            widget.dataModel.updateQuery(query);
          }
        }
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
          'show-legend': true
        },
        size: {
          width: '50%'
        },
        settingsModalOptions: {
          partialTemplateUrl: 'pages/dev/kafka/configurableWidgetModalOptions.html'
        },
        onSettingsClose: function (result, widget) {
          if (widget.dataModel && widget.dataModel.updateQuery) {
            var query = JSON.parse(result.queryText);
            widget.dataModel.updateQuery(query);
          }
        }
      },
      {
        name: 'Kafka Debug',
        title: 'Kafka Debug',
        templateUrl: 'pages/dev/kafka/widgets/kafkaDebug/kafkaDebug.html',
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

    var defaultQuery = {
      keys: {
        publisherId: 1,
        advertiserId: 0,
        adUnit: 0
      }
    };

    var defaultWidgets = [{
      name: 'Time Series Bar Chart',
      dataModelOptions: {
        metric: 'impressions',
        query: defaultQuery
      }
    }, {
      name: 'Time Series Line Chart',
      dataModelOptions: {
        query: defaultQuery
      }
    }, {
      name: 'Kafka Debug'
    }];

    var demoWidgets = [{
      name: 'Time Series Bar Chart',
      dataModelOptions: {
        metric: 'impressions',
        query: defaultQuery
      }
    }, {
      name: 'Time Series Line Chart',
      dataModelOptions: {
        query: defaultQuery
      }
    }];

    var debugWidgets = [{
      name: 'Kafka Debug'
    }];

    $scope.dashboardOptions = dashboardOptionsFactory({
      storage: localStorage,
      storageId: 'dashboard.kafka',
      widgetButtons: false,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      defaultLayouts: [
        { title: 'default', active: true, defaultWidgets: defaultWidgets },
        { title: 'example', active: false, defaultWidgets: demoWidgets },
        { title: 'debug', active: false, defaultWidgets: debugWidgets }
      ]
    });
  })
  .controller('KafkaOptionsCtrl', function ($scope) {
    var widget = $scope.widget;
    $scope.result.queryText = JSON.stringify(widget.dataModel.query, null, ' ');
  });