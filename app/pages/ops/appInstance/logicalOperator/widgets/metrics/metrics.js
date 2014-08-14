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

angular.module('app.pages.ops.appInstance.logicalOperator.widgets.metrics', [
])
  .factory('OpMetricsWidgetDataModel', function (WidgetDataModel, LogicalPlanResource, LogicalOperatorCollection, $q, ApplicationModel, dtText) {
    function MetricsWidgetDataModel() {
    }

    MetricsWidgetDataModel.prototype = Object.create(WidgetDataModel.prototype);
    MetricsWidgetDataModel.prototype.constructor = MetricsWidgetDataModel;

    angular.extend(MetricsWidgetDataModel.prototype, {
      init: function () {
        var chartController = {
          addPoint: function () {} // this method be replaced by chart directive
        };
        this.widgetScope.chartController = chartController;

        this.widgetScope.metrics = [
          {
            key: 'tuplesEmittedPSMA',
            color: '#64c539',
            label: dtText.get('emitted_per_sec'),
            visible: true
          }, {
            key: 'tuplesProcessedPSMA',
            color: '#1da8db',
            label: dtText.get('processed_per_sec'),
            visible: true
          },{
            key: 'cpuPercentageMA',
            color: '#da1c17',
            label: dtText.get('cpu_percentage_label'),
            visible: true
          }, {
            key: 'latencyMA',
            color: '#888',
            label: dtText.get('latency_ms_label'),
            visible: true
          }, {
            key: 'inputBufferServerBytesPS',
            color: '#AE08CE',
            label: dtText.get('buffer_server_reads_label'),
            visible: false
          }, {
            key: 'outputBufferServerBytesPS',
            color: '#f2be20',
            label: dtText.get('buffer_server_writes_label'),
            visible: false
          }
        ];

        this.logicalOperator = this.widgetScope.logicalOperator;

        this.logicalOperator.fetchAndSubscribe(this.widgetScope, function (opInfo) {
          chartController.addPoint(opInfo);
        });
      },

      destroy: function () {
        //if (this.unsubscribeOnDestroy) {
        //  this.appInstance.unsubscribe();
        //}
      }
    })
    ;

    return MetricsWidgetDataModel;
  })
  .
  factory('OpMetricsWidgetDef', function (BaseWidget, OpMetricsWidgetDataModel) {
    var OpMetricsWidgetDef = BaseWidget.extend({
      defaults: {
        title: 'Metrics Chart',
        directive: 'wt-metrics-chart',
        dataModelType: OpMetricsWidgetDataModel,
        attrs: {
          style: 'height:300px',
          metrics: 'metrics',
          controller: 'chartController'
        }
      }
    });

    return OpMetricsWidgetDef;
  });