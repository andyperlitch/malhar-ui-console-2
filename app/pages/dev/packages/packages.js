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

angular.module('app.pages.dev.packages', [
])

// Routing
  .config(function($routeProvider, settings) {

    $routeProvider.when(settings.pages.Packages, {
      controller: 'PackagesCtrl',
      templateUrl: 'pages/dev/packages/packages.html',
      label: 'edit DAG'
    });

  })

// Controller
  .controller('PackagesCtrl', function($scope) {
    $scope.list = ['package 1', 'package 2', 'package 3'];
  });