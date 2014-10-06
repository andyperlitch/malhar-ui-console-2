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

angular.module('app.pages.dev.packages.package.application', [
  'app.components.resources.PackageApplicationModel',
  'app.components.widgets.dag.base'
])

// Routing
  .config(function($routeProvider, settings) {

    $routeProvider.when(settings.pages.PackageApplication, {
      controller: 'PackageApplicationCtrl',
      templateUrl: 'pages/dev/packages/package/application/application.html',
      label: 'appName'
    });

  })

// Controller
  .controller('PackageApplicationCtrl', function($scope, $routeParams, PackageApplicationModel) {
    var app = new PackageApplicationModel({
      packageName: $routeParams.packageName,
      packageVersion: $routeParams.packageVersion,
      appName: $routeParams.appName
    });
    $scope.appName = $routeParams.appName;

    $scope.$on('registerController', function (event, ctrl) {
      console.log('_r');
      event.stopPropagation();

      app.fetch().then(function (data) {
        ctrl.renderDag(data.dag);
      });
    }.bind(this));
  });