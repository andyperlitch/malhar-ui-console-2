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
 * @requires  app.components.services.dtText
 * @requires  app.components.services.confirm
 * @requires  app.settings
 */
angular.module('app.components.resources.UserModel', [
  'app.components.resources.BaseModel',
  'app.components.services.getUri',
  'app.components.services.confirm',
  'app.components.services.dtText',
  'app.settings'
])
.factory('UserModel', function($log, BaseModel, getUri, $http, $q, PERMISSIONS, confirm, dtText) {
  var UserModel = BaseModel.extend({
    debugName: 'User',
    urlKey: 'User',
    idAttribute: 'userName',
    onFetchError: function(res) {
      // Check for authentication issue
      if (res.status === 401 || res.status === 403) {
        this.clear();
      }
      BaseModel.prototype.onFetchError.call(this, res);
    },
    /**
     * @ngdoc method
     * @name  login
     * @description Attempt a login with provided credentials.
     * @methodOf app.components.resources.UserModel
     * @param  {string} userName  The username to login with.
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
          $log.debug('Login successful. User Data: ', data);
          dfd.resolve(res);
        },
        function(res) {
          dfd.reject(res);
        }
      );
      return dfd.promise;
    },

    /**
     * @ngdoc method
     * @name  logout
     * @description  Logs out the current user.
     * @methodOf app.components.resources.UserModel
     * @return {Promise}  Promise that resolves if logout was successful and rejects if logout is unsuccessful.
     */
    logout: function() {
      var self = this;
      var dfd = $q.defer();
      var logoutUrl = getUri.action('logout');
      $http.post(logoutUrl).then(
        function() {
          // Clear all data here
          self.clear();
          dfd.resolve();
        },
        function() {
          dfd.reject();
        }
      );
      return dfd.promise;
    },

    /**
     * @ngdoc        method
     * @name         can
     * @methodOf     app.components.resources.UserModel
     * @description  Determines whether the user can do something or not.
     * 
     * @param  {string}   ability The ability that this user can or cannot do.
     * @return {boolean}          True if the user can do it, false if it cannot.
     * 
     * @example
     * <pre>user.can('MANAGE_ROLES')</pre>
     */
    can: function(ability) {

      if (!PERMISSIONS.hasOwnProperty(ability)) {
        $log.warn('Permission ability "' + ability + '" is unknown to the UI! Assuming the user CAN do these things and let errors happen if need be.');
        return true;
      }

      if (this.data.permissions && this.data.permissions.indexOf(PERMISSIONS[ability]) > -1) {
        return true;
      }

      return false;

    },

    /**
     * @ngdoc method
     * @name  is
     * @description Determines whether this user has a specified role.
     * @methodOf app.components.resources.UserModel
     * @param {string} role The role to check for.
     * @return {Boolean} True if the user is this role, false if not.
     *
     * @example
     * <pre>user.is('admin')</pre>
     */
    is: function(role) {
      this.data.roles = this.data.roles || [];
      return this.data.roles.indexOf(role) > -1;
    },

    /**
     * @ngdoc method
     * @name  addRole
     * @description Adds a role to this user's roles if it is not already present.
     * @methodOf app.components.resources.UserModel
     * @param {string} role The role to add.
     * @return {UserModel} Returns user for chaining.
     */
    addRole: function(role) {
      this.data.roles = this.data.roles || [];
      if (!this.is(role)) {
        this.data.roles.push(role);
      }
      return this;
    },

    /**
     * @ngdoc method
     * @name  removeRole
     * @description Removes a role from this user's roles if it is present.
     * @methodOf app.components.resources.UserModel
     * @param {string} role The role to remove.
     * @return {UserModel} Returns user for chaining.
     */
    removeRole: function(role) {
      this.data.roles = this.data.roles || [];
      var index = this.data.roles.indexOf(role);
      if (index > -1) {
        this.data.roles.splice(index,1);
      }
      return this;
    },

    /**
     * @ngdoc method
     * @name  create
     * @methodOf app.components.resources.UserModel
     * @description  Creates this user for the first time. For updating, see { @link app.components.resources.UserModel.save save }.
     * @return {Promise} Promise that resolves if creation was successful.
     */
    create: function() {
      var saveUrl = getUri.url('Users', this.data.userName);
      return $http.put(saveUrl, this.data);
    },

    /**
     * @ngdoc method
     * @name  save
     * @methodOf app.components.resources.UserModel
     * @description  Saves (updates) information about the user. For creation, see { @link app.components.resources.UserModel.create create }.
     * @param  {string=} newPassword The new password to change to. If oldPassword is present, this is required.
     * @param  {string=} oldPassword The old password to be changing.
     * @return {Promise}             Promise that resolves if save was successful.
     */
    save: function(newPassword, oldPassword) {
      var data = angular.copy(this.data);
      if (newPassword) {

        data.newPassword = newPassword;
        data.oldPassword = oldPassword;
        
      }
      var saveUrl = getUri.url('Users', this.data.userName);
      return $http.post(saveUrl, data);
    },

    /**
     * @ngdoc method
     * @name  delete
     * @methodOf app.components.resources.UserModel
     * @description  Deletes this user.
     * @param {boolean} force Deletes the user without asking.
     * @return {Promise}      Promise for the delete action
     */
    delete: function(force) {
      var deleteUrl = getUri.url('Users', this.data.userName);

      if (force) {
        return $http.delete(deleteUrl);
      }

      return confirm({
        title: dtText.sprintf('Delete user %s?', this.data.userName),
        body: dtText.sprintf('You are about to delete the following user: %s. Proceed?', this.data.userName)
      }).then(function() {
        return $http.delete(deleteUrl);
      });
    }

  });
  return UserModel;
});