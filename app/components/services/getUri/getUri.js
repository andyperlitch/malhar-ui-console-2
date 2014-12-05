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
/**
 * @ngdoc service
 * @name app.components.services.services:getUri
 * @description Service for interpolating URIs for various uses.
 * @requires app.settings
**/
angular.module('app.components.services.getUri', ['app.settings'])
.factory('getUri', function (settings) {

  function interpolateParams(string, params) {
    return string.replace(/:(\w+)/g, function(match, paramName) {
      return encodeURIComponent(params[paramName]);
    });
  }

  // Public API here
  return {
    /**
     * @ngdoc method
     * @name url
     * @methodOf app.components.services.services:getUri
     * @description Generates a url based on a key from {@link app.settings app.settings.urls}.
     * @param  {string} key    The uri key as it appears in app.settings.urls
     * @param  {object} [params] (optional) An object that should be used when interpolating the url
     * @param  {string|number} [id]     (optional) A string or number to append to the url, e.g. as in /operators/123
     * @return {string}        the interpolated resource URL 
     */
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

    /**
     * @ngdoc method
     * @name action
     * @methodOf app.components.services.services:getUri
     * @description Generates a url based on a key from {@link app.settings app.settings.actions}.
     * @param  {string} key    The uri key as it appears in app.settings.actions
     * @param  {object} [params] (optional) An object that should be used when interpolating the url
     * @return {string}        the interpolated action URL 
     */
    action: function(key, params) {
      var template = settings.actions[key];
      return interpolateParams(template, angular.extend({v: settings.GATEWAY_API_VERSION}, params));
    },

    /**
     * @ngdoc method
     * @name topic
     * @methodOf app.components.services.services:getUri
     * @description Generates a url based on a key from {@link app.settings app.settings.topics}.
     * @param  {string} key    The uri key as it appears in app.settings.topics
     * @param  {object} [params] (optional) An object that should be used when interpolating the topic uri
     * @return {string}        the interpolated topic URI 
     */
    topic: function(key, params) {
      var template = settings.topics[key];
      return interpolateParams(template, angular.extend({v: settings.GATEWAY_API_VERSION}, params));
    },

    /**
     * @ngdoc method
     * @name page
     * @methodOf app.components.services.services:getUri
     * @description Generates a page url based on a key from {@link app.settings app.settings.pages}.
     * @param  {string} key    The uri key as it appears in app.settings.pages
     * @param  {object} [params] (optional) An object that should be used when interpolating the page url
     * @param  {boolean} [excludeHash] If true, a "#" will not be prepended to the returned page url.
     * @return {string}        the interpolated page url 
     */
    page: function(key, params, excludeHash) {
      var template = settings.pages[key];
      return (excludeHash ? '' : '#') + interpolateParams(template, angular.extend({}, params));
    },

    /**
     * @ngdoc method
     * @name  breadcrumb
     * @methodOf app.components.services.services:getUri
     * @description Generates breadcrumb text based on a key from {@link app.settings app.settings.breadcrumbs}.
     * @param  {string} key    The breadcrumb key as it appears in app.settings.breadcrumbs
     * @param  {object} [params] ()
     * @return {string}        (optional) An object that should be used when interpolating the breadcrumbs
     */
    breadcrumb: function(key, params) {
      var template = settings.breadcrumbs[key];
      return interpolateParams(template, angular.extend({}, params));
    }
  };
});
