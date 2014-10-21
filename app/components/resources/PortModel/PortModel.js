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
.factory('PortModel', function(BaseModel) {
  var PortModel = BaseModel.extend({
    debugName: 'Port',
    urlKey: 'PhysicalOperator',
    topicKey: 'PhysicalOperators',
    idAttribute: 'name',
    transformResponse: function(raw) {
      var operatorId = this.operatorId;
      var op = _.find(raw.operators, function(o){
        return o.id === operatorId;
      });
      var name = this.portName;
      var port = _.find(op.ports, function(p) {
        return p.name === name;
      });
      return port;
    }
  });
  return PortModel;
});