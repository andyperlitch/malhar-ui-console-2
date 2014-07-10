'use strict';

angular.module('dtConsole')
.filter('unsafe', function($sce) {
  return function(val) {
    return $sce.trustAsHtml(val);
  };
});
