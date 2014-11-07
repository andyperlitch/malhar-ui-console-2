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

angular.module('app.components.services.authentication', [
  'app.settings',
  'app.components.services.userSession',
  'app.components.services.getUri'
])

  /**
   * @ngdoc service
   * @name  app.components.services.authentication
   * @description  Service for managing authentication and authorization.
   * @requires  app.components.services.userSession
   * @requires  app.components.services.getUri
   * @requires  app.settings
   */
  .factory('authentication', function(settings, userSession, $http, getUri, $q) {
    
    var authentication = {};

    /**
     * @ngdoc method
     * @name isEnabled
     * @description  Gives the status of authentication on the DataTorrent cluster.
     * @methodOf app.components.services.authentication
     * @returns {boolean}    Returns true if authentication is enabled or unknown status and false if it is disabled.
    **/
    authentication.isEnabled = function() {
      if (userSession.authStatus === false) {
        return false;
      }
      return true;
    };

    /**
     * @ngdoc method
     * @name  retrieveAuthStatus
     * @description  GETs information from the Gateway about authentication status. Sets userSession.authStatus to true or false.
     * @methodOf app.components.services.authentication
     * @return {Promise}   Resolves when this action has completed
     */
    authentication.retrieveAuthStatus = function() {
      var url = getUri.url('User');
      var dfd = $q.defer();

      $http.get(url).then(
        function(res) {
          var data = res.data;
          // check if auth-scheme is empty
          if (data['auth-scheme']) {
            userSession.authStatus = true;
            // user should be logged in
          }
          else {
            userSession.authStatus = false;
          }

          dfd.resolve();
        },
        function(res) {
          if (res.status === 401 || res.status === 403) {
            userSession.authStatus = true;
            dfd.resolve();
          }
          else {
            dfd.reject(res);
          }
        }
      );

      return dfd.promise;
    };


    return authentication;

  });