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

angular.module('app.components.resources.StramEventCollection', [
  'app.components.resources.BaseCollection',
  'app.components.resources.StramEventModel'
])
.factory('StramEventCollection', function(BaseCollection, StramEventModel) {

  var StramEventCollection = BaseCollection.extend({
    urlKey: 'StramEvent',
    topicKey: 'StramEvents',
    transformResponse: function(raw, type) {

      if (type === 'subscribe') {
        console.log('test');
        return raw;
      }

      return raw.events;

    },
    model: StramEventModel
  });
  return StramEventCollection;

});