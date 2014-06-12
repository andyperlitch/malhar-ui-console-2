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

angular.module('dtConsoleApp')
  .controller('ApplicationCtrl', function ($scope, $routeParams, $resource, OverviewDataModel, appMetricsOverviewFields) {
    var appId = $routeParams.appId;

    var widgetDefinitions = [
      {
        name: 'ApplicationMetrics',
        title: 'Application Info',
        template: '<div dt-overview fields="fields" data="widgetData"></div>',
        dataModelType: OverviewDataModel,
        dataAttrName: 'data',
        dataModelOptions: {
          topic: 'applications.' + appId,
          fields: appMetricsOverviewFields
        },
        style: {
          width: '100%'
        }
      }
    ];

    var defaultWidgets = _.clone(widgetDefinitions);

    $scope.dashboardOptions = {
      //storage: localStorage,
      storageKey: 'dashboard.app',
      widgetButtons: false,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      defaultLayouts: [
        { title: 'default', active: true, defaultWidgets: defaultWidgets }
      ]
    };
  })
  .factory('appMetricsOverviewFields', function (DtText) { //TODO
    var fields = [
      {
        label: DtText.get('state_label'),
        key: 'state'
      },
      {
        label: DtText.get('as_of_label'),
        key: 'currentMemoryAllocatedMB'
      },
      {
        label: DtText.get('current_wid_label'),
        key: 'currentWindowId'
      },
      {
        label: DtText.get('recovery_wid_label'),
        key: 'recoveryWindowId'
      },
      {
        label: DtText.get('processed_per_sec')
      },
      {
        label: DtText.get('emitted_per_sec')
      },
      {
        label: DtText.get('processed_total'),
        key: 'tuplesProcessedPSMA',
        filter: 'dtCommaGroups'
      },
      {
        label: DtText.get('emitted_total'),
        key: 'tuplesEmittedPSMA',
        filter: 'dtCommaGroups'
      },
      {
        label: DtText.get('num_operators_label')
      },
      {
        label: DtText.get('planned_alloc_ctnrs_label')
      },
      {
        label: DtText.get('latency_ms_label')
      },
      {
        label: DtText.get('alloc_mem_label')
      },
      {
        label: DtText.get('up_for_label')
      }
    ];

    _.each(fields, function (field) {
      field.default = '-';
    });

    return fields;
  });
