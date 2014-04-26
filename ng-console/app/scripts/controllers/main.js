'use strict';

angular.module('dtConsoleApp')

  .controller('MainCtrl', ['$scope', 'breadcrumbs', function ($scope,breadcrumbs) {
      $scope.breadcrumbs = breadcrumbs;
    }]);
