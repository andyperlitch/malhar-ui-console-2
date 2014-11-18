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
 * @name  app.pages.config.profile
 * @description  Module for authentication/authorization management.
 * @requires  app.settings
 */
angular.module('app.pages.config.profile', [
  'app.settings',
  'app.components.services.userStorage',
  'app.components.services.confirm',
  'app.components.services.dtText'
])

// Route
.config(function(settings, $routeProvider) {
  $routeProvider.when(settings.pages.UserProfile, {
    controller: 'UserProfileCtrl',
    templateUrl: 'pages/config/profile/profile.html',
    label: 'User Profile'
  });
})

// controller
.controller('UserProfileCtrl', function(settings, $scope, PERMISSIONS, userStorage, confirm, dtText) {
  $scope.settings = settings;
  $scope.PERMISSIONS = PERMISSIONS;
  $scope.userStorage = userStorage;
  $scope.consoleSettings = userStorage.toObject();

  $scope.startPageOptions = ['/ops', '/config', '/packages', '/config/profile'];

  $scope.clearSettings = function() {
    confirm({ title: dtText.get('Clear all console settings?'), body: dtText.get('This action cannot be undone.')})
      .then(
        function() {
          userStorage.clear();
        }
      );
  };

  $scope.$watch('consoleSettings', function() {
    userStorage.save();
  }, true);

});