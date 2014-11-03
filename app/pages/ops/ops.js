/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
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

/**
 * Operations page module
 */

angular.module('app.pages.ops', [
  'app.settings',
  'app.components.resources.ClusterMetrics',
  'app.components.filters.byte',
  'app.components.filters.timeSince',
  'app.components.services.dtText',
  'app.components.services.tableOptionsFactory',
  'app.components.services.appManager',
  'app.components.directives.appIdLink',
  'app.components.directives.dtStatus',
  'app.components.directives.dtPageHref',
  'app.components.directives.dtTableResize',
  'app.components.directives.toggleText',
  'datatorrent.mlhrTable',
  'app.components.resources.ApplicationCollection',
  'app.pages.ops.components.appList'
])

// Route
  .config(function (settings, $routeProvider) {
    $routeProvider
      .when(settings.pages.Operations, {
        controller: 'OpsCtrl',
        templateUrl: 'pages/ops/ops.html',
        label: 'Operations'
      });
  })

// Controller
  .controller('OpsCtrl', function ($scope, ClusterMetrics, tableOptionsFactory, ApplicationCollection, appListColumns, appManager) {

    // Set up cluster metrics resource
    $scope.clusterMetrics = new ClusterMetrics();
    $scope.clusterMetrics.subscribe($scope);
    $scope.clusterMetrics.fetch();

    // Set up the apps list table options
    $scope.columns = appListColumns;
    $scope.selected = [];
    $scope.appListOptions = tableOptionsFactory({
      storage_key: 'pages.ops.appList.table',
      initial_sorts: [
        { id: 'state', dir: '+' },
        { id: 'id', dir: '-' }
      ]
    });

    // Set up applications resource
    $scope.apps = new ApplicationCollection();
    $scope.apps.subscribe($scope);
    $scope.apps.fetch().then(function() {
      $scope.appListOptions.setLoading(false);
    });

    // Kills or destroys selected apps
    $scope.endApps = function(signal, selected) {
          
        if (selected.length === 0) {
          return;
        }

        var apps = _.map(selected, function(id) {
          return { id: id };
        });

        var promise;

        if (apps.length === 1) {
          promise = appManager.endApp(signal, apps[0]);
        }

        else {
          promise = appManager.endApps(signal, apps);
        }

        // Deselect all apps
        promise.then(function() {
          $scope.selected.splice(0, $scope.selected.length);
        });

      };

    // Clean up
    $scope.$on('$destroy', function() {
      $scope.clusterMetrics.unsubscribe();
    });

  });