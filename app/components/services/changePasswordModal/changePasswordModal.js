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

angular.module('app.components.services.changePasswordModal',[
  'ui.bootstrap.modal',
  'app.components.directives.focusOn',
  'app.components.services.currentUser',
  'ui.validate'
])
.factory('changePasswordModal', function($modal, $rootScope, $timeout, currentUser) {

  return function(user) {

    // Open the modal
    var instance = $modal.open({
      controller: 'changePasswordModalController',
      templateUrl: 'components/services/changePasswordModal/changePasswordModal.html',
      resolve: {
        user: function() {
          return user;
        }
      }
    });

    // Put focus on the field (must defer)
    instance.opened.then(function() {
      $timeout(function() {
        if (currentUser.can('MANAGE_USERS')) {
          $rootScope.$broadcast('changePasswordModalOpened_admin');
        } else {
          $rootScope.$broadcast('changePasswordModalOpened');
        }
      }, 200);
    });

    return instance.result;
  };

})

.controller('changePasswordModalController', function($scope, user, currentUser) {

  $scope.currentUser = currentUser;
  $scope.user = user;

  // Create a new model to pass info into user.save method
  $scope.passwords = {};

  $scope.save = function(formCtrl, passwords) {
    $scope.saveError = null;
    user.save(passwords.newPassword, passwords.oldPassword).then(
      function() {
        $scope.$close();
      },
      function(err) {
        $scope.saveError = err.statusText;
      }
    );
  };
});