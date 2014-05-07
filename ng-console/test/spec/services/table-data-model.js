'use strict';

describe('Service: tableDataModel', function () {

  // load the service's module
  beforeEach(module('dtConsoleApp'));

  // instantiate service
  var tableDataModel;
  beforeEach(inject(function (_tableDataModel_) {
    tableDataModel = _tableDataModel_;
  }));

  it('should do something', function () {
    expect(!!tableDataModel).toBe(true);
  });

});
