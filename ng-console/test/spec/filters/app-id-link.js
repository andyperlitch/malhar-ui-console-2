'use strict';

describe('Filter: appIdLink', function () {

  // load the filter's module
  beforeEach(module('dtConsoleApp'));

  // initialize a new instance of the filter before each test
  var appIdLink;
  beforeEach(inject(function ($filter) {
    appIdLink = $filter('appIdLink');
  }));

  it('should return the input prefixed with "appIdLink filter:"', function () {
    var text = 'angularjs';
    expect(appIdLink(text)).toBe('appIdLink filter: ' + text);
  });

});
