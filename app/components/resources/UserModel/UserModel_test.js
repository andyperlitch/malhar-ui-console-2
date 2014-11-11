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
  var url, loginUrl;
  beforeEach(module('app.components.resources.UserModel', function($provide) {
    $provide.value('webSocket', {
      subscribe: function() {},
      unsubscribe: function() {}
    });
    $provide.constant('settings', {
      urls: {
        User: url = '/profile/user'
      },
      actions: {
        login: loginUrl = '/login'
      }
    });
  }));

  // instantiate service
  var UserModel;
  beforeEach(inject(function (_UserModel_) {
    UserModel = _UserModel_;
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
          u.data = { scheme: 'kerberos', principle: 'mrbojangles' };
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
          u.data = { scheme: 'kerberos', principle: 'mrbojangles' };
          $httpBackend.whenGET(url).respond(500, {
            message: 'unauthenticated'
          });
          u.fetch();
          $httpBackend.flush();
          expect(u.data).toEqual({ scheme: 'kerberos', principle: 'mrbojangles' });
      });

    });

  });

  describe('the login method', function() {
    
    // test backend
    var u, $httpBackend;
    
    beforeEach(inject(function(_$httpBackend_) {
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
      
      it('should call the set method with the server response', function() {
        $httpBackend.whenPOST(loginUrl).respond(200, {
          authScheme: 'kerberos',
          principal: 'mrbojangles'
        });
        u.login('mrbojangles', 'admin');
        $httpBackend.flush();
      });

    });

  });

});