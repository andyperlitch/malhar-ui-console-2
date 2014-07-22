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

angular.module('dtConsoleApp')
.factory('AbstractPubSub', function(webSocket) {
  function AbstractPubSub() {
    this.handlers = [];
  }
  
  AbstractPubSub.prototype = {

    subscribe: function(fn) {
      webSocket.subscribe(this.topic, fn);
      this.handlers.push(fn);
    },

    unsubscribe: function(fn) {
      var topic = this.topic;
      if (typeof fn === 'function') {
        var index = this.handlers.indexOf(fn);
        if (index >= 0) {
          webSocket.unsubscribe(topic, fn);
          this.handlers.splice(index, 1);
        }
        return;
      }
      
      angular.forEach(this.handlers, function(fn) {
        webSocket.unsubscribe(topic, fn);
      });
      this.handlers = [];
    }
    
  };

  return AbstractPubSub;

})
.factory('ClusterMetrics', function($resource, DtSettings) {
  var ClusterMetrics = $resource(DtSettings.urls.ClusterMetrics, { v: DtSettings.GATEWAY_API_VERSION });
  return ClusterMetrics;
})
.factory('ApplicationsRest', function($resource, DtSettings) {

  var Applications;

  function transform(data) {
    return data.apps;
  }

  Applications = $resource(
    DtSettings.urls.Application,
    { v: DtSettings.GATEWAY_API_VERSION },
    {
      getActive: {
        method: 'GET',
        params: {
          states: 'RUNNING,ACCEPTED,SUBMITTED'
        },
        responseType: 'json',
        transformResponse: transform,
        isArray: true
      },
      getAll: {
        method: 'GET',
        responseType: 'json',
        transformResponse: transform,
        isArray: true
      },
      kill: {
        method: 'POST',
        responseType: 'json',
        url: DtSettings.actions.killApp
      },
      shutdown: {
        method: 'POST',
        responseType: 'json',
        url: DtSettings.actions.shutdownApp
      }
    }
  );
  return Applications;
})
.factory('ApplicationsPubSub', function(AbstractPubSub, getUri) {

  function ApplicationsPubSub() {
    AbstractPubSub.apply(this, arguments);
    this.topic = getUri.topic('Applications');
  }

  ApplicationsPubSub.prototype = Object.create(AbstractPubSub.prototype);

  return ApplicationsPubSub;
  
});