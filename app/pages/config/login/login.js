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
 * @requires app.components.services.currentUser
 * @requires app.components.directives.focusOn
 */
angular.module('app.pages.config.login', [
  'app.components.services.currentUser',
  'app.components.directives.focusOn',
  'app.components.directives.loginForm'
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
.controller('LoginPageCtrl', function($scope, currentUser, $location, $timeout) {

  $scope.loginSuccessHandler = function() {
    // login successful
    var redirectUrl = $location.search().redirect;
    if (typeof redirectUrl !== 'string' || !redirectUrl.length) {
      redirectUrl = '/ops';
    }
    $location.url(redirectUrl);
  };

  $timeout(function() {
    $scope.$broadcast('putFocusOnLoginUsername');
  }, 200);

});
