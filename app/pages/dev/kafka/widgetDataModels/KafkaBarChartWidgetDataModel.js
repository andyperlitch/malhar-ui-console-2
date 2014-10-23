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

angular.module('app.pages.dev.kafka.widgetDataModels.KafkaBarChartWidgetDataModel', [
  'ui.models',
  'app.pages.dev.kafka.KafkaRestService',
  'app.pages.dev.kafka.widgetDataModels.KafkaWidgetDataModel'
])
  .factory('KafkaBarChartWidgetDataModel', function (KafkaWidgetDataModel, clientSettings) {
    function KafkaTimeSeriesWidgetDataModel() {
    }

    KafkaTimeSeriesWidgetDataModel.prototype = Object.create(KafkaWidgetDataModel.prototype);
    KafkaTimeSeriesWidgetDataModel.prototype.constructor = KafkaWidgetDataModel;

    angular.extend(KafkaTimeSeriesWidgetDataModel.prototype, {
      init: function () {
        KafkaWidgetDataModel.prototype.updateScope.call(this, []);
        KafkaWidgetDataModel.prototype.init.call(this);

        if (this.dataModelOptions && this.dataModelOptions.metric) {
          this.widgetScope.metricValue = this.dataModelOptions.metric;
        }

        if (this.widgetScope.kafkaDiscovery) {
          this.widgetScope.excludeMetrics = this.widgetScope.kafkaDiscovery.getDimensionList();
        }

        this.widgetScope.$on('metricChanged', function (event, metric) {
          event.stopPropagation();
          if (this.dataModelOptions) {
            this.dataModelOptions.metric = metric;
            this.widgetScope.$emit('widgetChanged', this.widget);
          }
        }.bind(this));

        this.widgetScope.timeAxisFormat = clientSettings.dashboard.timeAxisFormat;
      }
    });

    return KafkaTimeSeriesWidgetDataModel;
  });