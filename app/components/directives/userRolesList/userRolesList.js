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

angular.module('app.components.directives.userRolesList', [
  'app.components.services.currentUser',
  'app.components.resources.UserModel',
  'app.components.resources.RoleCollection'
])

/**
 * @ngdoc directive
 * @name  app.components.directives.userRolesList
 * @restrict EAC
 * @description Shows a users roles as tags that can be deleted or added to if the current user can do so.
 * @param {UserModel} user The user model to update.
 * @param {RoleCollection} roles All the available roles on the DT installation.
 * @param {boolean=} autoSave Whether or not to automatically save the user to the server.
 * @requires app.components.resources.UserModel
 * @requires app.components.resources.RoleCollection
 * @requires app.components.services.currentUser
 * @example
 * <pre><div user-roles-list user="userToEdit" roles="RoleCollection" auto-save="false"></div></pre>
 */
.directive('userRolesList', function(currentUser, UserModel, RoleCollection) {

  return {

    templateUrl: 'components/directives/userRolesList/userRolesList.html',

    scope: {
      user: '=',
      roles: '=',
      autoSave: '=?'
    },

    link: function(scope) {
      
      // Check if the user object is an instance of UserModel
      if (!(scope.user instanceof UserModel)) {
        throw new TypeError('The user attribute must point to a UserModel');
      }

      // Check if the roles object in an instance of RoleCollection
      if (!(scope.roles instanceof RoleCollection)) {
        throw new TypeError('The roles attribute must point to a RoleCollection'); 
      }

      // Add currentUser to scope
      scope.currentUser = currentUser;

      // Methods for adding/removing roles
      scope.addRole = function(role) {
        scope.user.addRole(role);

        if (scope.autoSave) {
          scope.user.save();
        }

      };

      scope.removeRole = function(role) {
        scope.user.removeRole(role);

        if (scope.autoSave) {
          scope.user.save();
        }
      };

    }
  };

});