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

angular.module('app', [
  // bower components
  'ngRoute',
  'ui.notify',
  'ng-breadcrumbs',
  'mgcrea.ngStrap.navbar',
  'mgcrea.ngStrap.dropdown',
  'ui.dashboard',

  // components
  'app.components.services.webSocket',
  'app.components.filters.percent2cpu',
  'app.components.filters.commaGroups',
  'app.components.filters.byte',
  'app.components.directives.text',
  'app.components.services.text',
  'app.components.services.extend',

  // pages
  'app.pages.ops',

  // misc
  'app.settings'
])
.config(function (settings, webSocketProvider, $routeProvider, RestangularProvider) {
  webSocketProvider.setWebSocketURL('ws://node0.morado.com:9090/pubsub');
  RestangularProvider.setBaseUrl('/ws/' + settings.GATEWAY_API_VERSION);

  // Catchall route
  $routeProvider
    .otherwise({
      redirectTo: '/ops'
    });
});
angular.module('exceptionOverride', []).factory('$exceptionHandler', function () {
  return function (exception, cause) {
    exception.message += ' (caused by "' + cause + '")';
    throw exception;
  };
});
