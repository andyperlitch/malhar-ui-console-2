'use strict';

describe('Service: appManager', function () {

  // load the service's module
  beforeEach(module('dtConsole.appManagerService'));

  // instantiate service
  var appManager;
  beforeEach(inject(function (_appManager_) {
    appManager = _appManager_;
  }));

  it('should be an object', function() {
    expect(typeof appManager).toEqual('object');
  });

  describe('the endApp method', function() {
    
    var $httpBackend;

    beforeEach(inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should issue a post request with id of app object passed to it', inject(function(getUri) {
      $httpBackend.expectPOST(getUri.url('Application'))
      appManager.endApp('kill', { id: 'application_101010101_0001' });


    }));

  });


});