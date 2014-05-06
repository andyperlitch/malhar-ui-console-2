'use strict';

angular.module('dtConsoleApp')
    .factory('ClusterMetrics', function($resource, DtSettings) {

        var ClusterMetrics = $resource(DtSettings.urls.ClusterMetrics, { v: DtSettings.restVersion })

    })