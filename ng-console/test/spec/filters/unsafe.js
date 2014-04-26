'use strict';

describe('Filter: unsafe', function () {

  // load the filter's module
  beforeEach(module('dtConsoleApp'));

  // initialize a new instance of the filter before each test
  var unsafe, sce;
  beforeEach(inject(function ($filter, $sce) {
    unsafe = $filter('unsafe');
    sce = $sce;
  }));

  it('should not escape html entities', function () {
    var text = '<div>';
    var computed = unsafe(text);
    var value = sce.getTrustedHtml(computed);
    expect( value ).to.equal('<div>');
  });

});
