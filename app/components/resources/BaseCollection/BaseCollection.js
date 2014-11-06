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

angular.module('app.components.resources.BaseCollection', [
  'app.components.services.getUri',
  'app.components.resources.BaseResource',
  'app.components.resources.BaseModel'
])
/**
 * @ngdoc service
 * @name  app.components.resources.BaseCollection
 * @description  Base class for a collection of something.
 * @requires  app.components.services.getUri
 * @requires  app.components.resources.BaseResource
 * @requires  app.components.resources.BaseModel
 */
.factory('BaseCollection', function(getUri, BaseResource, BaseModel) {

  var BaseCollection = BaseResource.extend({
    /**
     * @ngdoc method
     * @name  constructor
     * @methodOf app.components.resources.BaseCollection
     * @description  Constructor for collections. Expects this.urlKey and/or this.topicKey
     *               to be defined in a subclass.
     * @param  {object} params  Parameters to be used when interpolating url or topic URIs
     */
    constructor: function(params) {
      _.extend(this, params);
      this.url = getUri.url(this.urlKey, params);
      this.data = [];
      this._idAttribute_ = this.model.prototype.idAttribute;
      if (this.topicKey) {
        this.topic = getUri.topic(this.topicKey, params);
      }
    },

    /**
     * @ngdoc property
     * @name  app.components.resources.BaseCollection.defaultSetOptions
     * @description Default options to be passed to the set method.
     * @type {Object}
     */
    defaultSetOptions: {
      /**
       * @ngdoc property
       * @name  remove
       * @propertyOf app.components.resources.BaseCollection.defaultSetOptions
       * @description If enabled, members of the collection that are not receiving
       *              an update will be removed from this.data
       * @type {Boolean}
       */
      remove: false,
      /**
       * @ngdoc property
       * @name  alwaysReset
       * @propertyOf app.components.resources.BaseCollection.defaultSetOptions
       * @description If the 'remove' option is enabled and this is enabled,
       *              the collection will simply be replaced by the updates
       *              passed to this.set. This can improve performance significantly,
       *              especially with large datasets.
       * @type {Boolean}
       */
      alwaysReset: false
    },

    /**
     * @ngdoc method
     * @name  set
     * @methodOf app.components.resources.BaseCollection
     * @description  Called when new data from the server comes in, e.g. from fetch or webSocket.
     * 
     * @param  {Array} updates    The transformed data from the server.
     * @param  {object} [options] Options to override defaultSetOptions.
     */
    set: function(updates, options) {

      // Ensure options is an object
      options = options || {};

      // Add default options
      _.defaults(options, this.defaultSetOptions);

      if (options.remove && options.alwaysReset) {
        this.data = updates;
        return;
      }

      // References to data and context
      var data = this.data;
      var self = this;
      var idAttribute = this._idAttribute_;

      var updatedIds = {};

      _.each(updates, function(m) {

        // Look for existent model
        var current = self.get(m[self._idAttribute_]);
        if (current) {
          updatedIds[current[idAttribute]] = true;
          _.extend(current, m);
        }
        // Otherwise just add to collection
        else {
          updatedIds[m[idAttribute]] = true;
          data.push(m);
        }

      });

      // Remove items that have not been updated, if necessary
      if (options.remove) {
        for (var i = data.length -1; i >= 0; i--) {
          if (!updatedIds[data[i][idAttribute]]) {
            data.splice(i, 1);
          }
        }
      }
    },

    /**
     * @ngdoc method
     * @name  get
     * @methodOf app.components.resources.BaseCollection
     * @description  Gets the model by model.prototype.idAttribute
     * @param  {Mixed} id  The id value to compare to idAttribute of current models
     * @return {Object}    Object in collection, if found. If not, will return undefined.
     */
    get: function(id) {

      if (typeof id === 'undefined') {
        return false;
      }

      // Keep reference of idAttribute
      var idAttribute = this._idAttribute_;
      return _.find(this.data, function(model) {
        // Check against each model
        return model[idAttribute] === id;
      });
    },

    debugName: 'collection',

    /**
     * @ngdoc property
     * @name  model
     * @propertyOf app.components.resources.BaseCollection
     * @description The class to use as a model for this collection. Used to determine what the idAttribute is for each model.
     * @type {BaseModel}
     */
    model: BaseModel

  });

  return BaseCollection;

});