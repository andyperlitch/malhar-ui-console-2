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

angular.module('app.components.resources.PhysicalOperatorCollection', [
  'app.components.resources.BaseCollection',
  'app.components.resources.PhysicalOperatorModel'
])
.factory('PhysicalOperatorCollection', function (BaseCollection, PhysicalOperatorModel) {

  var PhysicalOperatorCollection = BaseCollection.extend({

    constructor: function(options) {
      BaseCollection.apply(this, arguments);

      if (options.containerId) {

        var containerId = options.containerId;
        this.transformResponse = function(raw) {
          return _.filter(raw.operators, function(o) {
            return o.container === containerId;
          });
        };

      }
    },
    urlKey: 'PhysicalOperator',
    topicKey: 'PhysicalOperators',
    transformResponse: 'operators',
    model: PhysicalOperatorModel

  });

  return PhysicalOperatorCollection;

});