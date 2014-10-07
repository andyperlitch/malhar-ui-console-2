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

angular.module('app.pages.config.licenseInfo', [
  'app.components.resources.LicenseFileModel',
  'app.components.directives.licenseMemoryUsage',
  'app.components.services.getUri'
])

// Routing
.config(function(settings, $routeProvider) {
  $routeProvider.when(settings.pages.LicenseInfo, {
    controller: 'LicenseInfoPageCtrl',
    templateUrl: 'pages/config/licenseInfo/licenseInfo.html',
    label: 'License Info'
  });
})

// Controller
.controller('LicenseInfoPageCtrl', function($scope, LicenseFileModel, getUri) {
  
  $scope.fileUploadOptions = {
    url: getUri.url('License')
  };

  $scope.license = new LicenseFileModel('current');

  $scope.fetchLicense = function() {
    $scope.license.fetch().then(function() {
      $scope.license.agent.updateParams({ id: $scope.license.data.id });
      $scope.license.agent.fetch();
    });
  };

  $scope.fetchLicense();

});