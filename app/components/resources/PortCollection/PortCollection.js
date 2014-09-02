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

angular.module('app.components.resources.PortCollection', [
  'app.components.resources.BaseCollection',
  'app.components.resources.PortModel'
])
.factory('PortCollection', function(BaseCollection, PortModel) {
  var PortCollection = BaseCollection.extend({
    debugName: 'Ports',
    urlKey: 'PhysicalOperator',
    topicKey: 'PhysicalOperators',
    transformResponse: function(raw) {
      var operatorId = this.operatorId;
      var operator = _.find(raw.operators, function(o) {
        return o.id === operatorId;
      });
      if (operator) {
        return operator.ports;
      }
      this.fetchError = new Error('Operator ' + operatorId + ' not found.');
      return [];
    },
    model: PortModel
  });
  return PortCollection;
});