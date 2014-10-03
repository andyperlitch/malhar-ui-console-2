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

angular.module('app.pages.config.installWizard.license.InstallWizardLicenseUploadCtrl', [
  'app.components.services.getUri',
  'ui.bootstrap.modal'
])
.controller('InstallWizardLicenseUploadCtrl', function($scope, $element, $log, getUri, $http, $modal, $timeout) {
  $scope.fileUploadOptions = {
    url: getUri.url('License'),
    success: function(file) {
      
      // Set as current license
      $scope.uploadedLicense = file;

      // If successful, return to license screen
      $scope.makeUploadedLicenseCurrent();

    }
  };
  $scope.makeUploadedLicenseCurrent = function() {

    var status = {};

    var $modalInstance = $modal.open({
      templateUrl: 'pages/config/installWizard/makeLicenseCurrentModal.html',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        status: function() {
          return status;
        }
      },
      controller: function($scope, status) {
        $scope.status = status;
      }
    });

    $http.post(getUri.action('makeLicenseCurrent', { fileName: $scope.uploadedLicense.name })).then(
      function() {
        $log.info('Uploaded license made current. Filename: ', $scope.uploadedLicense.name);
        status.success = true;
        $scope.makeCurrentError = false;
        $timeout(function() {
          $modalInstance.close();
          $scope.goToStep('license');
        }, 2500);
      },
      function() {
        status.success = false;
        $modalInstance.close();
        $scope.makeCurrentError = true;
      }
    );
  };
});