'use strict';

describe('Controller: ApacheLogMainCtrl', function () {

  // load the controller's module
  beforeEach(module('dtConsoleApp'));

  var ApacheLogMainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ApacheLogMainCtrl = $controller('ApacheLogMainCtrl', {
      $scope: scope
    });
  }));
  
});
