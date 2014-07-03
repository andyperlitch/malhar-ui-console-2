'use strict';

angular.module('dtConsole', [
  // bower components
  'ngRoute',
  'ui.notify',
  'ng-breadcrumbs',
  'mgcrea.ngStrap.navbar',
  'mgcrea.ngStrap.dropdown',

  // components
  'dtConsole.webSocket',

  // pages
  'dtConsole.pages.ops'
])
.config(function (webSocketProvider, $routeProvider) {
  webSocketProvider.setWebSocketURL('ws://node0.morado.com:9090/pubsub');
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

