'use strict';

angular.module('dtConsoleApp')
  .directive('dtText', function (DtText) {
    return {
      restrict: 'A',
      scope: {
        key: '@dtText'
      },
      link: function postLink(scope, element) {
        element.text(DtText.get(scope.key));
      }
    };
  });
