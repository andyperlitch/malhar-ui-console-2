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

angular.module('app.pages.ops.appInstance.physicalOperator.port', [
  'ngRoute',
  'app.settings',
  'app.components.resources.PortModel',
  'app.components.resources.PortCollection'
])

  // Route
  .config(function($routeProvider, settings) {
    $routeProvider
      .when(settings.pages.Port, {
        controller: 'PortPageCtrl',
        templateUrl: 'pages/ops/appInstance/physicalOperator/port/port.html',
        label: 'port',
        collection: {
          label: 'ports',
          resource: 'PortCollection',
          resourceParams: ['appId','operatorId'],
          templateUrl: 'pages/ops/appInstance/physicalOperator/port/breadcrumbTemplate.html'
        }
      });
  })

  // Controller
  .controller('PortPageCtrl', function($scope, $routeParams, PortModel) {

    console.log('routeParams', $routeParams);
    $scope.port = new PortModel($routeParams);
    $scope.port.fetch();
    $scope.port.subscribe($scope);

  });