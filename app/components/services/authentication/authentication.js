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
  'app.components.services.currentUser',
  'app.components.services.getUri'
])

  /**
   * @ngdoc service
   * @name  app.components.services.authentication
   * @description  Service for managing authentication and authorization.
   * @requires  app.components.services.currentUser
   * @requires  app.components.services.getUri
   * @requires  app.settings
   */
  .factory('authentication', function(settings, currentUser, $http, getUri, $q) {
    
    var authentication = {};
    var authStatusChecked = false;
    var authStatus;

    /**
     * @ngdoc method
     * @name isEnabled
     * @description  Gives the status of authentication on the DataTorrent cluster.
     * @methodOf app.components.services.authentication
     * @returns {boolean}    Returns true if authentication is enabled or unknown status and false if it is disabled.
    **/
    authentication.isEnabled = function() {
      if (authStatus === false) {
        return false;
      }
      return true;
    };

    /**
     * @ngdoc method
     * @name  isAuthenticated
     * @description Returns true if the user is authenticated in the system, false if user has not or auth is disabled.
     * @methodOf app.components.services.authentication
     * @return {Boolean} The boolean of whether user is authenticated or not
     */
    authentication.isAuthenticated = function() {
      if (!this.isEnabled()) {
        return false;
      }
      if (currentUser.data.authScheme && currentUser.data.userName) {
        return true;
      }
      return false;
    };

    /**
     * @ngdoc method
     * @name  retrieveAuthStatus
     * @description  GETs information from the Gateway about authentication status. Sets currentUser.authStatus to true or false.
     * @methodOf app.components.services.authentication
     * @return {Promise}   Resolves when this action has completed
     */
    authentication.retrieveAuthStatus = function() {
      
      var dfd = $q.defer();

      currentUser.fetch().then(
        function() {
          // check if authScheme is empty
          if (currentUser.data.authScheme) {
            authStatus = true;
          }
          else {
            authStatus = false;
          }

          dfd.resolve(authStatus);
        },
        function(res) {
          if (res.status === 401 || res.status === 403) {
            authStatus = true;
            dfd.resolve(authStatus);
          }
          else {
            dfd.reject(res);
          }
        }
      );

      dfd.promise.finally(function() {
        authStatusChecked = true;
      });

      return dfd.promise;
    };

    /**
     * @ngdoc method
     * @name  hasRetrievedAuthStatus
     * @description Returns true if the auth status has been retrieved on this page load.
     * @methodOf app.components.services.authentication
     * @return {Boolean} The boolean indicating whether or not auth status has been retrieved.
     */
    authentication.hasRetrievedAuthStatus = function() {
      return authStatusChecked;
    };


    return authentication;

  });
