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
 * @name  app.pages.config.login
 * @description  Login page module.
 * @requires app.components.services.userSession
 */
angular.module('app.pages.config.login', [
  'app.components.services.userSession'
])

// Routing
.config(function(settings, $routeProvider) {
  $routeProvider.when(settings.pages.Login, {
    templateUrl: 'pages/config/login/login.html',
    controller: 'LoginPageCtrl',
    label: 'Login'
  });
})

// Controller
.controller('LoginPageCtrl', function($scope, userSession) {

  // Initialize credentials object
  $scope.credentials = {};

  // Define login action
  $scope.login = function(credentials) {
    $scope.loginError = null;
    $scope.attemptingLogin = true;
    userSession
      .login(credentials.principal, credentials.password)
      .then(
        function() {
          // login successful
        },
        function() {
          // login unsuccessful
          $scope.loginError = 'Login failed.';
        }
      )
      .finally(function() {
        $scope.attemptingLogin = false;
      });
  };

});