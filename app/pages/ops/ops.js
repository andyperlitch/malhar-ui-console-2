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
 * Operations page module
 */

angular.module('app.pages.ops', [
  'app.pages.ops.widgets.ClusterMetrics',
  'app.pages.ops.widgets.AppsList',
  'app.components.services.defaultWidgetSettings',
  'app.components.services.dashboardOptionsFactory',
  'ui.widgets',
  'ui.models'
])

// Route
  .config(function ($routeProvider) {
    $routeProvider
      .when('/ops', {
        controller: 'OpsCtrl',
        templateUrl: 'pages/ops/ops.html',
        label: 'operations'
      });
  })

// Controller
  .controller('OpsCtrl', function (
    $scope,
    ClusterMetricsWidget,
    AppsListWidget,
    RandomPercentageDataModel,
    RandomNVD3TimeSeriesDataModel,
    RandomMinutesDataModel,
    dashboardOptionsFactory
  ) {
    var widgetDefinitions = [
      new ClusterMetricsWidget({ name: 'ClusterMetrics' }),
      /*
      {
        name: 'Line Chart',
        title: 'Line Chart',
        directive: 'wt-nvd3-line-chart',
        dataAttrName: 'data',
        dataModelType: RandomNVD3TimeSeriesDataModel,
        size: {
          width: '40%'
        }
      },
      {
        name: 'Bar Chart',
        title: 'Bar Chart',
        directive: 'wt-bar-chart',
        dataAttrName: 'data',
        dataModelType: RandomMinutesDataModel,
        dataModelArgs: {
          limit: 1000
        },
        size: {
          width: '40%'
        }
      },
      {
        name: 'Gauge',
        title: 'Memory',
        directive: 'wt-gauge',
        dataAttrName: 'value',
        dataModelType: RandomPercentageDataModel,
        size: {
          width: '250px'
        }
      },
      */
      new AppsListWidget({ name: 'AppList' })
    ];

    var defaultWidgets = _.clone(widgetDefinitions);

    $scope.dashboardOptions = dashboardOptionsFactory({
      storage: localStorage,
      storageId: 'dashboard.ops',
      widgetButtons: false,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      defaultLayouts: [
        { title: 'default', active: true, defaultWidgets: defaultWidgets }
      ]
    });

  });