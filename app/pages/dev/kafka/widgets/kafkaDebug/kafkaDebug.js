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

angular.module('app.pages.dev.kafka.widgets.kafkaDebug', [
  'app.pages.dev.kafka.KafkaSocketService',
  'app.components.directives.dtQueryEditor'
])
  .controller('KafkaDebugCtrl', function ($scope, KafkaRestService, KafkaSocketService, KafkaDiscovery) {
    $scope.kafkaService = new KafkaSocketService();

    var defaultMessage;

    if ($scope.widget.dataModelOptions && $scope.widget.dataModelOptions.query) {
      defaultMessage = $scope.widget.dataModelOptions.query;
    } else {
      defaultMessage = {
        keys: {
          publisherId: 1,
          advertiserId: 0,
          adUnit: 0
        }
      };
    }

    $scope.kafkaQuery = defaultMessage;
    var kafkaDiscovery = new KafkaDiscovery($scope.appId);
    kafkaDiscovery.fetch().then(function () {
      $scope.dimensions = kafkaDiscovery.getDimensionList();
      console.log($scope.dimensions);
    });

    $scope.requestText = JSON.stringify(defaultMessage, null, ' ');

    $scope.sendRequest = function () {
      /*
      var msg = null;

      try {
        msg = JSON.parse($scope.requestText);
      } catch (e) {
        console.log(e);
        $scope.request = 'JSON parse error';
      }
      */
      var msg = $scope.kafkaQuery;

      if (msg) {
        $scope.kafkaService.subscribe(msg, function (data, kafkaMessage) {
          $scope.kafkaMessage = _.clone(kafkaMessage);

          if (kafkaMessage && kafkaMessage.value) {
            var kafkaMessageValue = JSON.parse(kafkaMessage.value);
            $scope.kafkaMessageValue = kafkaMessageValue;
            $scope.kafkaMessage.value = '<see data below>';
          } else {
            $scope.kafkaMessageValue = null; //TODO
          }
        }, $scope);


        $scope.request = $scope.kafkaService.getQuery();
        if ($scope.widget.dataModelOptions) {
          $scope.widget.dataModelOptions.query = msg;
          $scope.$emit('widgetChanged', $scope.widget); // persist new query
        }
      }
    };

    $scope.sendRequest();
  });