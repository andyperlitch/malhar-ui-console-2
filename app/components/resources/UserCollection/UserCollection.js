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

angular.module('app.components.resources.UserCollection', [
  'app.components.resources.BaseCollection',
  'app.components.resources.UserModel'
])
/**
 * @ngdoc service
 * @name  app.components.resources.UserCollection
 * @description  Represents a collection of UserModels
 * @requires  app.settings
 * @requires  app.components.services.getUri
 * @requires  app.components.resources.BaseCollection
 * @requires  app.components.resources.UserModel
 */
.factory('UserCollection', function(BaseCollection, UserModel) {
  var UserCollection = BaseCollection.extend({
    debugName: 'User Collection',
    urlKey: 'Users',
    model: UserModel,

    defaultSetOptions: {
      alwaysReset: true
    },

    ///////////////////////////////////////////////////
    // HACK: this should be the set() of BaseCollection
    // when we make all collection instantiate models for every item.
    /**
     * Called when new data from the server comes in, e.g. from fetch or webSocket.
     * 
     * @param  {object} data  The transformed data from the server.
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
      var eachFunction;

      if (options.pojos) {

        eachFunction = function(m) {
          // Look for existent model
          var mid = m[self._idAttribute_];
          var current = self.get(mid);
          updatedIds[mid] = true;
          if (current) {
            current.set(m);
          }
          // Otherwise just add to collection
          else {
            data.push(new self.model().set(m));
          }
        };

      } else {

        eachFunction = function(m) {
          // Look for existent model
          var mid = m.data[self._idAttribute_];
          var current = self.get(mid);
          updatedIds[mid] = true;
          if (current) {
            current.set(m.data);
          }
          // Otherwise just add to collection
          else {
            data.push(m);
          }
        };

      }

      _.each(updates, eachFunction);

      // Remove items that have not been updated, if necessary
      if (options.remove) {
        for (var i = data.length -1; i >= 0; i--) {
          if (!updatedIds[data[i].data[idAttribute]]) {
            data.splice(i, 1);
          }
        }
      }
    },

    /**
     * Gets the model by model.prototype.idAttribute
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
        return model.data[idAttribute] === id;
      });
    },

    // HACK: should remove when we make all collection
    // instantiate models for every item.
    transformResponse: function(raw) {
      return _.map(raw.users, function(u) {
        return new UserModel(u.userName).set(u);
      });
    },

    // HACK: should put this in BaseCollection when
    // the above change is made
    toArray: function() {
      return _.map(this.data, function(u) {
        return u.data;
      });
    },

    // Uncomment this when hack no longer necessary:
    // transformResponse: 'users'

  });
  return UserCollection;
});