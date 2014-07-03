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
  'dtConsole.getUri'
])
.factory('BaseModel', function(_, getUri, webSocket, Restangular) {


  /**
   * Base model for resources
   * 
   *   ## Usage 1: When url takes 0 parameters
   *      
   *       new BaseModel('UrlKey', 'TopicKey');
   *     
   *   ## Usage 2: When the url requires parameters
   *   
   *       new BaseModel('UrlKey', { param1: 'url-param' }, 'TopicKey');
   *
   *   ## Usage 3: When the url and topic need params
   *     
   *       new BaseModel('UrlKey', { param1: 'url-param' }, 'TopicKey', {param1: 'topic-param' });
   *     
   * @param {String} url    The key that corresponds to the resource url in app/settings.js, i.e. settings.urls[url]
   * @param {Object} params (Optional) An object containing parameters to be used in the resource url
   * @param {String} topic  (Optional) The key that corresponds to the resource topic in app/settings.js, i.e. settings.topics[topic]
   */
  function BaseModel(url, urlParams, topic, topicParams) {
    if (typeof urlParams === 'string') {
      topicParams = topic;
      topic = urlParams;
      urlParams = undefined;
    }
    this.resource = Restangular.one(getUri.url(url), urlParams);
    this.data = {};
    this.topic = getUri.topic(topic, topicParams);
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

  return BaseModel;

})
.factory('BaseCollection', function(getUri, webSocket, Restangular) {

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
      var subscribeFn = this.onUpdate || function(data) { this.data = data; };
      this._subscribeFn = _.bind(subscribeFn, this);
      webSocket.subscribe(this.topic, this._subscribeFn);
    },
    unsubscribe: function() {
      webSocket.unsubscribe(this.topic, this._subscribeFn);
    }
  };

  return BaseCollection;

});
