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

angular.module('app.components.directives.loginForm', [
  'app.components.services.currentUser'
])

/**
 * @ngdoc directive
 * @name app.components.directives.loginForm
 * @restrict EA
 * @description A form used to login.
 * @param {Function} onSuccess The function to call when login is successful
 * @param {Boolean=} omitTitle If true, the "Login" title will be omitted.
**/
    
.directive('loginForm', function(currentUser) {

  return {
    templateUrl: 'components/directives/loginForm/loginForm.html',
    scope: {
      onSuccess: '=',
      omitTitle: '=?'
    },
    link: function($scope) {

      // Initialize credentials object
      $scope.credentials = {};

      $scope.login = function(credentials) {
        $scope.loginError = null;
        $scope.attemptingLogin = true;
        currentUser
          .login(credentials.userName, credentials.password)
          .then(
            $scope.onSuccess,
            function() {
              // login unsuccessful
              $scope.loginError = 'Login failed.';
            }
          )
          .finally(function() {
            $scope.attemptingLogin = false;
          });
      };
    }
  };

});