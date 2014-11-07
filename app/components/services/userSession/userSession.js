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

angular.module('app.components.services.userSession', [])
  /**
    * @ngdoc service
    * @name app.components.services.userSession
    * @description Holds the user's state as far as authentication and authorization is concerned.
  **/
  .service('userSession', function() {

    /**
     * @ngdoc method
     * @name app.components.services.userSession#create
     * @methodOf app.components.services.userSession
     * @description
     * Sets the session information.
     * @param  {string} sessionId The session ID
     * @param  {string} userPrinciple    The user's principle, e.g. username or kerberos principle.
     * @param  {string} userRole  The role of the user
     */
    this.create = function (sessionId, userPrinciple, userRole) {
      this.id = sessionId;
      this.userPrinciple = userPrinciple;
      this.userRole = userRole;
    };

    /**
     * @ngdoc method
     * @name app.components.services.userSession#create
     * @methodOf app.components.services.userSession
     * @description 
     * Destroys the session information
     */
    this.destroy = function () {
      this.id = null;
      this.userPrinciple = null;
      this.userRole = null;
    };

    return this;

  });