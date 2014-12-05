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

/**
 * Application Model
 *
 * Represents an application instance.
 */

angular.module('app.components.resources.ApplicationModel', [
  'app.components.resources.BaseModel',
  'app.components.filters.relativeTimestamp',
  'app.components.filters.commaGroups'
])
/**
 * @ngdoc service
 * @name  app.components.resources.ApplicationModel
 * @description Represents an application instance.
 * @requires app.components.resources.BaseModel
 * @requires app.components.filters.commaGroups
 * @requires app.components.filters.relativeTimestamp
 */
.factory('ApplicationModel', function(BaseModel) {

  var ApplicationModel = BaseModel.extend({
    debugName: 'Application Instance',
    urlKey: 'Application',
    topicKey: 'Application',
    transformResponse: function(raw, type) {
      var rawCopy = angular.copy(raw);
      var updates;
      switch(type) {
        case 'subscribe':

          updates = {};
          // Move attributes to main object where applicable
          _.each(['recoveryWindowId', 'currentWindowId', 'state'], function(key) {
            updates[key] = raw[key];
            delete rawCopy[key];
          }, this);
          updates.stats = rawCopy;

          break;
        default:
          updates = rawCopy;
          break;
      }
      return updates;
    }
  });
  
  return ApplicationModel;
});