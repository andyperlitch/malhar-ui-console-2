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
    
    var sessionScheme, principle, roles;

    beforeEach(function() {
      sessionScheme = 'kerberos';
      principle = 456;
      roles = ['admin'];

      userSession.create(sessionScheme, principle, roles);
    });

    it('should set scheme', function() {
      expect(userSession.scheme).toEqual(sessionScheme);
    });

    it('should set principle', function() {
      expect(userSession.principle).toEqual(principle);
    });

    it('should set roles', function() {
      expect(userSession.roles).toEqual(roles);
    });

  });

  describe('the destroy method', function() {
    
    var sessionScheme, principle, roles;

    beforeEach(function() {
      sessionScheme = 'kerberos';
      principle = 456;
      roles = ['admin'];

      userSession.create(sessionScheme, principle, roles);
    });

    it('should clear out scheme, principle, and roles of the userSession', function() {
      userSession.destroy();
      expect(userSession.scheme).toEqual(null);
      expect(userSession.principle).toEqual(null);
      expect(userSession.roles).toEqual(null);
    });    

  });

});