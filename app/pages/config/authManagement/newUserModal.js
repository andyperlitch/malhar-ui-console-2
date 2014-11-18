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

angular.module('app.pages.config.authManagement.newUserModal', [
  'app.components.resources.UserModel',
  'ui.bootstrap.modal',
  'app.components.directives.validation.uniqueInSet',
  'app.components.directives.focusOn',
  'ui.validate'
])

/**
 * @ngdoc  service
 * @name   app.pages.config.authManagement.newUserModal
 * @description Modal for creating a new user.
 * @requires  ui.bootstrap.modal
 * @requires  app.components.filters.urlFriendly
 * @requires  app.components.resources.UserModel
 * @requires  ui.bootstrap.modal
 * @requires  app.components.directives.validation.uniqueInSet
 * @requires  app.components.directives.focusOn
 */
.factory('newUserModal', function($modal, $rootScope, $timeout) {

  return function(users, roles) {

    // Open the modal
    var instance = $modal.open({
      controller: 'newUserModalController',
      templateUrl: 'pages/config/authManagement/newUserModal.html',
      resolve: {
        users: function() {
          return users;
        },
        roles: function() {
          return roles;
        }
      }
    });

    // Put focus on the field (must defer)
    instance.opened.then(function() {
      $timeout(function() {
        $rootScope.$broadcast('newUserModalOpened');
      }, 200);
    });

    return instance.result;
  };

})

.controller('newUserModalController', function($scope, UserModel, users, roles) {
  $scope.newUser = new UserModel();
  $scope.users = users;
  $scope.roles = roles;
  $scope.create = function(formCtrl, newUser) {
    $scope.createError = null;
    newUser.create().then(
      function() {
        $scope.$close(newUser);
      },
      function(res) {
        $scope.createError = res.statusText;
      }
    );
  };
});