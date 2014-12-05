'use strict';

describe('Service: currentUser', function () {

  // load the service's module
  var UserModel;
  beforeEach(module('app.components.services.currentUser', function($provide) {
    $provide.value('UserModel', UserModel = function() {

    });
  }));

  // instantiate service
  var currentUser;
  beforeEach(inject(function (_currentUser_) {
    currentUser = _currentUser_;
  }));

  it('should be an object', function() {
    expect(typeof currentUser).toEqual('object');
  });

  it('should initialize without authEnabled being defined', function() {
    expect(typeof currentUser.authEnabled).toEqual('undefined');
  });

  it('should be an instance of UserModel', function() {
    expect(currentUser instanceof UserModel).toEqual(true);
  });

});
