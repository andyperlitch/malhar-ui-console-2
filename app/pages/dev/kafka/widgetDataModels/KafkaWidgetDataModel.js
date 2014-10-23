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
  .factory('KafkaWidgetDataModel', function (WidgetDataModel, KafkaRestService, KafkaSocketService, GatewayAppDataService, clientSettings) {
    function KafkaWidgetDataModel() {
    }

    KafkaWidgetDataModel.prototype = Object.create(WidgetDataModel.prototype);
    KafkaWidgetDataModel.prototype.constructor = WidgetDataModel;

    angular.extend(KafkaWidgetDataModel.prototype, {
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

        if (false && !this.kafkaService) { //TODO
          //this.kafkaService = new KafkaSocketService();
          this.kafkaService = new GatewayAppDataService();
        }

        var kafkaQuery = this.query;

        var kafkaDiscovery = this.widgetScope.kafkaDiscovery;
        if (kafkaDiscovery) {
          if (kafkaDiscovery.isKafka() && !kafkaQuery.kafka) {
            kafkaQuery = _.clone(kafkaQuery);
            angular.extend(kafkaQuery, {
              kafka: kafkaDiscovery.getKafkaTopics()
            });
          } else if (kafkaDiscovery.isGatewayWebSocket() && !kafkaQuery.gateway) {
            kafkaQuery = _.clone(kafkaQuery);
            angular.extend(kafkaQuery, {
              gateway: kafkaDiscovery.getGatewayWebSocketTopics()
            });
          }
        }

        if (this.kafkaService) {
          this.kafkaService.unsubscribe();
        }

        if (kafkaQuery.kafka) {
          this.kafkaService = new KafkaSocketService();
        } else {
          this.kafkaService = new GatewayAppDataService();
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

    return KafkaWidgetDataModel;
  });