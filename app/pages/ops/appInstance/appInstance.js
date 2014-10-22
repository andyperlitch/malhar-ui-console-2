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
 * Application Instance page module
 */

angular.module('app.pages.ops.appInstance', [
  'ngRoute',
  'app.settings',
  'app.components.directives.dtPageHref',
  'app.components.services.appManager',
  'app.components.services.dashboardOptionsFactory',
  'app.components.resources.ApplicationModel',
  'app.components.widgets.PhysicalOperatorsList',
  'app.pages.ops.appInstance.widgets.AppInstanceOverview',
  'app.pages.ops.appInstance.widgets.LogicalOperatorsList',
  
  'app.pages.ops.appInstance.widgets.ContainersList',
  'app.pages.ops.appInstance.widgets.StramEvents',
  'app.pages.ops.appInstance.widgets.dag.LogicalDag',
  'app.pages.ops.appInstance.widgets.dag.PhysicalDag',
  'app.pages.ops.appInstance.widgets.metrics',
  'app.pages.ops.appInstance.widgets.LogicalStreamsList',
  'ui.widgets',
  'ui.models'
])

// Route
  .config(function ($routeProvider, settings) {
    $routeProvider
      .when(settings.pages.AppInstance, {
        controller: 'AppInstanceCtrl',
        templateUrl: 'pages/ops/appInstance/appInstance.html',
        label: 'appInstance',
        collection: {
          label: 'apps',
          resource: 'ApplicationCollection',
          resourceParams: [],
          templateUrl: 'pages/ops/appInstance/breadcrumbTemplate.html',
          orderBy: 'name'
        }
      });
  })

