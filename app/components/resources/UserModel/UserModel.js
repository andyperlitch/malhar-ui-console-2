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
 * @ngdoc service
 * @name  app.components.resources.UserModel
 * @description  Represents a user.
 * @requires  app.components.resources.BaseModel
 */
angular.module('app.components.resources.UserModel', [
  'app.components.resources.BaseModel'
])
.factory('UserModel', function(BaseModel) {
  var UserModel = BaseModel.extend({
    debugName: 'User',
    urlKey: 'User',
    transformResponse: function(raw) {
      var result = angular.copy(raw);
      result.scheme = result['auth-scheme'];
      delete result['auth-scheme'];
      return result;
    },
    onFetchError: function(res) {
      // Check for authentication issue
      if (res.status === 401 || res.status === 403) {
        this.data = {};
      }
      BaseModel.prototype.onFetchError.call(this, res);
    }
  });
  return UserModel;
});