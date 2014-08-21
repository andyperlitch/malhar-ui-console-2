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
  'ngAnimate',
  'ui.notify',
  'ng-breadcrumbs',
  'mgcrea.ngStrap.navbar',
  'mgcrea.ngStrap.dropdown',
  'ui.dashboard',

  // components
  'ui.websocket',
  'app.components.filters.percent2cpu',
  'app.components.filters.commaGroups',
  'app.components.filters.byte',
  'app.components.filters.timeSince',
  'app.components.filters.windowOffset',
  'app.components.filters.dtContainerShorthand',
  'app.components.directives.dtText',
  'app.components.directives.dtTableSelectedCount',
  'app.components.directives.containerLogsDropdown',
  'app.components.services.dtText',
  'app.components.services.extend',
  'app.components.services.userStorage',
  'app.components.services.setupBreadcrumbs',

  // pages
  'app.pages.ops',
  'app.pages.ops.appInstance',
  'app.pages.ops.appInstance.logicalOperator',
  'app.pages.ops.appInstance.physicalOperator',
  'app.pages.ops.appInstance.physicalOperator.port',
  'app.pages.ops.appInstance.container',
  'app.pages.ops.appInstance.container.containerLog',
  'app.pages.ops.appInstance.logicalStream',

  // misc
  'app.settings'
])
  .config(function (settings, webSocketProvider, $routeProvider, userStorageProvider) {

    // webSocket
    var host = settings.GATEWAY_WEBSOCKET_HOST ? settings.GATEWAY_WEBSOCKET_HOST : window.location.host;
    webSocketProvider.setWebSocketURL('ws://' + host + '/pubsub');
    webSocketProvider.setVisibilityTimeout(settings.VISIBILITY_TIMEOUT);

    // userStorage save function
    userStorageProvider.setSaveFunction(function() {
      localStorage.setItem(settings.STORAGE_KEY, this.serialize());
    });

    // Catchall route
    $routeProvider
      .otherwise({
        redirectTo: '/ops'
      });

  })
  .run(function(userStorage, settings, $log) {
    // load saved state in userStorage
    var json = localStorage.getItem(settings.STORAGE_KEY);
    var storage;

    if (json) {
      try {
        storage = JSON.parse(json);
      } catch (e) {
        $log.warn('State from localStorage could not be parsed! ', e);
        localStorage.removeItem(settings.STORAGE_KEY);
        storage = {};
      }
    } else {
      storage = {};
    }
      
    userStorage.load(storage);
  });

angular.module('exceptionOverride', []).factory('$exceptionHandler', function () {
  return function (exception, cause) {
    exception.message += ' (caused by "' + cause + '")';
    throw exception;
  };
});