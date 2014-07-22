'use strict';

describe('Filter: appIdLink', function () {

  // load the filter's module
  beforeEach(module('dtConsoleApp'));

  // initialize a new instance of the filter before each test
  var appIdLink;
  beforeEach(inject(function ($filter) {
    appIdLink = $filter('appIdLink');
  }));

  it('should return a string', function() {
    expect(appIdLink('myappid')).to.be.a('string');
  });

  it('should return an <a>nchor', function() {
    var string = appIdLink('myappid');
    var anchor = angular.element(string);
    expect(anchor.length).to.equal(1);
  });

  it('should return an anchor with a href and title', function() {
    var string = appIdLink('myappid');
    var anchor = angular.element(string);
    expect(anchor.attr('href')).to.be.a('string');
    expect(anchor.attr('href').length).to.be.above(0);
    expect(anchor.attr('title')).to.be.a('string');
    expect(anchor.attr('title').length).to.be.above(0);
  });

});
