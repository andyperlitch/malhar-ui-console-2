'use strict';

angular.module('dtConsoleApp')
  .filter('appIdLink', function () {
    return function (appId) {
      var shortId = appId;
      var parts = appId.split('_');
      if (parts.length) {
        shortId = parts[parts.length - 1];
      }
      
      var link = '<a href="#ops/apps/' + appId + '" title="' + appId + '">' + shortId + '</a>';
      return link;
    };
  });