// Controller
  .controller('AppInstanceCtrl', function (
    $scope,
    $routeParams,
    settings,
    ApplicationModel,
    LogicalDagWidgetDefinition,
    PhysicalDagWidgetDefinition,
    AppInstanceOverviewWidgetDef,
    StramEventsWidgetDef,
    LogicalOperatorsListWidgetDef,
    PhysicalOperatorsListWidgetDef,
    ContainersListWidgetDef,
    MetricsWidgetDef,
    LogicalStreamsListWidgetDef,
    breadcrumbs,
    dashboardOptionsFactory
  ) {

    // Set appId on scope for easy access.
    $scope.appId = $routeParams.appId;

    // Create new app instance resource on the scope.
    $scope.appInstance = new ApplicationModel({ id: $routeParams.appId });

    // Hold dashboard options for different dashboardTypes in this object.
    $scope.dashboardOptions = {};
    
    // Fetch the app.
    $scope.appInstance.fetch().then(function() {

      // Set up watch on state change
      $scope.$watch('appInstance.data.state', function(newValue) {
        $scope.onStateChange(newValue);
      });

      // Subscribe to updates.
      $scope.appInstance.subscribe($scope);
      
    });

    // Unsubscribe when the scope is destroyed.
    $scope.$on('$destroy', function () {
      $scope.appInstance.unsubscribe();
    });

    /**
     * Initializes the correct dashboard based on
     * the application's state.
     *  
     * @param  {String} state The state of the application, e.g. 'ACCEPTED', 'RUNNING', etc.
     * @return {null}
     */
    $scope.onStateChange = function(state) {
      if (state === 'RUNNING') {
        $scope.dashboardType = 'running';
      }

      else if (settings.STARTING_APP_STATES.indexOf(state) >= 0) {
        $scope.dashboardType = 'starting';
      }

      else {
        $scope.dashboardType = 'ended';
      }

      $scope.initDashboardOptions($scope.dashboardType);
    };

    /**
     * Initializes the dashboardOptions object for the given
     * dashboardType (running|starting|ended). If it has already 
     * been initialized, this does nothing.
     * 
     * @param  {String} dashboardType  The dashboardType to initialize
     */
    $scope.initDashboardOptions = function(dashboardType) {

      // If already exists, do nothing.
      if ($scope.dashboardOptions[dashboardType]) {
        return;
      }

      // These variable are used in the
      // call to dashboardOptionsFactory below the switch
      var widgetDefinitions;
      var defaultWidgets;
      var defaultLayouts;
      var storageId = 'dashboard.ops.appInstance:' + dashboardType;
      var storageHash = 's9dfa98sd7f';

      // Sets up the widgetDefinitions, defaultWidgets, and defaultLayouts
      // to be used when defining this dashboard options object.
      switch(dashboardType) {
        case 'running': 
          widgetDefinitions = [
            new AppInstanceOverviewWidgetDef({ name: 'Application Overview' }),
            new StramEventsWidgetDef({
              name: 'Stram Events',
              style: { float: 'right' },
              size: { width: '34%' }
            }),
            new LogicalDagWidgetDefinition({
              name: 'Logical DAG',
              dataModelArgs: { appId: $scope.appId },
              size: {
                width: '66%'
              }
            }),
            new PhysicalDagWidgetDefinition({
              name: 'Physical DAG',
              dataModelArgs: { appId: $scope.appId },
              size: {
                width: '100%'
              }
            }),
            new LogicalOperatorsListWidgetDef({ name: 'Logical Operators List' }),
            new PhysicalOperatorsListWidgetDef({ name: 'Physical Operators List' }),
            new ContainersListWidgetDef({
              name: 'Containers List'
            }),
            new LogicalStreamsListWidgetDef({ name: 'Logical Streams' }),
            new MetricsWidgetDef({
              name: 'Metrics Chart',
              size: {
                width: '60%'
              }
            })
          ];

          var logicalLayoutWidgets = _.map([
            { name: 'Application Overview', size: { width: '66%' } },
            'Stram Events',
            'Logical DAG',
            'Logical Operators List',
            'Logical Streams',
            'Metrics Chart'
          ], function (name) {
            if (typeof name === 'object') {
              return name;
            }
            return { name: name };
          });

          var physicalLayoutWidgets = _.map(['Application Overview', 'Physical Operators List', 'Containers List', 'Metrics Chart'], function (name) {
            return { name: name };
          });

          var physicalDagViewLayoutWidgets = [
            {
              name: 'Application Overview',
              size: {
                width: '100%' //TODO if this widget is added again it will have width from widgetDefinitions
              }
            },
            { name: 'Physical DAG' }
          ];

          var metricViewLayoutWidgets = [
            {
              name: 'Application Overview',
              size: {
                width: '100%' //TODO if this widget is added again it will have width from widgetDefinitions
              }
            },
            { name: 'Metrics Chart' }
          ];


          defaultWidgets = logicalLayoutWidgets;

          defaultLayouts = [
            { title: 'logical', active: true, defaultWidgets: logicalLayoutWidgets },
            { title: 'physical', active: false, defaultWidgets: physicalLayoutWidgets },
            { title: 'physical-dag-view', active: false, defaultWidgets: physicalDagViewLayoutWidgets },
            { title: 'metric-view', active: false, defaultWidgets: metricViewLayoutWidgets }
          ];
        break;

        case 'starting':
          widgetDefinitions = [
            new AppInstanceOverviewWidgetDef({ name: 'Application Overview', size: { width: '66%' } }),
            new StramEventsWidgetDef({
              name: 'Stram Events',
              style: { float: 'right' },
              size: { width: '34%' }
            })
          ];

          defaultWidgets = _.map(['Application Overview', 'Stram Events', 'Logical DAG'], function (name) {
            return { name: name };
          });

          defaultLayouts = [
            { title: 'starting app', active: true }
          ];
        break;

        case 'ended':

          widgetDefinitions = [
            new AppInstanceOverviewWidgetDef({ name: 'Application Overview', size: { width: '66%' } }),
            new StramEventsWidgetDef({
              name: 'Stram Events',
              style: { float: 'right' },
              size: { width: '34%' }
            }),
            new ContainersListWidgetDef({
              name: 'Containers List',
              size: {
                width: '66%'
              },
              dataModelOptions: {
                loadKilled: true
              }
            })
          ];

          defaultWidgets = _.map(['Application Overview', 'Stram Events', 'Containers List'], function (name) {
            return { name: name };
          });

          defaultLayouts = [
            { title: 'ended app', active: true }
          ];

        break;

        default:
          // do nothing
        break;
      }

      // Use the dashboardOptionsFactory to create the options object
      $scope.dashboardOptions[dashboardType] = dashboardOptionsFactory({
        storageId: storageId,
        storageHash: storageHash,
        widgetDefinitions: widgetDefinitions,
        defaultWidgets: defaultWidgets,
        defaultLayouts: defaultLayouts
      });

    };

  });