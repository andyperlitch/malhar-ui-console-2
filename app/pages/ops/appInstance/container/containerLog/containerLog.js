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

angular.module('app.pages.ops.appInstance.container.containerLog', [
  'ngRoute',
  'app.settings',
  'app.components.resources.ContainerLogModel',
  'app.components.resources.ContainerLogCollection',
  'app.components.services.getUri'
])
  // Route
  .config(function($routeProvider, settings) {
    $routeProvider
      .when(settings.pages.ContainerLog, {
        controller: 'ContainerLogCtrl',
        templateUrl: 'pages/ops/appInstance/container/containerLog/containerLog.html',
        label: 'containerLog'
      });
  })
  // Controller
  .controller('ContainerLogCtrl', function($scope, $routeParams, $location, ContainerLogModel, ContainerLogCollection, getUri) {

    // Set up resources
    $scope.logs = new ContainerLogCollection({
      appId: $routeParams.appId,
      containerId: $routeParams.containerId
    });

    $scope.log = new ContainerLogModel({
      appId: $routeParams.appId,
      containerId: $routeParams.containerId,
      name: $routeParams.logName
    });

    $scope.logs.fetch().then(function(res) {
      var container = $scope.log.transformResponse({ logs: res });
      $scope.log.set(container);
    });


    // Set location based on select change
    $scope.onJumpToLog = function() {
      var params = _.extend({}, $routeParams, { logName: $scope.logToJumpTo.name });
      var newUrl = getUri.page('ContainerLog', params, true);
      $location.path(newUrl);
    };


  });