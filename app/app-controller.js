/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
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

angular.module('app')

.controller('AppCtrl', function (settings, $log, authentication, userStorage, $scope, $location, breadcrumbs, $routeParams, setupBreadcrumbs, notificationService, dtText, getUri) {
  // Initialize options
  breadcrumbs.options = {};

  // Set to scope
  $scope.breadcrumbs = breadcrumbs;
  $scope.$routeParams = $routeParams;

  // Route events
  $scope.$on('$locationChangeStart', function($event, route) {
    
    if (!authentication.hasRetrievedAuthStatus()) {
      // Stop the page load
      $event.preventDefault();

      // Get the auth status
      authentication.retrieveAuthStatus().then(
        function() {
          // Once auth status has been set, try re-triggering this route
          $location.url(route);
        },
        function(err) {
          // Error occurred trying to determine auth status, error and trigger anyway
          notificationService.error({
            title: dtText.get('Could not get authentication status'),
            text: dtText.get('It could not be determined whether or not your DataTorrent cluster has authentication enabled or disabled.')
          });

          $log.error('Auth status check failed. Server response: ', err);
          $location.url(route);
        }
      );

      // Exit out
      return;
    }

    // Auth status has been retrieved
    if (authentication.isEnabled()) {

      // Auth is enabled, check if authenticated
      if (!authentication.isAuthenticated()) {
        $event.preventDefault();
        $location.url(getUri.page('Login'));
        return;
      }

    }

  });
  $scope.$on('$routeChangeSuccess', function() {
    setupBreadcrumbs(breadcrumbs, $routeParams);
  });

  // load saved state in userStorage
  var json = localStorage.getItem(settings.STORAGE_KEY);
  var storage;

  if (json) {
    try {
      storage = JSON.parse(json);
    } catch (e) {
      $log.warn('State from localStorage could not be parsed! ', e);
      localStorage.removeItem(settings.STORAGE_KEY);
      storage = {};
    }
  } else {
    storage = {};
  }
  userStorage.load(storage);

});
