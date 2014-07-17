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

angular.module('app.components.resources.BaseResource', [
  'underscore',
  'app.components.services.webSocket',
  'app.components.services.extend'
])
.factory('BaseResource', function(_, $http, webSocket, extend, $log) {

  /**
   * Abstract class for all resources (models and collections).
   * Contains shared logic for subscribe/unsubscribe, fetching,
   * transforming server response, etc.
   */
  function BaseResource() {}
  BaseResource.prototype = {

    /**
     * Uses this.url to retrieve info from the server.
     * 
     * @param  {object} options   (optional) The config object to be past to $http.get().
     * @return {Promise}          The original $http promise.
     */
    fetch: function(options) {

      // Initialize GET
      var promise = $http.get(this.url, options);

      // Reference to this
      var self = this;

      // Store in data on return
      promise.then(
        function(response) {
          self.set( self._getTransformed(response.data, 'fetch') );
        },
        _.bind(this.onFetchError,this)
      );

      // Return the promise
      return promise;

    },

    /**
     * Subscribes to this.topic for updates.
     * A scope can optionally be passed in order
     * to call $digest on updates. Highly recommended.
     */
    subscribe: function(scope) {
      // Ensure there is a topic to subscribe to
      // before continuing
      if (!this.topic) {
        return;
      }

      // Creating a newly-bound function. This is so 
      // unsubscribe can reference this unique function
      // as the second argument. Otherwise multiple instances
      // will share the same handler function.
      this.__subscribeFn__ = _.bind(function(data) {
        this.set(this._getTransformed(data, 'subscribe'));
      }, this);

      // Use the webSocket service to subscribe to the topic
      webSocket.subscribe(this.topic, this.__subscribeFn__, scope);
    },

    /**
     * Unsubscribes to this.topic. Should only be called after
     * this.subscribe has been called at least once.
     */
    unsubscribe: function() {
      webSocket.unsubscribe(this.topic, this.__subscribeFn__);
    },

    /**
     * The function that actually updates this.data. Since this
     * is different for models and collections, it must be
     * implemented in child classes.
     */
    set: function() {
      throw new TypeError('The set method must be implemented in a child class of BaseResource!');
    },

    onFetchError: function() {
      $log.error(this.debugName + ' failed to load from the server!');
    },

    /**
     * (private method) Takes the raw data returned from
     * the server (either via REST or WebSocket) and looks
     * at this.transfr
     * @param  {Object} raw   Raw response from the server.
     * @return {Object}       The transformed data, to be passed to this.set
     */
    _getTransformed: function(raw, type) {
      // Will hold transformed data
      var data;
      // Check for transformResponse
      var transform = this.transformResponse;
      switch (typeof transform) {

        // String implies a key on an object
        case 'string':
          data = raw[transform];
          break;

        // Function means fully-custom transformation
        case 'function':
          data = transform.call(this, raw, type);
          break;

        // Otherwise, assume the raw data does 
        // not need to be transformed
        default:
          data = raw;
          break;

      }
      return data;
    },

    // Used for logging statements
    debugName: 'resource'

  };

  // Add the convenience method for creating sub classes
  BaseResource.extend = extend;

  return BaseResource;

});