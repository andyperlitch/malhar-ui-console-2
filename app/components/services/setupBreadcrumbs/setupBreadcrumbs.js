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

angular.module('app.components.services.setupBreadcrumbs', [
  'app.settings',
  'app.components.services.getUri'
])
.factory('setupBreadcrumbs', function(settings, getUri) {
  return function(breadcrumbs, $routeParams) {
    _.each(settings.breadcrumbs, function(template, key) {
      breadcrumbs.options[key] = getUri.breadcrumb(key, $routeParams);
    });
  };
});