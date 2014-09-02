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

angular.module('app.components.services.getUri', ['app.settings'])
.factory('getUri', function (settings) {

  function interpolateParams(string, params) {
    return string.replace(/:(\w+)/g, function(match, paramName) {
      return encodeURIComponent(params[paramName]);
    });
  }

  // Public API here
  return {
    url: function(key, params, id) {
      if (typeof params === 'string' || typeof params === 'number') {
        id = params;
        params = {};
      }
      var template = settings.urls[key];

      if (id) {
        template += '/' + id;
      }

      return interpolateParams(template, angular.extend({v: settings.GATEWAY_API_VERSION}, params));
    },
    action: function(key, params) {
      var template = settings.actions[key];
      return interpolateParams(template, angular.extend({v: settings.GATEWAY_API_VERSION}, params));
    },
    topic: function(key, params) {
      var template = settings.topics[key];
      return interpolateParams(template, angular.extend({v: settings.GATEWAY_API_VERSION}, params));
    },
    page: function(key, params, excludeHash) {
      var template = settings.pages[key];
      return (excludeHash ? '' : '#') + interpolateParams(template, angular.extend({}, params));
    },
    breadcrumb: function(key, params) {
      var template = settings.breadcrumbs[key];
      return interpolateParams(template, angular.extend({}, params));
    }
  };
});
