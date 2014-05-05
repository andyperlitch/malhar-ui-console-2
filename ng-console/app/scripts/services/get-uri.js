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
        return interpolateParams(template, angular.extend({v: dtSettings.version}, params));
      },
      action: function() {
        var template = dtSettings.actions[key];
        return interpolateParams(template, angular.extend({v: dtSettings.version}, params));
      },
      topic: function() {
        var template = dtSettings.topics[key];
        return interpolateParams(template, angular.extend({v: dtSettings.version}, params));
      }
    };
  });
