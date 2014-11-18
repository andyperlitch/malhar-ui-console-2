/*
* Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';

describe('Resource: UserModel', function () {

  // load the service's module
  var url, loginUrl, logoutUrl, usersUrl, confirmDfd, $q, confirm, $rootScope;
  beforeEach(module('app.components.resources.UserModel', function($provide) {
    $provide.value('webSocket', {
      subscribe: function() {},
      unsubscribe: function() {}
    });
    $provide.constant('settings', {
      urls: {
        User: url = '/profile/user',
        Users: usersUrl = '/users'
      },
      actions: {
        login: loginUrl = '/login',
        logout: logoutUrl = '/logout'
      }
    });
    $provide.constant('PERMISSIONS', {
      BE_AWESOME: 'BE_TOTALLY_AWESOME',
      BE_AVERAGE: 'BE_TOTALLY_AVERAGE',
      BE_SUBPAR: 'BE_TOTALLY_SUBPAR'
    });
    $provide.value('confirm', confirm = jasmine.createSpy('confirm').and.callFake(function() {
      return confirmDfd.promise;
    }));
  }));

  // instantiate service
  var UserModel, $log;
  beforeEach(inject(function (_UserModel_, _$log_, _$q_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    UserModel = _UserModel_;
    $log = _$log_;
    confirmDfd = $q.defer();
  }));

  it('should be a function', function() {
    expect(typeof UserModel).toEqual('function');
  });

  describe('the fetch method', function() {
    
    var u;

    beforeEach(function() {
      u = new UserModel();
    });

    // test backend
    var $httpBackend;
    
    beforeEach(inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
    }));
    
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should make a get request to the User url from settings', function() {
      $httpBackend.whenGET(url).respond({});
      u.fetch();
      $httpBackend.expectGET(url);
      $httpBackend.flush();
    });

    describe('when the server responds with no auth', function() {
      
      it('should set data.authScheme to an empty string', function() {
        $httpBackend.whenGET(url).respond({
          'authScheme': ''
        });
        u.fetch();
        $httpBackend.flush();
        expect(u.data.authScheme).toEqual('');
      });

    });

    describe('when the server responds with 401 or 403 status', function() {
      
      _.each([401, 403], function(status) {
        it('should reset the data object', function() {
          u.data = { scheme: 'kerberos', userName: 'mrbojangles' };
          $httpBackend.whenGET(url).respond(status, {
            message: 'unauthenticated'
          });
          u.fetch();
          $httpBackend.flush();
          expect(u.data).toEqual({});
        });
      });

    });

    describe('when the server responds with a non-auth related error code', function() {

      it('should not reset the data object', function() {
          u.data = { scheme: 'kerberos', userName: 'mrbojangles' };
          $httpBackend.whenGET(url).respond(500, {
            message: 'unauthenticated'
          });
          u.fetch();
          $httpBackend.flush();
          expect(u.data).toEqual({ scheme: 'kerberos', userName: 'mrbojangles' });
      });

    });

  });

  describe('the login method', function() {
    
    // test backend
    var u, $httpBackend;
    
    beforeEach(inject(function(_$httpBackend_) {
      spyOn(UserModel.prototype, 'set');
      u = new UserModel();
      $httpBackend = _$httpBackend_;
    
      // USAGE:
      // $httpBackend.whenGET('/my-url?key=value').respond({});
      // $httpBackend.expectGET('/my-url?key=value');
      // $httpBackend.flush();
    }));
    
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should make a call to settings.actions.login', function() {
      $httpBackend.whenPOST(loginUrl).respond(200, {});
      u.login('mr', 'bojangles');
      $httpBackend.expectPOST(loginUrl);
      $httpBackend.flush();
    });

    it('should return a promise', function() {
      $httpBackend.whenPOST(loginUrl).respond(200, {});
      var result = u.login('mr', 'bojangles');
      expect(typeof result.then).toEqual('function');
      $httpBackend.flush();
    });

    describe('when the server responds with success', function() {
      
      it('should resolve the promise returned by the login call', function() {
        $httpBackend.whenPOST(loginUrl).respond(200, {
          authScheme: 'kerberos',
          userName: 'mrbojangles'
        });
        var promise = u.login('mrbojangles', 'admin');
        $httpBackend.flush();
        expect(promise.$$state.status).toEqual(1);
      });

      it('should call the set method with the server response', function() {
        $httpBackend.whenPOST(loginUrl).respond(200, {
          authScheme: 'kerberos',
          userName: 'mrbojangles'
        });
        u.login('mrbojangles', 'admin');
        $httpBackend.flush();
        expect(u.set).toHaveBeenCalled();
      });

    });

    describe('when the server responds with error', function() {
      
      it('should reject the promise returned by the login call', function() {
        $httpBackend.whenPOST(loginUrl).respond(401, { message: 'Login failed' });
        var promise = u.login('mrbojangles', 'admin');
        $httpBackend.flush();
        expect(promise.$$state.status).toEqual(2);
      });

    });

  });

  describe('the logout method', function() {

    var u;

    beforeEach(function() {
      u = new UserModel();
      u.set({
        userName: 'mrbojangles',
        authScheme: 'kerberos'
      });
    });

    // test backend
    var $httpBackend;
    
    beforeEach(inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
    
      // USAGE:
      // $httpBackend.expectGET('/my-url?key=value');
      // $httpBackend.flush();
    }));
    
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should return a promise', function() {
      $httpBackend.whenPOST(logoutUrl).respond(200, {});
      var result = u.logout();
      expect(typeof result.then).toEqual('function');
      $httpBackend.flush();
    });

    it('should post to the logout url', function() {
      $httpBackend.whenPOST(logoutUrl).respond(200, {});
      u.logout();
      $httpBackend.expectPOST(logoutUrl);
      $httpBackend.flush();
    });

    describe('when the logout succeeds', function() {
      
      it('should clear everything in the data object', function() {
        $httpBackend.whenPOST(logoutUrl).respond(200, {});
        u.logout();
        $httpBackend.flush(); 
        expect(u.data).toEqual({});
      });

      it('should resolve the returned promise', function() {
        $httpBackend.whenPOST(logoutUrl).respond(200, {});
        var result = u.logout();
        $httpBackend.flush(); 
        expect(result.$$state.status).toEqual(1);
      });

    });

    describe('when the logout fails', function() {
      
      it('should not clear anything in the data object', function() {
        $httpBackend.whenPOST(logoutUrl).respond(500, {});
        u.logout();
        $httpBackend.flush(); 
        expect(u.data).not.toEqual({});
      });

      it('should reject the returned promise', function() {
        $httpBackend.whenPOST(logoutUrl).respond(500, {});
        var result = u.logout();
        $httpBackend.flush(); 
        expect(result.$$state.status).toEqual(2);
      });

    });

  });

  describe('the can method', function() {

    var u;

    beforeEach(function() {
      u = new UserModel();
      u.set({
        userName: 'mrbojangles',
        authScheme: 'kerberos',
        permissions: [
          'BE_TOTALLY_AVERAGE'
        ]
      });
      spyOn($log, 'warn');
    });
    
    it('should call $log.warn and return TRUE if the ability is not found in the list of known abilities', function() {
      var result = u.can('DANCE');
      expect($log.warn).toHaveBeenCalled();
      expect(result).toEqual(true);
    });

    describe('when the ability is in the list of known abilities', function() {
      
      it('should return false if the user does not have it in his/her list of permissions', function() {
        expect(u.can('BE_AWESOME')).toEqual(false);
      });

      it('should return true if the user has it in his/her list of permissions', function() {
        expect(u.can('BE_AVERAGE')).toEqual(true);
      });

    });

  });

  describe('the is method', function() {

    var u;

    beforeEach(function() {
      u = new UserModel().set({
        roles: ['admin']
      });
    });
    
    it('should return true if the user has the provided role', function() {
      expect(u.is('admin')).toEqual(true);
    });

    it('should return false if the user does not have the provided role', function() {
      expect(u.is('superadmin')).toEqual(false);
    });

    describe('when there is no roles', function() {

      beforeEach(function() {
        delete u.data.roles;
      });
      
      it('should not throw', function() {
        expect(function() {
          u.is('something');
        }).not.toThrow();
      });

      it('should return false', function() {
        expect(u.is('admin')).toEqual(false);
      });

    });

  });

  describe('the addRole method', function() {

    var u;

    beforeEach(function() {
      u = new UserModel().set({
        roles: ['admin']
      });
    });
    
    it('should add the provided role to the roles object', function() {
      u.addRole('super');
      expect(u.is('super')).toEqual(true);
    });

    it('should return the instance', function() {
      expect(u.addRole('super') === u).toEqual(true);
    });

    it('should do nothing if the role is already in the user roles', function() {
      var init = JSON.stringify(u.data);
      u.addRole('admin');
      expect(JSON.stringify(u.data)).toEqual(init);
    });

    describe('when there is no roles', function() {

      beforeEach(function() {
        delete u.data.roles;
      });
      
      it('should not throw', function() {
        expect(function() {
          u.addRole('something');
        }).not.toThrow();
      });

      it('should add the role', function() {
        u.addRole('admin');
        expect(u.is('admin')).toEqual(true);
      });

    });

  });

  describe('the removeRole method', function() {
    
    var u;

    beforeEach(function() {
      u = new UserModel().set({
        roles: ['admin', 'super']
      });
    });

    it('should remove the role', function() {
      u.removeRole('super');
      expect(u.is('super')).toEqual(false);
    });

    it('should do nothing if the role is not there', function() {
      var init = JSON.stringify(u.data);
      u.removeRole('duper');
      expect(JSON.stringify(u.data)).toEqual(init);
    });

    describe('when there is no roles', function() {

      beforeEach(function() {
        delete u.data.roles;
      });
      
      it('should not throw', function() {
        expect(function() {
          u.removeRole('something');
        }).not.toThrow();
      });

      it('should add an empty array for roles', function() {
        u.removeRole('duper');
        expect(u.data.roles instanceof Array).toEqual(true);
      });

    });

  });

  describe('the create method', function() {
    
    // test backend
    var $httpBackend, u, createUrl;
    
    beforeEach(inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      u = new UserModel().set({ userName: 'blandy' });
      createUrl = usersUrl + '/blandy';
      $httpBackend.whenPUT(createUrl).respond({});
    }));
    
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should PUT the user with the User url', function() {
      $httpBackend.expectPUT(createUrl);
      u.create();
      $httpBackend.flush();
    });

    it('should return a promise', function() {
      $httpBackend.expectPUT(createUrl);
      expect(typeof u.create().then).toEqual('function');
      $httpBackend.flush();
    });

  });

  describe('the save method', function() {
    // test backend
    var $httpBackend, u, saveUrl;
    
    beforeEach(inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      u = new UserModel().set({ userName: 'blandy' });
      saveUrl = usersUrl + '/blandy';
      $httpBackend.whenPOST(saveUrl).respond({});
    }));
    
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should POST the user with the User url', function() {
      $httpBackend.expectPOST(saveUrl);
      u.save();
      $httpBackend.flush();
    });

    it('should return a promise', function() {
      $httpBackend.expectPOST(saveUrl);
      expect(typeof u.save().then).toEqual('function');
      $httpBackend.flush();
    });

    describe('when a new password is supplied', function() {
      
      it('should add newPassword to the data object being sent', function() {
        $httpBackend.expectPOST(saveUrl, { userName: 'blandy', newPassword: 'password123' });
        u.save('password123');
        $httpBackend.flush(); 
      });

      it('should not alter the instance data object', function() {
        $httpBackend.expectPOST(saveUrl);
        u.save('password123');
        $httpBackend.flush(); 
        expect(u.newPassword).toBeUndefined();
      });

      describe('and old password is supplied', function() {
        
        it('should add newPassword and oldPassword to the data object being sent', function() {
          $httpBackend.expectPOST(saveUrl, { userName: 'blandy', newPassword: 'password123', oldPassword: 'passwd' });
          u.save('password123', 'passwd');
          $httpBackend.flush();
        });

        it('should not alter the instance data object', function() {
          $httpBackend.expectPOST(saveUrl);
          u.save('password123', 'passwd');
          $httpBackend.flush(); 
          expect(u.newPassword).toBeUndefined();
          expect(u.oldPassword).toBeUndefined();
        });

      });

    });
  });

  describe('the delete method', function() {
    
    var $httpBackend, u, delUrl;
    
    beforeEach(inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      u = new UserModel().set({ userName: 'blandy' });
      delUrl = usersUrl + '/blandy';
      $httpBackend.whenDELETE(delUrl).respond({});
    }));
    
    
    beforeEach(inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
    
      // USAGE:
      // $httpBackend.whenGET('/my-url?key=value').respond({});
      // $httpBackend.expectGET('/my-url?key=value');
      // $httpBackend.flush();
    }));
    
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should first confirm with the user', function() {
      u.delete();
      expect(confirm).toHaveBeenCalled();
    });

    it('should DELETE the user when confirmed', function() {
      $httpBackend.expectDELETE(delUrl);
      u.delete();
      confirmDfd.resolve();
      $rootScope.$apply();
      $httpBackend.flush();
    });

    describe('when the force flag is used', function() {

      it('should DELETE the user without asking for confirmation', function() {
        $httpBackend.expectDELETE(delUrl);
        u.delete(true);
        $httpBackend.flush(); 
      });
      
    });

  });

});
