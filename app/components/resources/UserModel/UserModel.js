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
 * @requires  app.components.services.getUri
 */
angular.module('app.components.resources.UserModel', [
  'app.components.resources.BaseModel'
])
.factory('UserModel', function(BaseModel, getUri, $http, $q) {
  var UserModel = BaseModel.extend({
    debugName: 'User',
    urlKey: 'User',
    onFetchError: function(res) {
      // Check for authentication issue
      if (res.status === 401 || res.status === 403) {
        this.data = {};
      }
      BaseModel.prototype.onFetchError.call(this, res);
    },
    /**
     * @ngdoc method
     * @name  login
     * @description Attempt a login with provided credentials.
     * @methodOf app.components.resources.UserModel
     * @param  {string} userName  The username/principal to login with.
     * @param  {string} password  The password to login with
     * @return {Promise}          Resolves if login succeeds, rejects if login fails
     */
    login: function(userName, password) {
      var dfd = $q.defer();
      var self = this;
      var loginUrl = getUri.action('login');
      $http.post(loginUrl, { userName: userName, password: password }).then(
        function(res) {
          var data = res.data;
          self.set(data);
          dfd.resolve(res);
        },
        function(res) {
          dfd.reject(res);
        }
      );
      return dfd.promise;
    }
  });
  return UserModel;
});