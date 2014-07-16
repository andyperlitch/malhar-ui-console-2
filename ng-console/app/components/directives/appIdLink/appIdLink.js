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

angular.module('app.components.directives.appIdLink', [
  'app.components.services.getUri'
])
.directive('appIdLink', function (getUri) {

  function link(scope, element) {
    element.attr('href', getUri.page('AppInstance', { appId: scope.id }) );
    var display = scope.id;
    if (scope.short) {
      var parts = scope.id.split('_');
      display = parts[parts.length - 1];
    }
    element.text(display);
  }

  return {
    restrict: 'A',
    scope: {
      id: '=appIdLink',
      short: '=?'
    },
    link: link
  };
});
