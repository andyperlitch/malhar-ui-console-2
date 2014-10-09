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

angular.module('app.components.resources.PackageOperatorClassCollection', [
  'app.components.resources.BaseCollection',
  'app.components.resources.PackageOperatorClassModel'
])
.factory('PackageOperatorClassCollection', function(BaseCollection, PackageOperatorClassModel) {
  var PackageOperatorClassCollection = BaseCollection.extend({
    debugName: 'Package Operators',
    urlKey: 'PackageOperatorClass',
    transformResponse: function(raw) {
      _.each(raw.operatorClasses, function(op) {
        // Add packageName and className to operator object
        op.packageName = op.name.replace(/\.[^\.]+$/, '');
        op.simpleName = op.name.replace(/.*(?=\.)\./, '');
        op.simpleNameNoOperator = op.simpleName.replace(/Operator$/, '');

        ///////////////////////////////////////////////////
        // HADOOP WORLD DEMO HACKS BELOW
        if (!op.attributes) {
          op.attributes = {};
        }
        if (!op.default_properties) {
          op.default_properties = {};
        }
        if (op.simpleName === 'Average') {
          op.attributes.INITIAL_PARTITION_COUNT = 20;
          op.default_properties.name = 'hello';
        }
        if (op.simpleName === 'JsonAdInfoGenerator') {
          op.attributes.INITIAL_PARTITION_COUNT = 2;
          op.default_properties.maxTuplesPerWindow = 40000;
        }
        if (op.simpleName === 'DimensionStoreOperator') {
          op.attributes.INITIAL_PARTITION_COUNT = 4;
          op.default_properties.maxCacheSize = 5;
        }
        if (op.simpleName === 'JsonToMapConverter') {
          if (!op.inputPorts[0].attributes) {
            op.inputPorts[0].attributes = {};
          }
          op.inputPorts[0].attributes.PARTITION_PARALLEL = true;
        }
        if (op.simpleName === 'GenericDimensionComputation') {
          if (!op.outputPorts[0].attributes) {
            op.outputPorts[0].attributes = {};
          }
          op.outputPorts[0].attributes.PARTITION_PARALLEL = true;
          op.attributes.APPLICATION_WINDOW_COUNT = 4;
        }
        if (op.simpleName === 'KafkaSinglePortStringInputOperator') {
          op.default_properties.brokerSet = 'node25.morado.com:9092';
          op.default_properties.topic = 'GenericDimensionsQuery';
        }
        if (op.simpleName === 'KafkaSinglePortOutputOperator') {
          op.default_properties.topic = 'GenericDimensionsQueryResult';
          op.default_properties['configProperties(metadata.broker.list)'] = 'node25.morado.com:9092';
        }
        // HADOOP WORLD DEMO HACKS ABOVE
        ///////////////////////////////////////////////////
      });
      // do not include operators with no displayName
      raw.operatorClasses = _.filter(raw.operatorClasses, function(op) { return op.displayName; });
      return raw.operatorClasses;
    },
    model: PackageOperatorClassModel
  });
  return PackageOperatorClassCollection;
});
