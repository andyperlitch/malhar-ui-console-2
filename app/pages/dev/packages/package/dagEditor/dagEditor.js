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
  'app.pages.dev.packages.package.dagEditor.directives.dagOperatorClass',
  'app.pages.dev.packages.package.dagEditor.directives.dagOperator',
  'app.pages.dev.packages.package.dagEditor.directives.dagPort',
  'app.pages.dev.packages.package.dagEditor.directives.dagStream',

  // services
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
.controller('DagEditorCtrl', function($q, $scope, PackageOperatorClassCollection, $routeParams, $log, settings, freezeDagModel, thawDagModel, dagEditorOptions, PackageApplicationModel) {

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
  ]).then(function() {
    // set up the dag in the UI
    thawDagModel($scope.packageApplicationModelResource.data.fileContent, $scope, dagEditorOptions).then(function() {
      // now that it's thawed, watch the app for changes
      var first = true; // don't do this the first time.
      $scope.$watch('app', function() {
        // update the representation we send to the server
        if (!first) {
          $scope.freeze();
          $scope.saveRequested = true;
          debouncedSaveFrozen();
        } else {
          first = false;
        }
      }, true); // true set here to do deep equality check on $scope
    });
  });


  // ng-grid options for operator class list
  $scope.opClassListOptions = {
    data: 'operatorClasses',
    enableFiltering: true,
    groups: ['packageName'],
    rowTemplate: 'pages/dev/packages/package/dagEditor/uiGridTemplates/rowTemplate.html',
    columnDefs: [
      // Simple (Class) Name
      {
        groupable: false,
        name: 'simpleName',
        displayName: 'class',
        field: 'simpleName'
      },
      // Package Name
      // {
      //   groupable: true,
      //   name: 'package',
      //   displayName: 'package',
      //   field: 'packageName'
      // },
      // Input Ports
      {
        name: 'inputPorts',
        field: 'inputPorts',
        displayName: 'i',
        cellTemplate: 'pages/dev/packages/package/dagEditor/uiGridTemplates/inputPortsTemplate.html',
        width: 60,
        filter: false
      },
      // Output Ports
      {
        name: 'outputPorts',
        field: 'outputPorts',
        displayName: 'o',
        cellTemplate: 'pages/dev/packages/package/dagEditor/uiGridTemplates/outputPortsTemplate.html',
        width: 60,
        filter: false
      },
    ]
  };

  // Expose appName to scope
  $scope.appName = $routeParams.appName;

  // Models the application
  $scope.app = {
    operators: [],
    streams: []
  };

  // Canvas resizable options
  $scope.canvasResizeOptions = {
    handles: 's'
  };

  // Stream localities
  $scope.streamLocalities = settings.STREAM_LOCALITIES;

  // Initialize selection info
  $scope.deselectAll();

  $scope.freeze = function() {
    $scope.packageApplicationModelResource.data.fileContent = freezeDagModel($scope);
  };

  // PUT the frozen model to the gateway
  var saveFrozen = function() {
    if (!$scope.saveInProgress) {
      // not currently saving, so unset saveRequested and set saveInProgress
      $scope.saveRequested = false;
      $scope.saveInProgress = true;
      $scope.packageApplicationModelResource.save().then(function(e){
        $scope.saveLastTimestamp = new Date();
        // unset saveInProgress
        $scope.saveInProgress = false;
        if ($scope.saveRequested) {
          saveFrozen();
        }
      });
    }
  };

  // debounced save function
  var debouncedSaveFrozen = _.debounce(saveFrozen, 1000);
});
