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

angular.module('app.pages.dev.kafka.widgetDataModels.KafkaMetricsWidgetDataModel', [
  'ui.models',
  'app.pages.dev.kafka.KafkaRestService'
])
  .factory('KafkaLineChartWidgetDataModel', function (KafkaWidgetDataModel) {
    function MetricsWidgetDataModel() {
    }

    MetricsWidgetDataModel.prototype = Object.create(KafkaWidgetDataModel.prototype);
    MetricsWidgetDataModel.prototype.constructor = KafkaWidgetDataModel;

    angular.extend(MetricsWidgetDataModel.prototype, {
      init: function () {
        KafkaWidgetDataModel.prototype.updateScope.call(this, []);
        KafkaWidgetDataModel.prototype.init.call(this);
      },

      updateScope: function (data) {
        this.series = [];
        if (data && data.length > 0) {
          var sampleObject = angular.copy(data[0]);
          delete sampleObject.timestamp;
          var metrics = _.keys(sampleObject);
          metrics = _.sortBy(metrics, function (key) {
            return key;
          });

          //TODO
          _.each(metrics, function (metric, index) {
            if (!this.series[index]) {
              this.series[index] = {
                key: metric
              };
            }
          }.bind(this));

          _.each(metrics, function (metric, index) {
            var values = _.map(data, function (point) {
              return {
                timestamp: point.timestamp,
                //value: Math.round(parseInt(point[metric], 10))
                value: point[metric]
              };
            });

            this.series[index].values = values;
          }.bind(this));

          /*
           var max = _.max(data, function (point) {
           return point.impressions;
           });
           console.log(max.impressions);
           */

          KafkaWidgetDataModel.prototype.updateScope.call(this, _.clone(this.series));
        } else {
          KafkaWidgetDataModel.prototype.updateScope.call(this, null);
        }

        this.widgetScope.metrics = [
          {
            key: 'impressions'
          },
          {
            key: 'revenue'
          }
        ];
      }
    })
    ;

    return MetricsWidgetDataModel;
  })
  .factory('KafkaMetricsWidgetDataModel', function (WidgetDataModel) {
    function MetricsWidgetDataModel() {
    }

    MetricsWidgetDataModel.prototype = Object.create(WidgetDataModel.prototype);
    MetricsWidgetDataModel.prototype.constructor = MetricsWidgetDataModel;

    angular.extend(MetricsWidgetDataModel.prototype, {
      init: function () {
        this.series = [];
        this.widgetScope.$on('kafkaMessage', function (event, data) {
          if (data && data.length > 0) {
            var sampleObject = angular.copy(data[0]);
            delete sampleObject.timestamp;
            var metrics = _.keys(sampleObject);
            metrics = _.sortBy(metrics, function (key) {
              return key;
            });

            //TODO
            _.each(metrics, function (metric, index) {
              if (!this.series[index]) {
                this.series[index] = {
                  key: metric
                };
              }
            }.bind(this));

            _.each(metrics, function (metric, index) {
              var values = _.map(data, function (point) {
                return {
                  timestamp: point.timestamp,
                  //value: Math.round(parseInt(point[metric], 10))
                  value: point[metric]
                };
              });

              this.series[index].values = values;
            }.bind(this));

            /*
             var max = _.max(data, function (point) {
             return point.impressions;
             });
             console.log(max.impressions);
             */

            this.updateScope(_.clone(this.series));
          } else {
            this.updateScope(null);
          }
        }.bind(this));

        this.widgetScope.metrics = [
          {
            key: 'impressions'
          },
          {
            key: 'revenue'
          }
        ];
      },

      destroy: function () {
      }
    })
    ;

    return MetricsWidgetDataModel;
  });