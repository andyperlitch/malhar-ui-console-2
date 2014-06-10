'use strict';

describe('Filter: timeSince', function () {

  // load the filter's module
  beforeEach(module('dtConsoleApp'));

  // initialize a new instance of the filter before each test
  var timeSince;
  beforeEach(inject(function ($filter) {
    timeSince = $filter('timeSince');
  }));

  it('should return the input prefixed with "timeSince filter:"', function () {
    var text = 'angularjs';
    expect(timeSince(text)).toBe('timeSince filter: ' + text);
  });

});
