'use strict';

angular.module('dtConsole.textDirective', ['dtConsole.textService'])
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
