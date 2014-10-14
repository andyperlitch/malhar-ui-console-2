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

angular.module('app.pages.dev.kafka.widgetDataModels.KafkaWidgetDataModel', [
  'ui.models',
  'app.pages.dev.kafka.KafkaRestService',
  'app.pages.dev.kafka.KafkaSocketService'
])
  .factory('KafkaWidgetDataModel', function (WidgetDataModel, KafkaRestService, KafkaSocketService, clientSettings) {
    function KafkaTimeSeriesWidgetDataModel() {
    }

    KafkaTimeSeriesWidgetDataModel.prototype = Object.create(WidgetDataModel.prototype);
    KafkaTimeSeriesWidgetDataModel.prototype.constructor = WidgetDataModel;

    angular.extend(KafkaTimeSeriesWidgetDataModel.prototype, {
      init: function () {
        if (this.dataModelOptions && this.dataModelOptions.query) {
          this.query = this.dataModelOptions.query;
          this.fetchData();
          this.updateQueryInfo();
        }
      },

      updateQueryInfo: function () {
        if (this.query && this.query.keys) {
          var dictionary = clientSettings.kafka.dictionary;
          var properties = _.map(this.query.keys, function (value, key) {
            var displayValue;
            var keyValues = dictionary[key];
            if (keyValues) {
              var dictionaryEntry = _.findWhere(keyValues, { value: value });
              if (dictionaryEntry) {
                displayValue = dictionaryEntry.name;
              } else {
                displayValue = value;
              }
            } else {
              displayValue = value;
            }
            return key + ': ' + displayValue;
          });
          var info = properties.join(', ');
          this.widgetScope.extendedTitle = info;
        }
      },

      fetchData: function () {
        this.updateScope([]); //TODO

        if (!this.kafkaService) {
          this.kafkaService = new KafkaSocketService();
        }

        var kafkaQuery = this.query;

        if (this.widgetScope.kafkaDiscovery) {
          kafkaQuery = _.clone(kafkaQuery);
          angular.extend(kafkaQuery, {
            kafka: this.widgetScope.kafkaDiscovery.getKafkaTopics()
          });
        }

        this.kafkaService.subscribe(kafkaQuery, function (data) {
          if (data) {
            this.updateScope(data);
          } else {
            this.updateScope(null);
          }
        }.bind(this), this.widgetScope);
      },

      updateQuery: function (query) {
        this.query = query;
        this.dataModelOptions = this.dataModelOptions ? this.dataModelOptions : {};
        this.dataModelOptions.query = query; // dateModelOptions are persisted
        //this.widgetScope.$emit('widgetChanged', this.widget); // this is implicitly called

        this.fetchData();
        this.updateQueryInfo();
      },

      destroy: function () {
        if (this.kafkaService) {
          this.kafkaService.unsubscribe();
        }
      }
    });

    return KafkaTimeSeriesWidgetDataModel;
  })
  .factory('KafkaRestWidgetDataModel', function (WidgetDataModel, KafkaRestService) {
    function KafkaTimeSeriesWidgetDataModel() {
    }

    KafkaTimeSeriesWidgetDataModel.prototype = Object.create(WidgetDataModel.prototype);
    KafkaTimeSeriesWidgetDataModel.prototype.constructor = WidgetDataModel;

    angular.extend(KafkaTimeSeriesWidgetDataModel.prototype, {
      init: function () {
        if (this.dataModelOptions && this.dataModelOptions.query) {
          this.query = this.dataModelOptions.query;
          this.fetchData();
        }
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
        //this.widgetScope.$emit('widgetChanged', this.widget); // this is implicitly called

        this.updateScope([]); //reset
        this.fetchData();
      },

      destroy: function () {
        this.kafkaService.unsubscribe();
      }
    });

    return KafkaTimeSeriesWidgetDataModel;
  });