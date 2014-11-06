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

angular.module('app.components.resources.ApplicationCollection', [
  'app.components.services.getUri',
  'app.components.resources.BaseCollection',
  'app.components.resources.ApplicationModel',
  'app.settings'
])
/**
 * @ngdoc service
 * @name  app.components.resources.ApplicationCollection
 * @description  Represents a collection of application instances
 * @requires  app.settings
 * @requires  app.components.services.getUri
 * @requires  app.components.resources.BaseCollection
 * @requires  app.components.resources.ApplicationModel
 */
.factory('ApplicationCollection', function(BaseCollection, ApplicationModel, settings) {

  var ApplicationCollection = BaseCollection.extend({
    debugName: 'Application Instances',
    urlKey: 'Application',
    topicKey: 'Applications',
    transformResponse: 'apps',
    fetch: function(options) {
      // If options.params is not specified, only fetch
      // non-ended applications
      if (!options) {
        options = {};
      }
      if (!options.params) {
        options.params = {
          states: settings.NONENDED_APP_STATES.join(',')
        };
      }

      // Call super's as usual
      return BaseCollection.prototype.fetch.call(this, options);
    },
    model: ApplicationModel
  });

  return ApplicationCollection;

});