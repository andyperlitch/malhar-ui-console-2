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

angular.module('app.components.services.gatewayManager', [
  'app.components.services.getUri',
  'ui.websocket',
  'app.components.services.authentication'
])
/**
  * @ngdoc service
  * @name app.components.services.gatewayManager
  * @requires app.components.services.getUri
  * @requires ui.websocket
  * @requires app.components.services.authentication
**/
.factory('gatewayManager', function($q, $log, $http, $timeout, getUri, webSocket, authentication) {

  return {

    /**
     * @ngdoc            method
     * @name             restart
     * @methodOf         app.components.services.gatewayManager
     * @description      Restarts the gateway
     * 
     * @param  {number}  retryTimeout Timeout in millis to check if gateway has restarted.
     * @return {Promise} Resolves when the gateway has come back up. 
     *                   Rejected if the gateway does not come back up 
     *                   after retryTimeout milliseconds. Resolve callbacks
     *                   receive one boolean argument: loginRequired. This will
     *                   be true if login is required once restart has finished.
     */
    restart: function(retryTimeout) {

      // Set default retryTimeout
      retryTimeout = typeof retryTimeout !== 'number' ? 10000 : retryTimeout;

      // Set up deferred object
      var dfd = $q.defer();

      // Record time we started polling
      var startTime = Date.now();

      // Holds initial jvm name
      var jvmName;
      var promiseToGetJvm = this.getInfo();

      // Poll function
      var pollFn = _.bind(function() {

        $log.info('Polling for gateway info...');

        // Try to get info
        this.getInfo().then(

          // Success?
          function(response) {
            // Check for same jvmName
            if (response.data.jvmName === jvmName) {
              var now = Date.now();
              var elapsedTime = now - startTime;
              // Too long!
              if (elapsedTime > retryTimeout) {
                $log.warn('Gateway apparently did not restart (same jvmName) before the retryTimeout (' + Math.round(retryTimeout / 1000) + ' seconds).');
                dfd.reject('The gateway failed to restart. You may need to log in to the node it was running on and manually start it.');
              }
              // Try again...
              else {
                $log.info('Gateway info received during polling, but with same jvmName (' + jvmName + ').  Elapsed poll time: ', elapsedTime);
                $timeout(pollFn, 500);
              }
            }
            else {
              // Success!
              $log.info('Gateway info received. Assuming gateway has successfully restarted...');

              // Check if auth is enabled
              authentication.retrieveAuthStatus().then(function(isEnabled) {
                if (!isEnabled) {
                  // not enabled, go ahead and reconnect and resolve the deferred.
                  webSocket.connect();
                  // false here indicates that re-login is not required
                  dfd.resolve(false);
                }
                else {
                  // enabled, resolve without connecting to the webSocket
                  // true here indicates that login is required.
                  dfd.resolve(true);
                }
              });

            }
          },

          // Failed?
          function() {
            var now = Date.now();
            var elapsedTime = now - startTime;
            // Too long!
            if (elapsedTime > retryTimeout) {
              $log.warn('Gateway apparently did not restart () before the retryTimeout (' + Math.round(retryTimeout / 1000) + ' seconds).');
              dfd.reject('The gateway failed to restart. You may need to log in to the node it was running on and manually start it.');
            }
            // Try again...
            else {
              $log.info('Gateway info request failed, gateway probably still restarting. Elapsed poll time: ', elapsedTime);
              $timeout(pollFn, 500);
            }
          }

        );
      }, this);
  
      
      promiseToGetJvm
        .then(
          function(response) {
            jvmName = response.data.jvmName;
            $log.info('Old gateway jvmName: ', jvmName);

            // Disconnect the webSocket
            webSocket.disconnect();

            // Make the restart request
            $log.info('Sending restart request to gateway');
            $http.post(getUri.action('restartGateway'), {})
              .then(
                // Call successful, wait for a second, then start polling
                function() {
                  pollFn();
                },
                // Call unsuccessful, reject initial promise
                function(response) {
                  $log.error('Request to restart the gateway failed', response);
                  dfd.reject('Request to restart the gateway failed', response);
                }
              );
          },
          function(response) {
            dfd.reject('Gateway info could not be retrieved.', response);
          }
        );

      return dfd.promise;
    },

    /**
     * Gets info about the gateway
     * @return {Promise} Resolves with info. Rejects if request fails.
     */
    getInfo: function() {
      return $http.get(getUri.url('GatewayInfo'));
    }

  };

});