'use strict';

angular.module('dtConsoleApp')
  .factory('getUri', function (dtSettings) {

    function interpolateParams(string, params) {
        return string.replace(/:(\w+)/g, function(match, paramName) {
            return encodeURIComponent(params[paramName]);
        });
    }

    // Public API here
    return {
      url: function(key, params) {
        var template = dtSettings.urls[key];

      },
      action: function() {

      },
      topic: function() {

      }
    };
  });
