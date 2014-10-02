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

angular.module('app.pages.ops.appInstance.appData.widgets.discovery', [])
  .controller('KafkaDiscoveryWidgetCtrl', function ($scope, $routeParams, ApplicationModel, KafkaDiscovery) {
    var appId = $routeParams.appId;
    $scope.appInstance = new ApplicationModel({
      id: appId
    });
    $scope.appInstance.fetch().then(function (app) {
      console.log($scope.appInstance);
      console.log(app.name);
    });

    $scope.kafkaDiscovery = new KafkaDiscovery(appId);
    $scope.kafkaDiscovery.fetch();
  });