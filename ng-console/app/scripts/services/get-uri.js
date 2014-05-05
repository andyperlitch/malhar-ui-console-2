'use strict';

angular.module('dtConsoleApp')
  .factory('getUri', function (DtSettings) {

    function interpolateParams(string, params) {
        return string.replace(/:(\w+)/g, function(match, paramName) {
            return encodeURIComponent(params[paramName]);
        });
    }

    // Public API here
    return {
      url: function(key, params) {
        var template = DtSettings.urls[key];
        return interpolateParams(template, angular.extend({v: DtSettings.version}, params));
      },
      action: function(key, params) {
        var template = DtSettings.actions[key];
        return interpolateParams(template, angular.extend({v: DtSettings.version}, params));
      },
      topic: function(key, params) {
        var template = DtSettings.topics[key];
        return interpolateParams(template, angular.extend({v: DtSettings.version}, params));
      }
    };
  });
