'use strict';

describe('Directive: dtText', function () {

  // load the directive's module
  beforeEach(module('dtConsoleApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<dt-text></dt-text>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the dtText directive');
  }));
});
