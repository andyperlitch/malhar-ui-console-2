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

angular.module('app.pages.dev.packages.package.removeAppModal', [
  'ui.bootstrap.modal',
  'app.components.resources.PackageApplicationModel'
])
.factory('removeAppModal', function($modal) {
  return function(appName) {
    // Open the modal
    var instance = $modal.open({
      controller: 'removeAppModalController',
      templateUrl: 'pages/dev/packages/package/removeAppModal.html',
      resolve: {
        appName: function() { return appName; }
      }
    });

    return instance.result;
  };
})
.controller('removeAppModalController', function($scope, $routeParams, PackageApplicationModel, $filter, $log, appName) {
  /**
   * Removes the app, closes the modal
   */
  $scope.appName = appName;
  $scope.remove = function(formCtrl) {
    var params = _.pick($routeParams, ['packageName', 'packageVersion']);
    params.appName = $scope.appName;

    // Set up resource, populate with empty ops, streams.
    var resource = new PackageApplicationModel(params);
    $scope.removing = true;
    resource.remove().then(
      // Successful save
      function(result) {
        $log.info('App removed.', result);
        $scope.$close($scope.appName);
        // Unset removing flag
        $scope.removing = false;
      },
      // Error removing
      function(result) {
        $log.info('Error removing app!', result);

        // Check for unique name error
        formCtrl.new_app_name.$setValidity('serverError', false);
        formCtrl.new_app_name.$errorMessages = { serverError: result.data.message };

        $scope.$close($scope.appName);
        // Unset removing flag
        $scope.removing = false;
      }
    );
  };
});
