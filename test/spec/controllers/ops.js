'use strict';

describe('Controller: OpsCtrl', function () {

  // load the controller's module
  beforeEach(module('dtConsoleApp'));

  var OpsctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    OpsctrlCtrl = $controller('OpsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a dashboardOptions object', function () {
    expect(scope.dashboardOptions).to.be.an('object');
  });
});
