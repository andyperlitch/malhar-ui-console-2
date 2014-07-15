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

angular.module('app.components.resources.BaseModel', [
  'underscore',
  'app.components.services.getUri',
  'app.components.resources.BaseResource'
])
.factory('BaseModel', function(_, getUri, BaseResource) {

  // Abstract BaseModel class
  var BaseModel = BaseResource.extend({

    /**
     * Constructor for models. Expects this.urlKey and/or this.topicKey
     * to be defined in a subclass.
     * 
     * @param  {object} params  Parameters to be used when interpolating url or topic URIs
     */
    constructor: function (params) {
      this.url = getUri.url(this.urlKey, params);
      this.data = {};
      if (this.topicKey) {
        this.topic = getUri.topic(this.topicKey, params);
      }
    },

    /**
     * Called when new data from the server comes in, e.g. from fetch or webSocket.
     * If this is a websocket message and a scope was supplied to the subscribe
     * function, scope.$apply() will be called AFTER this function is executed.
     * 
     * @param  {object} data  The transformed data from the server.
     */
    set: function(data) {
      _.extend(this.data, data);
    },

    debugName: 'model',

    idAttribute: 'id'

  });

  return BaseModel;

})