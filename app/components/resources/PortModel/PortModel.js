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

angular.module('app.components.resources.PortModel',[
  'app.components.resources.BaseModel'
])
.factory('PortModel', function(BaseModel, $log) {
  var PortModel = BaseModel.extend({
    debugName: 'Port',
    urlKey: 'PhysicalOperator',
    topicKey: 'PhysicalOperators',
    idAttribute: 'name',
    transformResponse: function(raw, type) {
      var operatorId = this.operatorId;
      var op = _.find(raw.operators, function(o){
        return o.id === operatorId;
      });
      if (!op) {
        $log.warn('Operator #"' + operatorId + '" not found in operators ', raw.operators);
        return this.data;
      }
      var name = this.portName;
      var port = _.find(op.ports, function(p) {
        return p.name === name;
      });
      if (!port) {
        $log.warn('Port "' + name + '" not found in operator ', op);
        return this.data;
      }
      if (type === 'fetch') {
        delete op.ports;
        this.operator = op;
      }
      return port;
    }
  });
  return PortModel;
});