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

angular.module('dtConsole.resources.Base', [
  'underscore',
  'dtConsole.webSocket',
  'restangular',
  'dtConsole.getUri',
  'dtConsole.extendService'
])
.factory('BaseModel', function(_, getUri, webSocket, Restangular, extend) {


  /**
   * Abstract base model for resources
   *
   *   Inherited classes must provide a urlKey and/or a topicKey.
   *   These keys correspond to keys of URIs located in settings.
   *     
   * @param {Object} params (Optional) An object containing parameters to be used in the resource url
   */
  function BaseModel(params) {
    this.resource = Restangular.one(getUri.url(this.urlKey), params);
    this.data = {};
    if (this.topicKey) {
      this.topic = getUri.topic(this.topicKey, params);
    }
  }

  BaseModel.prototype = {
    fetch: function() {
      this.data = this.resource.get().$object;
    },
    subscribe: function(scope) {
      if (!this.topic) {
        return;
      }
      var subscribeFn = this.onUpdate;
      this._subscribeFn = _.bind(subscribeFn, this);
      this.updateScope = scope;
      webSocket.subscribe(this.topic, this._subscribeFn);
    },
    unsubscribe: function() {
      webSocket.unsubscribe(this.topic, this._subscribeFn);
      this.updateScope = null;
    },
    onUpdate: function(data) {
      _.extend(this.data, data);
      this.updateScope.$apply();
    }
  };

  BaseModel.extend = extend;

  return BaseModel;

})
.factory('BaseCollection', function(getUri, webSocket, Restangular, extend) {

  function BaseCollection(url, urlParams, topic, topicParams) {
    if (typeof urlParams === 'string') {
      topicParams = topic;
      topic = urlParams;
      urlParams = undefined;
    }
    this.resource = Restangular.all(getUri.url(url), urlParams);
    this.data = [];
    this.topic = getUri.topic(topic, topicParams);
  }

  BaseCollection.prototype = {
    fetch: function() {
      this.data = this.resource.getList().$object;
    },
    subscribe: function() {
      if (!this.topic) {
        return;
      }
      var subscribeFn = this.onUpdate;
      this._subscribeFn = _.bind(subscribeFn, this);
      webSocket.subscribe(this.topic, this._subscribeFn);
    },
    unsubscribe: function() {
      webSocket.unsubscribe(this.topic, this._subscribeFn);
    },
    onUpdate: function(data) {
      this.data = data;
    }
  };

  BaseCollection.extend = extend;

  return BaseCollection;

});
