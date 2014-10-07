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
          //this.dimensionsOperator = _.findWhere(operators, {className: 'com.datatorrent.demos.adsdimension.generic.GenericDimensionComputation'});

          $q.all([
              this.fetchOpProperties(this.kafakInputOperator),
              this.fetchOpProperties(this.kafakOutputOperator),
              this.fetchOpProperties(this.dimensionsOperator)]
          ).then(function () { // success
              this.deferred.resolve();
            }.bind(this), function () { // fail
              this.deferred.reject('failed to fetch operator properties');
            }.bind(this));
        }.bind(this), function (reason) { // fail
          this.deferred.reject(reason);
        });

        return this.deferred.promise;
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

      getDimensionList: function () {
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

        return _.keys(dimensionSet);
      }
    };

    return KafkaDiscovery;
  });