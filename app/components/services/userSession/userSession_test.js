'use strict';

describe('Service: userSession', function () {

  // load the service's module
  var UserModel;
  beforeEach(module('app.components.services.userSession', function($provide) {
    $provide.value('UserModel', UserModel = function() {

    });
  }));

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

  it('should be an instance of UserModel', function() {
    expect(userSession instanceof UserModel).toEqual(true);
  });

});