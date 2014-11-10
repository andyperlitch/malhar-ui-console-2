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

describe('Factory: authentication', function () {

  var userSession, settings;

  // load the service's module
  beforeEach(module('app.components.services.authentication', function($provide) {
    $provide.constant('settings', settings = {
      urls: {
        User: '/fakeuser'
      }
    });
  }));

  // instantiate service
  var authentication;
  beforeEach(inject(function (_authentication_, _userSession_) {
    authentication = _authentication_;
    userSession = _userSession_;
    spyOn(userSession, 'create').and.callThrough();
  }));

  describe('isEnabled method', function() {
    
    it('should return true if userSession.authStatus is true OR undefined', function() {
      userSession.authStatus = undefined;
      expect(authentication.isEnabled()).toEqual(true);
      delete userSession.authStatus;
      expect(authentication.isEnabled()).toEqual(true);
      userSession.authStatus = true;
      expect(authentication.isEnabled()).toEqual(true);
    });

    it('should return false if userSession.authStatus is false', function() {
      userSession.authStatus = false;
      expect(authentication.isEnabled()).toEqual(false);
    });

  });

  describe('isAuthenticated method', function() {

    it('should return false if userSession.authStatus is false', function() {
      userSession.authStatus = false;
      expect(authentication.isAuthenticated()).toEqual(false);
    });
    
    it('should return false if userSession.authStatus is true && userSession.id and userSession.principle are not defined', function() {
      userSession.authStatus = true;
      delete userSession.id;
      delete userSession.principle;
      expect(authentication.isAuthenticated()).toEqual(false);
    });

    it('should return true if userSession.authStatus and userSession.id and userSession.principle', function() {
      userSession.authStatus = true;
      userSession.id = '1234';
      userSession.principle = 'mrbojangles';
      expect(authentication.isAuthenticated()).toEqual(true);
    });

  });

  describe('retrieveAuthStatus method', function() {
    
    // test backend
    var $httpBackend;
    
    beforeEach(inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
    }));
    
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('the general case', function() {
      
      beforeEach(function() {
        $httpBackend.whenGET(settings.urls.User).respond({});
      });

      it('should make a request to the User url from settings.urls', function() {
        authentication.retrieveAuthStatus();
        $httpBackend.expectGET(settings.urls.User);
        $httpBackend.flush();
      });

      it('should return a promise', function() {
        var result = authentication.retrieveAuthStatus();
        expect(typeof result.then).toEqual('function');
        $httpBackend.flush();
      });

    });

    describe('hasRetrievedAuthStatus helper method', function() {
      
      it('should return false if retrieveAuthStatus has not been called yet', function() {
        expect(authentication.hasRetrievedAuthStatus()).toEqual(false);  
      });

    });

    describe('when the response has no auth scheme', function() {

      beforeEach(function() {
        $httpBackend.whenGET(settings.urls.User).respond({
          'auth-scheme': ''
        });
      });
      
      it('should set authentication state as disabled', function() {
        authentication.retrieveAuthStatus();
        $httpBackend.flush();
        
        expect(authentication.isEnabled()).toEqual(false); 
      });

      it('should make hasRetrievedAuthStatus return true', function() {
        authentication.retrieveAuthStatus();
        $httpBackend.flush();
        
        expect(authentication.hasRetrievedAuthStatus()).toEqual(true);
      });

    });

    describe('when the response has auth scheme', function() {
      
      beforeEach(function() {
        $httpBackend.whenGET(settings.urls.User).respond({
          'auth-scheme': 'kerberos',
          'principle': 'mrbojangles'
        });
      });

      it('should set authentication state as enabled', function() {
        authentication.retrieveAuthStatus();
        $httpBackend.flush();
        
        expect(authentication.isEnabled()).toEqual(true);
      });

      it('should call userSession.create with the supplied values', function() {
        authentication.retrieveAuthStatus();
        $httpBackend.flush();
        
        expect(userSession.create).toHaveBeenCalled();
        expect(userSession.scheme).toEqual('kerberos');
        expect(userSession.principle).toEqual('mrbojangles');
      });

    });

    var when401or403 = function() {

      it('should set authentication state as enabled', function() {
        authentication.retrieveAuthStatus();
        $httpBackend.flush();
        
        expect(authentication.isEnabled()).toEqual(true);
      });

      it('should make hasRetrievedAuthStatus return true', function() {
        authentication.retrieveAuthStatus();
        $httpBackend.flush();
        
        expect(authentication.hasRetrievedAuthStatus()).toEqual(true);
      });

      it('user should not be authenticated', function() {
        authentication.retrieveAuthStatus();
        $httpBackend.flush();
        
        expect(authentication.isAuthenticated()).toEqual(false);
      });

      it('user should not be authenticated even if they were before', function() {
        userSession.principle = 'mrbojangles';
        userSession.scheme = 'kerberos';
        authentication.retrieveAuthStatus();
        $httpBackend.flush();
        
        expect(authentication.isAuthenticated()).toEqual(false);
      });

    };

    describe('when the response is a 401', function() {
      
      beforeEach(function() {
        $httpBackend.whenGET(settings.urls.User).respond(401, {});
      });

      when401or403();

    });

    describe('when the response is a 401', function() {
      
      beforeEach(function() {
        $httpBackend.whenGET(settings.urls.User).respond(403, {});
      });

      when401or403();

    });

    describe('when the response is an error but not from authentication', function() {
      
      beforeEach(function() {
        $httpBackend.whenGET(settings.urls.User).respond(500, { message: 'an error occurred' });
      });

      it('should reject the promise that gets returned', function() {
        var spy = jasmine.createSpy();
        var promise = authentication.retrieveAuthStatus();
        promise.catch(spy);
        $httpBackend.flush();
        expect(spy).toHaveBeenCalled();
      });

    });

  });


});