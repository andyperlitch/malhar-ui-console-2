'use strict';

describe('Service: userSession', function () {

  // load the service's module
  beforeEach(module('app.components.services.userSession'));

  // instantiate service
  var userSession;
  beforeEach(inject(function (_userSession_) {
    userSession = _userSession_;
  }));

  it('should be an object', function() {
    expect(typeof userSession).toEqual('object');
  });

  it('should initialize without authEnabled being defined', function() {
    expect(typeof userSession.authEnabled).toEqual('undefined');
  });

  describe('the create method', function() {
    
    var sessionId, userPrinciple, userRole;

    beforeEach(function() {
      sessionId = 123;
      userPrinciple = 456;
      userRole = 'admin';

      userSession.create(sessionId, userPrinciple, userRole);
    });

    it('should set id', function() {
      expect(userSession.id).toEqual(sessionId);
    });

    it('should set userPrinciple', function() {
      expect(userSession.userPrinciple).toEqual(userPrinciple);
    });

    it('should set userRole', function() {
      expect(userSession.userRole).toEqual(userRole);
    });

  });

  describe('the destroy method', function() {
      
  });

});