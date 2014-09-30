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

angular.module('app.pages.config.installWizard', [
  'app.components.resources.ConfigPropertyModel',
  'app.components.resources.HadoopLocation'
])
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
      next: 'hadoop'
    },
    hadoop: {
      label: 'Hadoop',
      templateUrl: 'pages/config/installWizard/hadoop.html',
      next: 'license',
      prev: 'welcome'
    },
    license: {
      label: 'License',
      templateUrl: 'pages/config/installWizard/license.html',
      next: 'summary',
      prev: 'hadoop'
    },
    summary: {
      label: 'Summary',
      templateUrl: 'pages/config/installWizard/summary.html',
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


})

.controller('InstallWizardWelcomeCtrl', function($scope) {
  
  $scope.next = function() {
    $scope.goToStep('hadoop');
  };


})
.controller('InstallWizardHadoopCtrl', function($scope, $q, ConfigPropertyModel, HadoopLocation) {
  
  // Set up models for the two properties to set
  $scope.dfsLocation = new ConfigPropertyModel('dt.dfsRootDirectory');
  $scope.hadoopLocation = new HadoopLocation();

  // Loading
  $scope.loading = true;
  $q.all([$scope.dfsLocation.fetch(), $scope.hadoopLocation.fetch()])
    .then(
      // Successfully loaded property values
      function(){
        $scope.loading = false;
      },
      // Failed to load properties
      function() {
        $scope.loading = false;
        $scope.loadError = true;
      }
    );



})
.controller('InstallWizardLicenseCtrl', function() {
  console.log('hello from InstallWizardLicenseCtrl');
})
.controller('InstallWizardSummaryCtrl', function() {
  console.log('hello from InstallWizardSummaryCtrl');
});