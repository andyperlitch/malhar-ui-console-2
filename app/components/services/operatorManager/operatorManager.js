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

angular.module('app.components.services.operatorManager', [
  'app.settings',
  'app.components.services.getUri',
  'app.components.resources.RecordingModel',
  'app.components.resources.RecordingCollection',
  'ui.bootstrap.modal',
  'app.components.directives.recordingBrowser',
  'app.components.directives.dtText',
  'app.components.filters.relativeTimestamp'
])
/**
 * @ngdoc service
 * @name app.components.services.operatorManager
 * @description  Service containing helper methods for dealing with operators, both logical and physical.
 * @requires app.components.services.services:getUri
 * @requires app.settings.recording
 * @requires app.components.resources.RecordingModel
 * @requires app.components.resources.RecordingCollection
 * @requires  ui.bootstrap.modal
**/
.factory('operatorManager', function(getUri, $log, $http, $q, $timeout, settings, RecordingModel, RecordingCollection, $modal) {

  return {

    /**
     * @ngdoc method
     * @name startRecording
     * @methodOf app.components.services.operatorManager
     * @description Starts a recording tuples from all ports of a physical operator. If a portName is provided as a third parameter,
     *   this starts a recording on only that port of the physical operator.
     * @param {String} appId The application id
     * @param {String} operatorId The physical operator id
     * @param {String} [portName] The name of the port
     * @returns {object} An object with two promises: returnObject.id is for the http request responds with an id (or error) and returnObject.available for when the recording actually becomes available.
    **/
    startRecording: function(appId, operatorId, portName) {
      var result;
      var self = this;
      var availableDfd = $q.defer();
      var idDfd = $q.defer();
      var urlKey = portName ? 'startPortRecording' : 'startOpRecording';
      var url = getUri.action(urlKey, {
        appId: appId,
        operatorId: operatorId,
        portName: portName
      });

      $log.info('Issuing recording request (POSTing to ' + url);
      var requestPromise = $http.post(url, { numWindows: 1 });
      requestPromise.then(
        function(res) {
          // Get ID, resolve id promise
          var recordingId = res.data.id;
          idDfd.resolve(recordingId);
          self.pollForRecording(recordingId, appId, operatorId, portName).then(
            function(recording) {
              availableDfd.resolve(recording);
            },
            function(err) {
              availableDfd.reject(err);
            }
          );
        },
        idDfd.reject
      );

      result = {
        id: idDfd.promise,
        available: availableDfd.promise
      };

      return result;
    },

    /**
     * @ngdoc method
     * @name app.components.services.operatorManager#openStartRecordingModal
     * @methodOf app.components.services.operatorManager
     * @description
     * openStartRecordingModal
     * @param {object} request The request object returned by {@link app.components.services.operatorManager#startRecording startRecording}.
     * @returns {object} Returns the $modalInstance from the $modal service.
    **/
    openStartRecordingModal: function(request) {
      return $modal.open({
        templateUrl: 'components/services/operatorManager/openStartRecordingModal.html',
        size: 'lg',
        controller: function($scope, request) {

          $scope.id = null;
          $scope.recording = null;
          $scope.error = null;

          request.id.then(function(id) {
            $scope.id = id;
          },function() {
            $scope.error = 'id';
          });

          request.available.then(function(recording) {
            $scope.recording = recording;
          }, function() {
            $scope.error = 'available';
          });

          $scope.deleteAndClose = function(recording) {
            recording.delete();
            $scope.$close();
          };

        },
        resolve: {
          request: function() {
            return request;
          }
        }
      });
    },

    /**
     * @ngdoc method
     * @name stopRecording
     * @methodOf app.components.services.operatorManager
     * @description Stops a recording on a port
     * @param  {string} appId      The application instance id
     * @param  {string} operatorId The physical operator id
     * @param  {string} [portName] The port name to record
     * @return {object}            An object with two promises: result.request is for the http request and result.stopped for when the recording actually stops.
     */
    stopRecording: function(appId, operatorId, portName) {
      var result = {};
      var urlKey = portName ? 'stopPortRecording' : 'stopOpRecording';
      var url = getUri.action(urlKey, {
        appId: appId,
        operatorId: operatorId,
        portName: portName
      });

      result.request = $http.post(url);

      return result;
    },

    /**
     * @ngdoc       method
     * @name        pollForRecording
     * @methodOf    app.components.services.operatorManager
     * @description Continuously polls for the existence of a recording on a specified application instance and physical operator (and optionally, port).
     * 
     * @param  {string} recordingId       The recording id
     * @param  {string} appId             The application instance id
     * @param  {string} recordingId       The id that the recording will have.
     * @return {object}            Promise that is resolved when the recording can be found and rejected if it cannot be found.
     */
    pollForRecording: function(recordingId, appId, operatorId, portName) {
      var dfd = $q.defer();
      var maxTimeout = settings.recording.POLLING_FOR_RECORDING_TIMEOUT;
      var interval = settings.recording.POLLING_FOR_RECORDING_INTERVAL;
      var startTime = Date.now();
      var recordings = new RecordingCollection({
        appId: appId,
        operatorId: operatorId
      });

      var pollFn = function() {

        var currentTime = Date.now();
        var totalTime = currentTime - startTime;
        if (totalTime > maxTimeout) {
          dfd.reject('Could not find the recording after ' + Math.round(totalTime / 1000) + ' seconds.');
          return;
        }

        // Send request to get recordings
        recordings.fetch().then(
          function(recordings) {
            // Check for expected recording
            var found = _.find(recordings, function(rec) {
              return rec.id === recordingId;
            });

            if (found) {

              // HACK until BaseCollections instantiate 
              // BaseModels for each item
              var recording = new RecordingModel({
                id: recordingId,
                appId: appId,
                operatorId: operatorId,
                portName: portName
              });
              recording.set(found);

              // Resolve the promise with the resulting recording
              dfd.resolve(recording);

            }
            else {
              $timeout(pollFn, interval);
            }
          },
          function(data, status) {
            if (status === 404) {
              $timeout(pollFn, interval);
            }
            else {
              dfd.reject('An error occurred retrieving recordings', data);
            }
          }
        );

      };

      $timeout(pollFn, interval);

      return dfd.promise;
    }

  };
});