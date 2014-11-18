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
 * @ngdoc object
 * @name  app.pages.config.authManagement
 * @description  Module for authentication/authorization management.
 * @requires  app.settings
 * @requires  app.components.resources.UserCollection
 * @requires  app.components.resources.RoleCollection
 * @requires  app.components.services.currentUser
 * @requires  app.pages.config.authManagement.newUserModal
 */
angular.module('app.pages.config.authManagement', [
  'ngRoute',
  'app.settings',
  'app.components.resources.UserCollection',
  'app.components.resources.RoleCollection',
  'app.components.services.currentUser',
  'app.components.directives.userRolesList',
  'app.pages.config.authManagement.newUserModal',
  'app.components.services.changePasswordModal',
  'app.pages.config.authManagement.newRoleModal'
])

// Route
.config(function($routeProvider, settings) {
  $routeProvider
    .when(settings.pages.AuthManagement, {
      controller: 'AuthManagementCtrl',
      templateUrl: 'pages/config/authManagement/authManagement.html',
      label: 'Auth Management'
    });
})

// controller
.controller('AuthManagementCtrl', function($scope, RoleCollection, UserCollection, currentUser, PERMISSIONS, newUserModal, newRoleModal, changePasswordModal) {
  
  $scope.PERMISSIONS = PERMISSIONS;
  $scope.changePasswordModal = changePasswordModal;
  $scope.roles = new RoleCollection();
  $scope.roles.fetch();
  $scope.flags = {};

  if (currentUser.can('MANAGE_ROLES')) {

    $scope.createRole = function() {
      newRoleModal($scope.roles).then(function() {
        $scope.roles.fetch();
      });
    };

    $scope.deleteRole = function(role) {
      // HACK:
      
      // this:
      RoleCollection.prototype.model.prototype.delete.call({ data: role })

      // should be:
      // role.delete()

      .then(function() {
        $scope.roles.data.splice($scope.roles.data.indexOf(role), 1);
      });
    };

    $scope.cancelRoleChanges = function() {
      $scope.roles.fetch();
      $scope.flags.editingRoles = false;
    };

    $scope.saveRoles = function() {
      $scope.saveRolesError = null;
      var savePromise = $scope.roles.save();
      savePromise.then(
        function() {
          return $scope.roles.fetch().then(function() {
            $scope.flags.editingRoles = false;
          });
        },
        function(err) {
          $scope.saveRolesError = err;
        }
      );
      savePromise.finally(function() {
        $scope.flags.savingRoles = false;
      });
    };
  }

  if (currentUser.can('MANAGE_USERS')) {
    $scope.users = new UserCollection();
    $scope.users.fetch();
    $scope.createUser = function(users, roles) {
      newUserModal(users,roles).then(function() {
        $scope.users.fetch();
      });
    };

    $scope.deleteUser = function(user) {
      user.delete().then(function() {
        $scope.users.fetch();
      });
    };
  }

});