'use strict';

describe('Service: DTtext', function () {

  // load the service's module
  beforeEach(module('dtConsoleApp'));

  // instantiate service
  var DTtext;
  beforeEach(inject(function (_DTtext_) {
    DTtext = _DTtext_;
  }));

  it('should do something', function () {
    expect(!!DTtext).to.equal(true);
  });

});
