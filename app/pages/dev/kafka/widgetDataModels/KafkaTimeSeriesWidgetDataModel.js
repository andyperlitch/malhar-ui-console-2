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

angular.module('app.pages.dev.kafka.widgetDataModels.KafkaTimeSeriesWidgetDataModel', [
  'ui.models',
  'app.pages.dev.kafka.KafkaRestService'
])
  .factory('KafkaBarChartWidgetDataModel', function (WidgetDataModel, KafkaRestService) {
    function KafkaTimeSeriesWidgetDataModel() {
    }

    KafkaTimeSeriesWidgetDataModel.prototype = Object.create(WidgetDataModel.prototype);
    KafkaTimeSeriesWidgetDataModel.prototype.constructor = WidgetDataModel;

    angular.extend(KafkaTimeSeriesWidgetDataModel.prototype, {
      init: function () {
        if (this.dataModelOptions && this.dataModelOptions.metric) {
          this.widgetScope.metricValue = this.dataModelOptions.metric;
        }

        if (this.dataModelOptions && this.dataModelOptions.query) {
          this.query = this.dataModelOptions.query;
        } else {
          this.query = {
            keys: {
              publisherId: 1,
              advertiserId: 0,
              adUnit: 0
            }
          };
        }

        this.widgetScope.$on('metricChanged', function (event, metric) {
          event.stopPropagation();
          if (this.dataModelOptions) {
            this.dataModelOptions.metric = metric;
            this.widgetScope.$emit('widgetChanged', this.widget);
          }
        }.bind(this));

        this.fetchData();
      },

      fetchData: function () {
        if (this.kafkaService) {
          this.kafkaService.unsubscribe();
        } else {
          this.kafkaService = new KafkaRestService(function (data) {
            if (data) {
              this.updateScope(data);
            } else {
              this.updateScope(null);
            }
          }.bind(this), this.widgetScope);
        }

        this.kafkaService.subscribe(this.query);
      },

      updateQuery: function (query) {
        this.query = query;
        this.dataModelOptions = this.dataModelOptions ? this.dataModelOptions : {};
        this.dataModelOptions.query = query; // dateModelOptions are persisted

        this.fetchData();
      },

      destroy: function () {
        this.kafkaService.unsubscribe();
      }
    });

    return KafkaTimeSeriesWidgetDataModel;
  })
  .factory('KafkaTimeSeriesWidgetDataModel', function (WidgetDataModel) {
    function KafkaTimeSeriesWidgetDataModel() {
    }

    KafkaTimeSeriesWidgetDataModel.prototype = Object.create(WidgetDataModel.prototype);
    KafkaTimeSeriesWidgetDataModel.prototype.constructor = WidgetDataModel;

    angular.extend(KafkaTimeSeriesWidgetDataModel.prototype, {
      init: function () {
        if (this.dataModelOptions && this.dataModelOptions.metric) {
          this.widgetScope.metricValue = this.dataModelOptions.metric;
        }

        this.widgetScope.$on('kafkaMessage', function (event, data) {
          if (data) {
            this.updateScope(data);
          } else {
            this.updateScope(null);
          }
        }.bind(this));

        this.widgetScope.$on('metricChanged', function (event, metric) {
          event.stopPropagation();
          if (this.dataModelOptions) {
            this.dataModelOptions.metric = metric;
            this.widgetScope.$emit('widgetChanged', this.widget);
          }
        }.bind(this));
      },

      updateQuery: function (query) {
        console.log(query);
      },

      destroy: function () {
        //TODO
      }
    });

    return KafkaTimeSeriesWidgetDataModel;
  });