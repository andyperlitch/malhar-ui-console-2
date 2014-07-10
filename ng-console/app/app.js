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

angular.module('dtConsole', [
  // bower components
  'ngRoute',
  'ui.notify',
  'ng-breadcrumbs',
  'mgcrea.ngStrap.navbar',
  'mgcrea.ngStrap.dropdown',
  'ui.dashboard',

  // components
  'dtConsole.webSocket',
  'dtConsole.percent2cpuFilter',
  'dtConsole.commaGroupsFilter',
  'dtConsole.byteFilter',
  'dtConsole.textDirective',
  'dtConsole.textService',
  'dtConsole.extendService',

  // pages
  'dtConsole.pages.ops',

  // misc
  'dtConsole.settings'
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







// $routeProvider

//   // CONFIGURATION
//   .when('/config', {
//     templateUrl: 'views/config/index.html',
//     label: 'Configuration'
//   })
//   .when('/config/welcome', {
//     templateUrl: 'views/config/wizard.html',
//     label: 'Installation Wizard'
//   })
//   .when('/config/license-info', {
//     templateUrl: 'views/config/license.html',
//     label: 'License Information'
//   })

//   // DEVELOPMENT
//   .when('/dev', {
//     templateUrl: 'views/dev/index.html',
//     label: 'Development'
//   })
//   .when('/dev/build-an-etl-app', {
//     controller: 'BuildEtlCtrl',
//     templateUrl: 'views/dev/etl/etl.html',
//     label: 'Build an ETL App'
//   })
//   .when('/dev/analyze-apache-log', {
//     controller: 'ApacheLogMainCtrl',
//     templateUrl: 'views/apache-log/apache-log.html',
//     label: 'Analyze an Apache Log'
//   })
  
//   // OPERATIONS
//   .when('/ops', {
//     controller: 'OpsCtrl',
//     templateUrl: 'views/ops/index.html',
//     label: 'Operations'
//   })
//   .when('/ops/apps/:appId', {
//     controller: 'ApplicationCtrl',
//     templateUrl: 'views/ops/index.html',
//     label: 'Applications'
//   })

//   // DEFAULT
//   .otherwise({
//     redirectTo: '/config'
//   });

