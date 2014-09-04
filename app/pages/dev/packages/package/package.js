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

angular.module('app.pages.dev.packages.package', [
  'app.components.resources.PackageModel',
  'app.components.resources.PackageApplicationCollection'
])

// Routing
  .config(function($routeProvider, settings) {

    $routeProvider.when(settings.pages.Package, {
      controller: 'PackageCtrl',
      templateUrl: 'pages/dev/packages/package/package.html',
      label: 'Package'
    });

  })

// Controller
  .controller('PackageCtrl', function($scope, $routeParams, PackageApplicationCollection) {
    $scope.apps = new PackageApplicationCollection({
      package: $routeParams.package,
      packageVersion: $routeParams.packageVersion
    });
    $scope.apps.fetch();
  });