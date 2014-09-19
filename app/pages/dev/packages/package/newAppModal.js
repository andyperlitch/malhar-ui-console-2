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

angular.module('app.pages.dev.packages.package.newAppModal', [
  'ui.bootstrap.modal',
  'app.components.filters.urlFriendly',
  'app.components.resources.PackageApplicationModel'
])
.factory('newAppModal', function($modal, $timeout) {
  return function() {

    // Open the modal
    var instance = $modal.open({
      controller: 'newAppModalController',
      templateUrl: 'pages/dev/packages/package/newAppModal.html',
      resolve: {

      }
    });

    // Put focus on the field (must defer)
    instance.opened.then(function() {
      $timeout(function() {
        var el = $('#new_app_name');
        if (!el) {
          return;
        }
        el.focus();
        el[0].setSelectionRange(0,9999);
      }, 200);
    });

    return instance.result;
  };
})
.controller('newAppModalController', function($scope, $routeParams, PackageApplicationModel, $filter, $log) {

  // Set up model in scope
  $scope.app = {
    name: 'Untitled Application'
  };

  /**
   * Creates the app, closes the modal
   */
  $scope.create = function(formCtrl) {

    var displayName = $scope.app.name;
    var appName = $filter('urlFriendly')(displayName);
    var params = _.pick($routeParams, ['packageName', 'packageVersion']);
    params.appName = appName;

    // Set up resource, populate with empty ops, streams.
    var resource = new PackageApplicationModel(params);
    resource.data.fileContent = {
      displayName: displayName,
      operators: [],
      streams: []
    };

    // Save (true=errorIfExists)
    resource.save(true).then(
      // Successful save
      function(result) {
        $log.info('New app saved!', result);
        $scope.$close(appName);
      },
      // Error saving
      function(result) {
        $log.info('Error saving new app!', result);

        // Check for unique name error
        if (result.status === 412) {
          formCtrl.new_app_name.$setValidity('uniqueName', false);
          formCtrl.new_app_name.$errorMessages = { uniqueName: result.data.message };
        }
        else {
          formCtrl.new_app_name.$setValidity('serverError', false);
          formCtrl.new_app_name.$errorMessages = { serverError: result.data.message };
        }
      }
    );

  };

})
.directive('resetValidityOnChange', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      var key = attrs.resetValidityOnChange;
      ngModel.$parsers.unshift(function(value) {
        ngModel.$setValidity(key, true);
        return value;
      });
    }
  };
});