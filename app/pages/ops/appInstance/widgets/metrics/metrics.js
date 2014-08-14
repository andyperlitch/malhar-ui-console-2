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

angular.module('app.pages.ops.appinstance.widgets.metrics', [
  'app.settings',
  'app.components.directives.dtSelect'
])
  .factory('MetricsWidgetDataModel', function (WidgetDataModel, LogicalPlanResource, LogicalOperatorCollection, $q, ApplicationModel, dtText) {
    function MetricsWidgetDataModel() {
    }

    MetricsWidgetDataModel.prototype = Object.create(WidgetDataModel.prototype);
    MetricsWidgetDataModel.prototype.constructor = MetricsWidgetDataModel;

    angular.extend(MetricsWidgetDataModel.prototype, {
      init: function () {
        var history = [];
        var metrics = [
          {
            key: 'tuplesEmittedPSMA',
            color: '#64c539',
            label: dtText.get('emitted_per_sec'),
            visible: true
          },
          {
            key: 'tuplesProcessedPSMA',
            color: '#1da8db',
            label: dtText.get('processed_per_sec'),
            visible: true
          },
          {
            key: 'totalBufferServerReadBytesPSMA',
            color: '#AE08CE',
            label: dtText.get('buffer_server_reads_label'),
            visible: false
          },
          {
            key: 'totalBufferServerWriteBytesPSMA',
            color: '#f2be20',
            label: dtText.get('buffer_server_writes_label'),
            visible: false
          },
          {
            key: 'latency',
            color: '#da1c17',
            label: dtText.get('latency_ms_label'),
            visible: false
          }
        ];

        var metricsMap = _.reduce(metrics, function (map, metric) {
          map[metric.key] = metric;
          return map;
        }, {});

        var series = [];
        _.each(metrics, function (metric) {
          var metricKey = metric.key;
          series.push({
            key: metricKey,
            disabled: !metricsMap[metricKey].visible,
            color: metricsMap[metricKey].color
          });
        });

        var resource;

        if (false && this.widgetScope.appInstance && this.widgetScope.appInstance instanceof ApplicationModel) {
          resource = this.resource = this.widgetScope.appInstance;
        }
        else {
          this.unsubscribeOnDestroy = true;
          resource = this.resource = new ApplicationModel({
            id: this.widgetScope.appId
          });
        }

        resource.subscribe(this.widgetScope, function (appInfo) {
          var timeLimit = 30 * 1000;
          var now = Date.now();
          var startTime = now - timeLimit;
          var ind = _.findIndex(history, function (historyPoint) {
            return historyPoint.timestamp >= startTime;
          });
          if (ind > 1) {
            history = _.rest(history, ind - 1);
          }

          var historyPoint = {
            timestamp: now,
            stats: appInfo.stats
          };

          history.push(historyPoint);

          _.each(metrics, function (metric, index) {
            var metricKey = metric.key;
            var values = _.map(history, function (historyPoint) {
              return {
                timestamp: historyPoint.timestamp,
                value: historyPoint.stats[metricKey]
              };
            });
            series[index].values = values;
          });

          /*
          //TODO this is workaround to have fixed x axis scale when no enough date is available
          chart.push({
            key: 'Left Value',
            values: [
              {timestamp: startTime, value: 0}
            ]
          });
          */

          /*
           var max = _.max(history, function (historyPoint) { //TODO optimize
           return historyPoint.stats.tuplesEmittedPSMA; //TODO
           });

           chart.push({
           key: 'Upper Value',
           values: [
           {timestamp: now - 30 * 1000, value: Math.round(max.value * 1.2)}
           ]
           });
           */

          this.updateScope(_.clone(series));

        }.bind(this));
      },

      destroy: function () {
        if (this.unsubscribeOnDestroy) {
          this.resource.unsubscribe();
        }
      }
    })
    ;

    return MetricsWidgetDataModel;
  })
  .
  factory('MetricsWidgetDef', function (BaseWidget, MetricsWidgetDataModel) {
    var LogicalDagWidgetDefinition = BaseWidget.extend({
      defaults: {
        title: 'Metrics Chart',
        directive: 'wt-metrics-chart',
        dataAttrName: 'data',
        dataModelType: MetricsWidgetDataModel,
        attrs: {
          style: 'height:300px'
        }
      }
    });

    return LogicalDagWidgetDefinition;
  });