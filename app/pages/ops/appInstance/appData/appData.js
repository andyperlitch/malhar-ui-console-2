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
  'app.components.services.dtText',
  'app.components.services.dashboardOptionsFactory',
  'app.components.resources.ApplicationModel',
  'app.components.resources.ContainerModel',
  'app.components.services.containerManager',
  'app.pages.ops.appInstance.appData.service.KafkaDiscovery',
  'app.pages.ops.appInstance.appData.widgets.discovery'
])
// Route
  .config(function($routeProvider, settings) {
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
  .controller('AppDataCtrl', function ($scope, $routeParams, ApplicationModel, KafkaDiscovery) {
    // Instantiate resources
    var appId = $routeParams.appId;
    $scope.appInstance = new ApplicationModel({
      id: appId
    });
    $scope.appInstance.fetch().then(function (app) {
      console.log($scope.appInstance);
      console.log(app.name);
    });

    //TODO
    var kafkaDiscovery = new KafkaDiscovery(appId);
    kafkaDiscovery.fetch().then(function () {
      console.log('____discovered');
      console.log(kafkaDiscovery.dimensionsOperator);
    });
  })
  .controller('AppDataDashboardCtrl', function ($scope, $routeParams, ApplicationModel, defaultOnSettingsClose, KafkaRestService, KafkaBarChartWidgetDataModel, KafkaLineChartWidgetDataModel, KafkaTimeSeriesWidgetDataModel, KafkaMetricsWidgetDataModel, ClusterMetricsWidget, AppsListWidget, RandomPercentageDataModel, RandomNVD3TimeSeriesDataModel, RandomMinutesDataModel, dashboardOptionsFactory) {
    function onSettingsClose (result, widget) {
      defaultOnSettingsClose(result, widget);
      if (widget.dataModel && widget.dataModel.updateQuery) {
        var query = JSON.parse(result.queryText);
        widget.dataModel.updateQuery(query);
      }
    }

    var widgetDefinitions = [
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
      },
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
          'show-legend': true
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
      name: 'Kafka Discovery'
    }, {
      name: 'Kafka Debug'
    }];

    $scope.dashboardOptions = dashboardOptionsFactory({
      storage: localStorage,
      storageId: 'dashboard.appdata_' + $scope.appInstance.data.name,
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