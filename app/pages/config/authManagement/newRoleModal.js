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

angular.module('app.pages.config.authManagement.newRoleModal', [
  'ui.bootstrap.modal',
  'app.components.resources.RoleModel'
])

.factory('newRoleModal', function($modal, $timeout, $rootScope) {

  return function(roles) {
    var instance = $modal.open({
      templateUrl: 'pages/config/authManagement/newRoleModal.html',
      resolve: {
        roles: function() {
          return roles;
        }
      },
      controller: 'newRoleModalController'
    });

    // Put focus on the field (must defer)
    instance.opened.then(function() {
      $timeout(function() {
        $rootScope.$broadcast('newRoleModalOpened');
      }, 200);
    });

    return instance.result;
  };

})

.controller('newRoleModalController', function($scope, roles, RoleModel) {

  $scope.newRole = new RoleModel().set({permissions: []});
  $scope.roles = roles;

  $scope.create = function(roleForm, newRole) {
    $scope.saveError = null;
    newRole.save().then(
      function() {
        $scope.$close();
      },
      function(err) {
        $scope.saveError = err.statusText;
      }
    );
  };

});