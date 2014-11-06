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
  'app.components.resources.RecordingCollection'
])
/**
 * @ngdoc service
 * @name app.components.services.services:operatorManager
 * @description  Service containing helper methods for dealing with operators, both logical and physical.
 * @requires app.components.services.services:getUri
 * @requires app.settings.recording
 * @requires app.components.resources.RecordingModel
 * @requires app.components.resources.RecordingCollection
**/
.factory('operatorManager', function(getUri, $http, $q, settings, RecordingModel, RecordingCollection) {

  return {

    /**
     * @ngdoc method
     * @name startRecording
     * @methodOf app.components.services.services:operatorManager
     * @description Starts a recording tuples from all ports of a physical operator. If a portName is provided as a third parameter,
     *   this starts a recording on only that port of the physical operator.
     * @param {String} appId The application id
     * @param {String} operatorId The physical operator id
     * @param {String} [portName] The name of the port
     * @returns {object} An object with two promises: result.request is for the http request and result.available for when the recording actually becomes available.
    **/
    startRecording: function(appId, operatorId, portName) {
      var result = {};
      var urlKey = portName ? 'startPortRecording' : 'startOpRecording';
      var url = getUri.action(urlKey, {
        appId: appId,
        operatorId: operatorId,
        portName: portName
      });

      result.request = $http.post(url);
      result.available = this.pollForRecording(appId, operatorId, portName);
      return result;
    },

    /**
     * @ngdoc method
     * @name stopRecording
     * @methodOf app.components.services.services:operatorManager
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
     * @ngdoc method
     * @name  pollForRecording
     * @methodOf app.components.services.services:operatorManager
     * @description Continuously polls for the existence of a recording on a specified application instance and physical operator (and optionally, port).
     * @param  {string} appId      The application instance id
     * @param  {string} operatorId The physical operator id
     * @param  {string} [portName] If supplied, will look for a recording on this port.
     * @return {object}            Promise that is resolved when the recording can be found and rejected if it cannot be found.
     */
    pollForRecording: function(appId, operatorId, portName) {
      var dfd = $q.defer();
      var maxTimeout = settings.recording.POLLING_FOR_RECORDING_TIMEOUT;
      var interval = settings.recording.POLLING_FOR_RECORDING_INTERVAL;
      var totalTime = 0;
      console.log('pollForRecording: appId, operatorId, portName', appId, operatorId, portName);
      console.log('maxTimeout, interval, totalTime', maxTimeout, interval, totalTime);
      var recordings = new RecordingCollection({
        appId: appId,
        operatorId: operatorId
      });

      var pollFn = function() {

        // Send request to get recordings
        recordings.fetch().then(
          function(recordings) {
            // Check for expected recording
            console.log('recordings fetched', recordings);
            var found = _.find(recordings, function(rec) {
              return !rec.ended;
            });
            if (found) {
              var recording = new RecordingModel({
                appId: appId,
                operatorId: operatorId
              });
              recording.set(found);
              dfd.resolve(recording);
            }
          },
          function() {

          }
        );

      };

      pollFn();

      return dfd.promise;
    }

  };
});