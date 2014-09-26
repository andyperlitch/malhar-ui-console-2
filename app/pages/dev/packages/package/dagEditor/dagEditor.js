/*
* Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
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

angular.module('app.pages.dev.packages.package.dagEditor', [
  'ui.grid',

  // components
  'app.components.resources.PackageOperatorClassCollection',
  'app.components.resources.PackageApplicationModel',

  // directives
  'app.components.directives.uiResizable',
  'app.components.directives.jsplumbContainer',
  'app.components.directives.validation.uniqueInSet',
  'app.pages.dev.packages.package.dagEditor.directives.dagCanvas',
  'app.pages.dev.packages.package.dagEditor.directives.dagOperatorClasses',
  'app.pages.dev.packages.package.dagEditor.directives.dagOperatorClass',
  'app.pages.dev.packages.package.dagEditor.directives.dagOperator',
  'app.pages.dev.packages.package.dagEditor.directives.dagPort',
  'app.pages.dev.packages.package.dagEditor.directives.dagStream',

  // services
  'app.components.services.confirm',
  'app.components.services.dtText',
  'app.components.services.getUri',
  'app.components.services.jsPlumb',
  'app.pages.dev.packages.package.dagEditor.services.freezeDagModel',
  'app.pages.dev.packages.package.dagEditor.services.thawDagModel',
  'app.pages.dev.packages.package.dagEditor.services.dagEditorOptions',

  // controllers
  'app.pages.dev.packages.package.dagEditor.controllers.DagAppInspectorCtrl',
  'app.pages.dev.packages.package.dagEditor.controllers.DagOperatorInspectorCtrl',
  'app.pages.dev.packages.package.dagEditor.controllers.DagStreamInspectorCtrl',
  'app.pages.dev.packages.package.dagEditor.controllers.DagPortInspectorCtrl'

])

// Routing
.config(function($routeProvider, settings) {

  $routeProvider.when(settings.pages.DagEditor, {
    controller: 'DagEditorCtrl',
    templateUrl: 'pages/dev/packages/package/dagEditor/dagEditor.html',
    label: 'edit'
  });
})

// Page Controller
.controller('DagEditorCtrl', function($q, $scope, PackageOperatorClassCollection, $routeParams, $log, settings, freezeDagModel, thawDagModel, dagEditorOptions, PackageApplicationModel, dtText, confirm, $location, notificationService, getUri) {

  // handle launch requests from child scopes
  $scope.$on('launchRequest', function () { $scope.launch(); });

  // launch the app
  $scope.launch = function () {
    if (!$scope.saveLaunchState.launchPossible) {
      // launch is impossible, show why
      return notificationService.notify({
        title: 'Application Cannot Be Launched',
        text: $scope.saveLaunchState.launchImpossibleReason,
        type: 'error',
        icon: false,
        hide: false,
        history: false
      });
    }

    // launch is possible
    var launchNotif = notificationService.notify({
      title: 'Launch Requested',
      text: 'A launch request has been submitted. Waiting for status...',
      type: 'info',
      icon: false,
      hide: false,
      history: false
    });

    $scope.packageApplicationModelResource.launch().success(function (response) {
      var dashboardUrl = getUri.page('AppInstance', { appId: response.appId });
      notificationService.notify({
        title: 'Launched Successfully',
        text: $scope.app.displayName + ' was launched successfully. <a href="' + dashboardUrl + '">View it on the Dashboard</a>.',
        type: 'success',
        icon: false,
        hide: false,
        history: false
      });
      launchNotif.remove(0);
    });
  };

  // Deselects everything
  $scope.deselectAll = function() {
    $scope.selected = null;
    $scope.selected_type = null;
  };

  // Selects an entity in the DAG
  $scope.selectEntity = function($event, type, entity) {
    if (typeof $event.preventDefault === 'function') {
      $event.preventDefault();
    }
    $scope.selected = entity;
    $scope.selected_type = type;
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  };

  // Listen for entity selections
  $scope.$on('selectEntity', $scope.selectEntity);

  // Operator Classes:
  $scope.operatorClassesResource = new PackageOperatorClassCollection($routeParams);
  $scope.operatorClasses = $scope.operatorClassesResource.data;

  // DAG Model
  $scope.packageApplicationModelResource = new PackageApplicationModel($routeParams);

  // Load operators and DAG. Once both are done, thaw the DAG
  $q.all([
    $scope.operatorClassesResource.fetch(),
    $scope.packageApplicationModelResource.fetch()
  ]).then(
    // loading success
    function() {
      // set up the dag in the UI
      thawDagModel($scope.packageApplicationModelResource.data.fileContent, $scope, dagEditorOptions).then(function() {
        // handle the launch button on DAG load
        if ($scope.app.operators && $scope.app.operators.length < 1) {
          // empty app
          $scope.saveLaunchState.launchPossible = false;
          $scope.saveLaunchState.launchImpossibleReason = 'The app needs at least one output operator.';
        } else {
          $scope.saveLaunchState.launchPossible = ($scope.packageApplicationModelResource.data && !$scope.packageApplicationModelResource.data.error);
          $scope.saveLaunchState.launchImpossibleReason = ($scope.packageApplicationModelResource.data && $scope.packageApplicationModelResource.data.error) ? $scope.packageApplicationModelResource.data.error : 'The application cannot be started for an unknown reason.';
        }
        // now that it's thawed, watch the app for changes
        var first = true; // don't do this the first time.
        $scope.$watch('app', function() {
          // update the representation we send to the server
          if (!first) {
            $scope.saveLaunchState.saveRequested = true;
            $scope.saveLaunchState.launchPossible = false;
            $scope.saveLaunchState.launchImpossibleReason = 'A save is in progress. Please wait until it is finished.';
            $scope.freeze();
            debouncedSaveFrozen();
          } else {
            first = false;
            $scope.$broadcast('firstLoadComplete');
          }
        }, true); // true set here to do deep equality check on $scope

        // watch the saveLaunchState to notify child scopes
        $scope.$watch('saveLaunchState', function() {
          $scope.$broadcast('saveLaunchStateChange', $scope.saveLaunchState);
        });
      });
    },
    // failure to load operators or application
    function(reason) {
      var notifTitle = null;
      var notifBody = null;

      if (reason.config.url === $scope.operatorClassesResource.url) {
        // could not load operators
        notifTitle = 'Operators Not Loaded';
        notifBody = 'Could not load the operator library for this application package.';
      } else if (reason.config.url === $scope.packageApplicationModelResource.url) {
        // could not load application
        notifTitle = 'Application Not Loaded';
        notifBody = 'The application ' + $routeParams.appName + ' could not be loaded.';
      } else {
        // unknown error
        notifTitle = 'Unknown Error';
        notifBody = 'An unknown error has occured.';
      }

      // log the error
      $log.error(notifTitle, reason);

      // set up a notif
      notificationService.notify({
        title: notifTitle,
        text: notifBody,
        type: 'error',
        icon: false,
        hide: true,
        history: false
      });
      // Navigate to Package page
      var url = getUri.page('Package', $routeParams, true);
      $location.path(url);
    }
  );

  // Expose appName to scope
  $scope.appName = $routeParams.appName;

  // Models the application
  $scope.app = {
    displayName: undefined,
    description: undefined,
    operators: [],
    streams: []
  };

  $scope.saveLaunchState = {
    saveRequested: false,
    launchPossible: false,
    launchImpossibleReason: 'The app is loading.',
    saveLastTimestamp: null
  };

  // Canvas resizable options
  $scope.canvasResizeOptions = {
    handles: 's'
  };

  // Stream localities
  $scope.streamLocalities = settings.STREAM_LOCALITIES;

  // Initialize selection info
  $scope.deselectAll();

  // Make it possible to call freezeDagModel() from elsewhere
  $scope.freeze = function() {
    $scope.packageApplicationModelResource.data.fileContent = freezeDagModel($scope);
  };

  // PUT the frozen model to the gateway
  var saveFrozen = function() {
    if (!$scope.saveLaunchState.saveInProgress) {
      // not currently saving, so unset saveRequested and set saveInProgress
      $scope.saveLaunchState.saveRequested = false;
      $scope.saveLaunchState.saveInProgress = true;
      $scope.saveLaunchState.launchPossible = false;
      $scope.saveLaunchState.launchImpossibleReason = 'The app is currently being saved.';
      $scope.packageApplicationModelResource.save().then(function(e) {
        // unset saveInProgress now that we are done
        $scope.saveLaunchState.saveInProgress = false;

        // set scope vars to indicate saving state and launch possibility
        if ($scope.app.operators && $scope.app.operators.length < 1) {
          // empty app
          $scope.saveLaunchState.saveRequested = false;
          $scope.saveLaunchState.launchPossible = false;
          $scope.saveLaunchState.launchImpossibleReason = 'The app needs at least one output operator.';
        } else {
          $scope.saveLaunchState.launchPossible = (e.status === 200 && e.data && !e.data.error);
          $scope.saveLaunchState.launchImpossibleReason = e.data && e.data.error ? e.data.error : 'The application cannot be started for an unknown reason.';
          $scope.saveLaunchState.saveLastTimestamp = new Date();
        }

        if ($scope.saveLaunchState.saveRequested) {
          // a save was requested since this request was started, so save now
          saveFrozen();
        }
      });
    }
  };

  var confirmNavigation = function(event, next) {
    if ($scope.saveLaunchState.saveRequested || $scope.saveLaunchState.saveInProgress) {
      // block the navigation change to show the confirm box
      event.preventDefault();

      // Open a modal confirming the command
      return confirm({
        title: dtText.get('Save in Progress...'),
        body: dtText.get('The streaming application is currently being saved to the server. Are you sure you want to cancel that?')
      }).then(function() {
        // User really wants to navigate away
        $scope.saveLaunchState.saveRequested = $scope.saveLaunchState.saveInProgress = false;
        $location.url($location.url(next).hash());
      });
    }
  };

  $scope.$on('$locationChangeStart', confirmNavigation);
  window.onbeforeunload = function (event) {
    if ($scope.saveLaunchState.saveRequested || $scope.saveLaunchState.saveInProgress) {
      var message = 'The streaming application is currently being saved to the server.';
      if (typeof event === 'undefined') {
        event = window.event;
      }
      if (event) {
        event.returnValue = message;
      }
      return message;
    }
  };

  // debounced save function
  var debouncedSaveFrozen = _.debounce(saveFrozen, 1000);
});
