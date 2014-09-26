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
  'app.pages.dev.kafka.widgetDataModels.KafkaTimeSeriesWidgetDataModel',
  'app.pages.dev.kafka.widgetDataModels.KafkaMetricsWidgetDataModel',
  'app.pages.dev.kafka.KafkaRestService'
])

// Route
  .config(function ($routeProvider) {
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
          metric: 'impressions',
          query: {
            keys: {
              publisherId: 1,
              advertiserId: 0,
              adUnit: 0
            }
          }
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
          query: {
            keys: {
              publisherId: 1,
              advertiserId: 0,
              adUnit: 0
            }
          }
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
        name: 'Kafka Producer',
        title: 'Kafka Producer',
        templateUrl: 'pages/dev/kafka/producer.html',
        dataModelOptions: {
          query: {
            keys: {
              publisherId: 1,
              advertiserId: 0,
              adUnit: 0
            }
          }
        },
        style: {
          float: 'right'
        },
        size: {
          width: '50%'
        }
      },
      {
        name: 'Kafka Consumer',
        title: 'Kafka Consumer',
        templateUrl: 'pages/dev/kafka/consumer.html',
        size: {
          width: '50%'
        }
      }
    ];

    var defaultWidgets = _.clone(widgetDefinitions);

    $scope.dashboardOptions = dashboardOptionsFactory({
      storage: localStorage,
      storageId: 'dashboard.kafka',
      widgetButtons: false,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      defaultLayouts: [
        { title: 'default', active: true, defaultWidgets: defaultWidgets }
      ]
    });

    //TODO
    $scope.kafkaService = new KafkaRestService(function (data, kafkaMessage) {
      $scope.$broadcast('kafkaMessage', data, kafkaMessage);
    }, $scope);
  })
  .controller('KafkaOptionsCtrl', function ($scope) {
    var widget = $scope.widget;
    $scope.result.queryText = JSON.stringify(widget.dataModel.query, null, ' ');
  })
  .controller('KafkaConsumerCtrl', function ($scope) {
    $scope.$on('kafkaMessage', function (event, data, kafkaMessage) {
      $scope.kafkaMessage = kafkaMessage;

      if (kafkaMessage && kafkaMessage.value) {
        var kafkaMessageValue = JSON.parse(kafkaMessage.value);
        $scope.kafkaMessageValue = kafkaMessageValue;
        $scope.kafkaMessage.value = '<see data below>';
      } else {
        $scope.kafkaMessageValue = null; //TODO
      }
    });
  })
  .controller('KafkaProducerCtrl', function ($scope) {
    var defaultMessage;

    if ($scope.widget.dataModelOptions && $scope.widget.dataModelOptions.query) {
      defaultMessage = $scope.widget.dataModelOptions.query;
    } else {
      defaultMessage = {
        keys: {
          publisherId: 1,
          advertiserId: 0,
          adUnit: 0
        }
      };
    }

    $scope.requestText = JSON.stringify(defaultMessage, null, ' ');

    $scope.sendRequest = function () {
      var msg = null;

      try {
        msg = JSON.parse($scope.requestText);
      } catch (e) {
        console.log(e);
        $scope.request = 'JSON parse error';
      }

      if (msg) {
        $scope.kafkaService.subscribe(msg);
        $scope.request = $scope.kafkaService.getQuery();
        if ($scope.widget.dataModelOptions) {
          $scope.widget.dataModelOptions.query = msg;
          $scope.$emit('widgetChanged', $scope.widget);
        }
      }
    };

    $scope.sendRequest();

    $scope.$on('$destroy', function () {
      $scope.kafkaService.unsubscribe();
    });
  });