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
      ///////////////////////////////////////////////////
      // HADOOP WORLD DEMO HACK BELOW
      var hacky_timestamp = (new Date()).getTime();
      var hadoop_world_operator_classnames = [
        'JsonSalesGenerator',
        'JsonToMapConverter',
        'EnrichmentOperator',
        'GenericDimensionComputation',
        'KafkaSinglePortStringInputOperator',
        'DimensionStoreOperator',
        'KafkaSinglePortOutputOperator'
      ];
      // HADOOP WORLD DEMO HACK ABOVE
      ///////////////////////////////////////////////////
      _.each(raw.operatorClasses, function(op) {
        // Add packageName and className to operator object
        op.packageName = op.name.replace(/\.[^\.]+$/, '');
        op.simpleName = op.name.replace(/.*(?=\.)\./, '');
        op.simpleNameNoOperator = op.simpleName.replace(/Operator$/, '');

        // The gateway eats trailing periods on the description.
        // This is a band-aid fix. SPOI-3327
        if (op.shortDesc && op.shortDesc.slice(-1) !== '.') {
          op.shortDesc += '.';
        }

        ///////////////////////////////////////////////////
        // HADOOP WORLD DEMO HACKS BELOW
        if (hadoop_world_operator_classnames.indexOf(op.simpleName) > -1) {
          op.tags.push('hwdemo');
          op.tags.push('o15demo');
          op.tags.push('o15');
        }
        if (!op.attributes) {
          op.attributes = {};
        }
        if (!op.default_properties) {
          op.default_properties = {};
        }
        if (op.simpleName === 'JsonSalesGenerator') {
          op.attributes.INITIAL_PARTITION_COUNT = 2;
          op.default_properties.maxTuplesPerWindow = 40000;
        }
        if (op.simpleName === 'EnrichmentOperator') {
          if (!op.inputPorts[0].attributes) {
            op.inputPorts[0].attributes = {};
          }
          op.inputPorts[0].attributes.PARTITION_PARALLEL = true;
          op.default_properties.filePath = 'products.json';
          op.default_properties.lookupKey = 'productId';
        }
        if (op.simpleName === 'DimensionStoreOperator') {
          op.attributes.INITIAL_PARTITION_COUNT = 4;
          op.default_properties.maxCacheSize = 5;
          op.default_properties['fileStore.basePath'] = 'O15DimensionsStore_' + hacky_timestamp;
        }
        if (op.simpleName === 'JsonToMapConverter') {
          if (!op.inputPorts[0].attributes) {
            op.inputPorts[0].attributes = {};
          }
          op.inputPorts[0].attributes.PARTITION_PARALLEL = true;
        }
        if (op.simpleName === 'GenericDimensionComputation') {
          if (!op.inputPorts[0].attributes) {
            op.inputPorts[0].attributes = {};
          }
          op.inputPorts[0].attributes.PARTITION_PARALLEL = true;
          op.attributes.APPLICATION_WINDOW_COUNT = 4;
        }
        if (op.simpleName === 'KafkaSinglePortStringInputOperator') {
          op.default_properties.brokerSet = 'node25.morado.com:9092';
          op.default_properties.topic = 'O15DimensionsQuery_' + hacky_timestamp;
        }
        if (op.simpleName === 'KafkaSinglePortOutputOperator') {
          op.default_properties.topic = 'O15DimensionsQueryResult_' + hacky_timestamp;
          op.default_properties['configProperties(metadata.broker.list)'] = 'node25.morado.com:9092';
          op.default_properties['configProperties(serializer.class)'] = 'com.datatorrent.demos.dimensions.ads.KafkaJsonEncoder';
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
