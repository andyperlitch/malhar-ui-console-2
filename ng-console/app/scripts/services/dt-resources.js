'use strict';

angular.module('dtConsoleApp')
.factory('ClusterMetrics', function($resource, DtSettings) {
  var ClusterMetrics = $resource(DtSettings.urls.ClusterMetrics, { v: DtSettings.GATEWAY_API_VERSION });
  return ClusterMetrics;
})
.factory('Applications', function($resource, DtSettings) {

  var Applications;

  function transform(data) {
    return data.apps;
  }

  Applications = $resource(
    DtSettings.urls.Application, 
    { v: DtSettings.GATEWAY_API_VERSION },
    {
      getRunning: {
        method: 'GET',
        params: {
          states: 'RUNNING'
        },
        responseType: 'json',
        transformResponse: transform,
        isArray: true
      }
    }
  );
  return Applications;
});