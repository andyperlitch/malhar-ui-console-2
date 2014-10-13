/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('app.pages.dev.packages', [
  'app.components.resources.PackageModel',
  'app.components.resources.PackageCollection',
  'app.components.services.dtText',
  'app.components.services.confirm',
  'app.components.widgets.fileUpload'
])

// Routing
  .config(function($routeProvider, settings) {

    $routeProvider.when(settings.pages.Packages, {
      controller: 'PackagesCtrl',
      templateUrl: 'pages/dev/packages/packages.html',
      label: 'Packages'
    });

  })

// Controller
  .controller('PackagesCtrl', function($scope, $rootScope, PackageModel, PackageCollection, FileUploadModal, confirm, dtText) {
    function fetchPackages() {
      $scope.packages = new PackageCollection();
      $scope.packages.fetch();
    }

    fetchPackages();

    $scope.fileUploadOptions = {
      url: $scope.packages.url,
      success: function (fileItem) {
        $scope.alerts.push({
          type: 'success',
          msg: '"' + fileItem.name + '" uploaded'
        });

        fetchPackages();
      }
    };

    angular.extend($scope, {
      alerts: [],

      upload: function () {
        var modal = new FileUploadModal($scope.fileUploadOptions);
        modal.open();
      },

      remove: function (appPackage) {
        return confirm({
          title: dtText.get('Confirm Package Delete'),
          body: dtText.get('Are you sure you want to delete ' + appPackage.appPackageName + '?')
        })
        .then(function() {
          var packageModel = new PackageModel({
            packageName: appPackage.appPackageName,
            packageVersion: appPackage.appPackageVersion
          });

          packageModel.remove().then(function () {
            $scope.alerts.push({
              type: 'success',
              msg: 'Application package"' + appPackage.appPackageName + ' ' + appPackage.appPackageVersion + '" is deleted'
            });

            fetchPackages();
          }, function () {
            $scope.alerts.push({
              type: 'danger',
              msg: 'Failed to remove application package"' + appPackage.appPackageName + ' ' + appPackage.appPackageVersion + '"'
            });
          });
        });
      },

      closeAlert: function (index) {
        $scope.alerts.splice(index, 1);
      }
    });

    if ($rootScope.message) {
      $scope.alerts.push($rootScope.message);
      delete $rootScope.message;
    }
  });
