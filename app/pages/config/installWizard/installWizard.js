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
  'app.components.resources.ConfigIssueCollection',
  'app.components.resources.ConfigPropertyModel',
  'app.components.resources.HadoopLocation',
  'app.components.services.gatewayManager',
  'ui.bootstrap.modal'
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
.controller('InstallWizardHadoopCtrl', function($scope, $q, $log, ConfigPropertyModel, HadoopLocation, ConfigIssueCollection, gatewayManager, $modal) {
  
  // Set up models for the two properties to set
  $scope.hadoopLocation = new HadoopLocation();
  $scope.dfsLocation = new ConfigPropertyModel('dt.dfsRootDirectory');
  $scope.issues = new ConfigIssueCollection();

  // Loading
  $scope.loading = true;
  $q.all([$scope.dfsLocation.fetch(), $scope.hadoopLocation.fetch()])
    .then(
      // Successfully loaded property values
      function(){
        $scope.loading = false;

        // Set the initial values for testing
        $scope.initialValues = {
          hadoopLocation: $scope.hadoopLocation.data.value,
          dfsLocation: $scope.dfsLocation.data.value
        };
      },
      // Failed to load properties
      function() {
        $scope.loading = false;
        $scope.loadError = true;
      }
    );

  // Continue action
  $scope.next = function() {

    // Set a model to track what is happening
    var currentAction = {
      message: 'Starting to update hadoop configuration...'
    };

    // Set up modal instance
    var $modalInstance = $modal.open({
      templateUrl: 'pages/config/installWizard/updateHadoopConfigModal.html',
      backdrop: 'static',
      keyboard: false,
      controller: function($scope, currentAction) {
        $scope.currentAction = currentAction;
      },
      resolve: {
        currentAction: function() {
          return currentAction;
        }
      }
    });

    $scope.submittingChanges = true;
    $scope.dfsLocationError = false;

    // -------------------------------------------------
    // STEP 1: Save the hadoopLocation if it has changed
    // -------------------------------------------------
    function step1() {
    
      currentAction.message = 'Saving hadoop installation location...';
      var hadoopPromise;
      if ($scope.hadoopLocation.data.value !== $scope.initialValues.hadoopLocation) {
        hadoopPromise = $scope.hadoopLocation.save();
      }
      else {
        $log.debug('Hadoop Location was unchanged, no save required.');
        hadoopPromise = true;
      }
      return $q.when(hadoopPromise).then(
        // Go to step 2
        step2,

        // STEP 1 FAILED: hadoop location could not be saved
        function(response) {
          $log.warn('Failed to save new hadoop location. Response: ', response);
          $scope.hadoopLocationServerError = response.data;
        }
      );
    }

    // ---------------------------------
    // STEP 2: Restart Gateway if needed
    // ---------------------------------
    function step2() {
      currentAction.message = 'Checking if gateway needs to be restarted...';
      // Get the issues
      return $scope.issues.fetch().then(
        function(issues) {

          // check for RESTART_NEEDED issue
          var restartPromise;
          var restartNeeded = _.find(issues, function(i) {
            return i.key === 'RESTART_NEEDED';
          });

          // If it is, trigger a restart
          if (restartNeeded) {
            $log.info('Gateway restart needed');
            currentAction.message = 'Restarting the gateway...';
            restartPromise = gatewayManager.restart();
          }
          // If it is not, create resolved promise
          else {
            $log.debug('Gateway restart was not needed.');
            restartPromise = true;
          }

          return $q.when(restartPromise).then(
            step3,
            // STEP 2 FAILED: gateway failed to restart
            function(reason) {
              console.log('crap... gateway didnt restart: ', reason);
              $scope.hadoopLocationServerError = {
                message: 'The gateway could not be restarted.'
              };
            }
          );
        },
        // STEP 2 FAILED: Issues failed to load
        function() {
          console.log('Issues failed to load from the gateway!');
          $scope.hadoopLocationServerError = {
            message: 'Issues could not be loaded from the gateway.'
          };
        }
      );
    }

    // -----------------------------------
    // STEP 3: Save DFS location if needed
    // -----------------------------------
    function step3() {
      
      var dfsPromise;
      if ($scope.dfsLocation.data.value !== $scope.initialValues.dfsLocation) {
        currentAction.message = 'Saving DFS location...';
        dfsPromise = $scope.dfsLocation.save();  
      }
      else {
        dfsPromise = true;
      }

      return $q.when(dfsPromise).then(
        function() {
          // ----------
          // SUCCESS!!!
          // ----------
          $scope.goToStep('license');
        },
        function(response) {
          // If it fails, update the $error object of dfsLocation
          $scope.dfsLocationServerError = response.data;
        }
      );
    }


    // Kick things off
    step1().finally(function() {
      $scope.submittingChanges = false;
      $modalInstance.close();
    });
    
  };

})
.controller('InstallWizardLicenseCtrl', function() {
  console.log('hello from InstallWizardLicenseCtrl');
})
.controller('InstallWizardSummaryCtrl', function() {
  console.log('hello from InstallWizardSummaryCtrl');
});