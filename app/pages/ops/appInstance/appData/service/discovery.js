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

angular.module('app.pages.ops.appInstance.appData.service.KafkaDiscovery', [])
  .factory('KafkaDiscovery', function ($q, OpPropertiesModel, LogicalOperatorCollection, clientSettings) {
    function KafkaDiscovery(appId) {
      this.appId = appId;
      this.deferred = $q.defer();
      this.fetchPromise = this.deferred.promise;
    }

    KafkaDiscovery.prototype = {
      fetchOpProperties: function (operator) {
        if (!operator) {
          return;
        }

        var operatorName = operator.name;
        var propertiesResource = new OpPropertiesModel({
          appId: this.appId,
          operatorName: operatorName
        });

        return propertiesResource.fetch().then(function (properties) {
          operator.properties = properties;
        });
      },

      fetch: function () {
        var operators = new LogicalOperatorCollection({ appId: this.appId });
        operators.fetch().then(function (operators) { // success
          this.kafakInputOperator = _.findWhere(operators, clientSettings.kafka.discovery.inputOperatorFilter);
          this.kafakOutputOperator = _.findWhere(operators, clientSettings.kafka.discovery.outputOperatorFilter);
          this.dimensionsOperator = _.findWhere(operators, clientSettings.kafka.discovery.dimensionsOperatorFilter);

          this.wsInputOperator = _.findWhere(operators, clientSettings.kafka.discovery.wsInputOperatorFilter);
          this.wsOutputOperator = _.findWhere(operators, clientSettings.kafka.discovery.wsOutputOperatorFilter);

          this.databaseOperator = _.findWhere(operators, clientSettings.kafka.discovery.databaseOperatorFilter);
          //this.dimensionsOperator = _.findWhere(operators, {className: 'com.datatorrent.demos.adsdimension.generic.GenericDimensionComputation'});

          var propertiesPromise = null;
          if (this.isKafka()) {
            propertiesPromise = $q.all([
                this.fetchOpProperties(this.kafakInputOperator),
                this.fetchOpProperties(this.kafakOutputOperator),
                this.fetchOpProperties(this.dimensionsOperator)]);
          } else if (this.isGatewayWebSocket()) {
            propertiesPromise = $q.all([
                this.fetchOpProperties(this.wsInputOperator),
                this.fetchOpProperties(this.wsOutputOperator),
                this.fetchOpProperties(this.dimensionsOperator)]);
          } else if (this.databaseOperator) {
            this.deferred.resolve();
          } else {
            this.deferred.reject('no supported operator type found');
          }

          if (propertiesPromise) {
            propertiesPromise.then(function () { // success
              this.deferred.resolve();
            }.bind(this), function () { // fail
              this.deferred.reject('failed to fetch operator properties');
            }.bind(this));
          }
        }.bind(this), function (reason) { // fail
          this.deferred.reject(reason);
        }.bind(this));

        return this.deferred.promise;
      },

      isKafka: function () {
        return (this.kafakInputOperator && this.kafakOutputOperator && this.dimensionsOperator);
      },

      isGatewayWebSocket: function () {
        return (this.wsInputOperator && this.wsOutputOperator && this.dimensionsOperator);
      },

      getDiscoveredType: function () {
        //TODO discovery mechanism
        if (this.databaseOperator) {
          return 'database';
        } else if (this.dimensionsOperator) {
          return 'appData'; //TODO change to 'dimensions'
        } else {
          return null;
        }
      },

      getFetchPromise: function () {
        return this.deferred.promise;
      },

      getKafkaTopics: function () {
        return {
          queryTopic: this.kafakInputOperator.properties.consumer.topic,
          resultTopic: this.kafakOutputOperator.properties.topic
        };
      },

      getGatewayWebSocketTopics: function () {
        return {
          queryTopic: this.wsInputOperator.properties.topic,
          resultTopic: this.wsOutputOperator.properties.topic
        };
      },

      getDimensionList: function () {
        if (this.dimensionList) {
          return this.dimensionList;
        }

        if (!this.dimensionsOperator || !this.dimensionsOperator.properties || !this.dimensionsOperator.properties.aggregators) {
          return null;
        }

        var aggregators = this.dimensionsOperator.properties.aggregators;
        var dimensionSet = {};
        _.each(aggregators, function (aggregator) {
          var dimensionString = aggregator.dimension;
          var dimensions = dimensionString.split(':');

          dimensions = _.reject(dimensions, function (dimension) {
            return dimension.indexOf('=') >= 0;
          });
          _.each(dimensions, function (dimension) {
            dimensionSet[dimension] = true;
          });
        });

        this.dimensionList = _.keys(dimensionSet);
        return this.dimensionList;
      }
    };

    return KafkaDiscovery;
  });