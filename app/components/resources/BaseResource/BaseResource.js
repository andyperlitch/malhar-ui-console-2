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
  'ui.websocket',
  'app.components.services.extend'
])
.factory('BaseResource', function($http, webSocket, extend, $log, $q) {

  /**
   * @ngdoc service
   * @name  app.components.resources.BaseResource
   * @description  Abstract class for all resources (models and collections).
   *               Contains shared logic for subscribe/unsubscribe, fetching,
   *               transforming server response, etc.
   */
  function BaseResource() {}
  BaseResource.prototype = {

    /**
     * @ngdoc method
     * @name  fetch
     * @methodOf app.components.resources.BaseResource
     * @description  Uses this.url to retrieve info from the server.
     *               While fetching, this.fetching will be true. When
     *               the server responds, this.fetching will be false.
     *               Additionally, if the server errors, the original
     *               response object will be stored as this.fetchError.
     * 
     * @param  {object} options   (optional) The config object to be past to $http.get().
     * @return {Promise}          Decorated $http promise, resolves with transformed data.
     */
    fetch: function(options, setOptions) {

      // Set up custom deferred
      var deferred = $q.defer();

      // Initialize GET
      var httpPromise = $http.get(this.url, options);

      // Reference to this
      var self = this;

      // Set fetching property
      this.fetching = true;

      // Log request
      $log.info(this.debugName + ' requested. URL: ' + this.url + ', Options: ', options);

      // Store in data on return
      httpPromise.then(
        function(response) {

          // Update fetching flags
          self.fetching = false;
          self.fetchError = false;

          // Transform and store response data
          var transformed = self._getTransformed(response.data, 'fetch');
          self.set(transformed, setOptions);
          
          // Log Response
          $log.info(self.debugName + ' retrieved. Transformed: ', transformed, ', Raw Response: ', response);

          // Resolve deferred
          deferred.resolve(transformed);
        },
        _.bind(function(response) {

          // Update fetching flags
          self.fetching = false;
          self.fetchError = response;

          // Call the fetch error handler
          this.onFetchError(response);
          
          // Reject the deferred
          deferred.reject(response);
          
        },this)
      );

      // Return the promise
      return deferred.promise;

    },

    /**
     * @ngdoc method
     * @name  onFetchError
     * @methodOf app.components.resources.BaseResource
     * @description Called when there is an error while trying to fetch this resource. Override in child classes for custom behavior.
     * @param  {object} response The response object returned by the $http.get call.
     */
    onFetchError: function(response) {
      $log.error(this.debugName + ' failed to load from the server. Response: ', response);
    },

    /**
     * @ngdoc method
     * @name  save
     * @methodOf app.components.resources.BaseResource
     * @description  Saves this resource with put (by default)
     * @param  {object} options Options to be passed to $http.put
     * @param  {object} data    Data to send to the server instead of this.data.
     * @return {Promise}        The promise returned by $http.put
     */
    save: function(options, data) {

      // Save reference to this object for use in callbacks
      var self = this;

      // Set the saving flag. This can be used by
      // templates to show save status.
      this.saving = true;
      
      // Initiate the put
      var putPromise = $http.put(this.url, data || this.data);

      // Set the callbacks
      putPromise.then(
        function() {
          // Update the flag
          self.saving = false;
          
          // Remove any saveError from before
          self.saveError = null;
        },
        function(response) {
          // Update the flag
          self.saving = false;

          // Set the saveError to this
          self.saveError = response;

          // Call the save error callback
          self.onSaveError(response);
        }
      );

      return putPromise;
    },

    /**
     * @ngdoc method
     * @name  onSaveError
     * @methodOf app.components.resources.BaseResource
     * @description  Called when saving a resource fails.
     * @param  {object} response The response returned by the failed $http.put command.
     */
    onSaveError: function(response) {
      $log.error(this.debugName + ' failed to save to the server. Response: ', response);
    },


    post: function (payload, action) {
      var url = action ? (this.url + '/' + action) : this.url;
      return $http.post(url, payload);
    },

    remove: function () {
      return $http.delete(this.url);
    },

    /**
     * @ngdoc method
     * @name  subscribe
     * @methodOf app.components.resources.BaseResource
     * @description  Subscribes to this.topic for updates.
     *               A scope can optionally be passed in order
     *               to call $digest on updates. Highly recommended.
     * @param  {Scope}    scope        The scope to update when data is received on the resource topic.
     * @param  {Function} [callback]     An optional callback that gets called when data is received on the resource topic.
     * @param  {object}   [setOptions] (Optional) Options to pass to the resource's set method. See {@link app.components.resources.BaseCollection#set}.
     */
    subscribe: function(scope, callback, setOptions) {
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
        var transformed = this._getTransformed(data, 'subscribe');
        this.set(transformed, setOptions);
        if (callback) {
          callback(transformed);
        }
      }, this);

      // Use the webSocket service to subscribe to the topic
      webSocket.subscribe(this.topic, this.__subscribeFn__, scope);
    },

    /**
     * @ngdoc method
     * @name  fetchAndSubscribe
     * @methodOf app.components.resources.BaseResource
     * @description  Convenience method that calls {@link app.components.resources.BaseResource#fetch fetch} and {@link app.components.resources.BaseResource#subscribe subscribe}.
     * @param  {Scope}    scope    same as scope param in {@link app.components.resources.BaseResource#subscribe subscribe}.
     * @param  {Function} [callback] same as callback param in {@link app.components.resources.BaseResource#subscribe subscribe}
     * @return {Promise}            The promise returned by the {@link app.components.resources.BaseResource#fetch fetch} function.
     */
    fetchAndSubscribe: function (scope, callback) {
      var fetchPromise = this.fetch();

      fetchPromise.then(function (data) {
        callback(data);
      });

      this.subscribe(scope, callback);

      return fetchPromise;
    },

    /**
     * @ngdoc method
     * @name  unsubscribe
     * @methodOf app.components.resources.BaseResource
     * @description Unsubscribes to this.topic. Should only be called after
     *              this.subscribe has been called at least once.
     */
    unsubscribe: function() {
      webSocket.unsubscribe(this.topic, this.__subscribeFn__);
    },

    /**
     * @ngdoc method
     * @name  set
     * @methodOf app.components.resources.BaseResource
     * @description  The function that actually updates this.data. Since this
     *               is different for models and collections, it must be
     *               implemented in child classes.
     */
    set: function() {
      throw new TypeError('The set method must be implemented in a child class of BaseResource!');
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

    /**
     * @ngdoc property
     * @name  debugName
     * @propertyOf app.components.resources.BaseResource
     * @description  Name that is written to the console for debugging purposes.
     * @type {String}
     */
    debugName: 'resource'

  };

  // Add the convenience method for creating sub classes
  BaseResource.extend = extend;

  return BaseResource;

});