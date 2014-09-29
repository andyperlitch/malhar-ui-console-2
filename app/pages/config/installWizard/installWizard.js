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

angular.module('app.pages.config.installWizard', {

})
// Routing
.config(function(settings, $routeProvider) {

  $routeProvider.when(settings.pages.InstallWizard, {
    controller: 'InstallWizardCtrl',
    templateUrl: 'pages/config/installWizard/installWizard.html',
    label: 'Installation Wizard'
  });

})

.factory('installWizardSteps', function() {
  // linked list
  return {
    welcome: {
      label: 'Welcome',
      templateUrl: 'pages/config/installWizard/welcome.html',
      controller: 'InstallWizardWelcomeCtrl',
      next: 'hadoop'
    },
    hadoop: {
      label: 'Hadoop',
      templateUrl: 'pages/config/installWizard/hadoop.html',
      controller: 'InstallWizardHadoopCtrl',
      next: 'license',
      prev: 'welcome'
    },
    license: {
      label: 'License',
      templateUrl: 'pages/config/installWizard/license.html',
      controller: 'InstallWizardLicenseCtrl',
      next: 'summary',
      prev: 'hadoop'
    },
    summary: {
      label: 'Summary',
      templateUrl: 'pages/config/installWizard/summary.html',
      controller: 'InstallWizardSummaryCtrl',
      prev: 'license'
    }
  };
})

// Controller
.controller('InstallWizardCtrl', function($scope, installWizardSteps) {

  // Holds the current step
  $scope.currentStep = installWizardSteps.welcome;

  // Changes to step
  $scope.goToStep = function(step) {
    $scope.currentStep = installWizardSteps[step];    
  };


});