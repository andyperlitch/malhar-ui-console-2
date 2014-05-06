'use strict';

angular.module('dtConsoleApp')
.factory('ClusterMetrics', function($resource, DtSettings) {
  var ClusterMetrics = $resource(DtSettings.urls.ClusterMetrics, { v: DtSettings.GATEWAY_API_VERSION });
  return ClusterMetrics;
});