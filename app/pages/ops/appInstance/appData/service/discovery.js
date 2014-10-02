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
  .factory('KafkaDiscovery', function ($q, OpPropertiesModel, LogicalOperatorCollection) {
    function KafkaDiscovery(appId) {
      this.appId = appId;
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
        var deferred = $q.defer();

        var operators = new LogicalOperatorCollection({ appId: this.appId });
        operators.fetch().then(function (operators) { // success
          this.kafakInputOperator = _.findWhere(operators, {className: 'com.datatorrent.contrib.kafka.KafkaSinglePortStringInputOperator'});
          this.kafakOutputOperator = _.findWhere(operators, {className: 'com.datatorrent.contrib.kafka.KafkaSinglePortOutputOperator'});
          this.dimensionsOperator = _.findWhere(operators, {className: 'com.datatorrent.lib.statistics.DimensionsComputation'});

          $q.all([
              this.fetchOpProperties(this.kafakInputOperator),
              this.fetchOpProperties(this.kafakOutputOperator),
              this.fetchOpProperties(this.dimensionsOperator)]
          ).then(function () {
              deferred.resolve();
          }, function () {
            deferred.reject('failed to fetch operator properties');
          });
        }.bind(this), function (reason) { // fail
          deferred.reject(reason);
        });

        return deferred.promise;
      }
    };

    return KafkaDiscovery;
  });