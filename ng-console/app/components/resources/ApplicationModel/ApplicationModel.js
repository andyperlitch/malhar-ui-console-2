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
  'underscore',
  'app.components.resources.BaseModel'
])
.factory('ApplicationModel', function(_, BaseModel) {

  var ApplicationModel = BaseModel.extend({

    urlKey: 'Application',
    
    topicKey: 'Application',

    transformResponse: function(raw, type) {
      switch(type) {

        case 'subscribe':

          var updates = {};

          // Move attributes to main object where applicable
          _.each(['recoveryWindowId', 'currentWindowId', 'state'], function(key) {
              updates[key] = raw[key];
              delete raw[key];
          }, this);
          
          updates.stats = raw;
          // var lcState = updates.state.toLowerCase();
          // if ( lcState === 'running' || lcState === 'accepted' ) {
          //     updates.elapsedTime = +new Date() - 1 * this.get('startedTime');
          // }
          return updates;

        default: 
          
          return raw;

      }
    }

  });

  return ApplicationModel;
  
});