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

  var userSession;

  // load the service's module
  beforeEach(module('app.components.services.authentication', function($provide) {
    $provide.value('userSession', userSession = {
      data: {}
    });
    $provide.value('webSocket', {});
  }));

  // instantiate service
  var authentication, $q, $rootScope;
  beforeEach(inject(function (_authentication_, _$q_, _$rootScope_) {
    authentication = _authentication_;
    $q = _$q_;
    $rootScope = _$rootScope_;
  }));

  var dfd;

  beforeEach(function() {
    dfd = $q.defer();

    userSession.fetch = function() {
      return dfd.promise;
    };
    spyOn(userSession, 'fetch').and.callThrough();
  });

  it('should assume auth is enabled by default', function() {
    expect(authentication.isEnabled()).toEqual(true);
  });

  describe('isAuthenticated method', function() {

    it('should return false if auth is disabled', function() {
      authentication.isEnabled = function() {
        return false;
      };
      expect(authentication.isAuthenticated()).toEqual(false);
    });
    
    it('should return false if userSession.authStatus is true && userSession.data.authScheme and userSession.data.principal are not defined', function() {
      authentication.isEnabled = function() {
        return true;
      };
      delete userSession.data.authScheme;
      delete userSession.data.principal;
      expect(authentication.isAuthenticated()).toEqual(false);
    });

    it('should return true if userSession.authStatus and userSession.data.authScheme and userSession.data.principal', function() {
      authentication.isEnabled = function() {
        return true;
      };
      userSession.data.authScheme = 'kerberos';
      userSession.data.principal = 'mrbojangles';
      expect(authentication.isAuthenticated()).toEqual(true);
    });

  });

  describe('retrieveAuthStatus method', function() {

    it('should call userSession.fetch', function() {
      authentication.retrieveAuthStatus();
      expect(userSession.fetch).toHaveBeenCalled();
    });

    it('should return a promise', function() {
      var result = authentication.retrieveAuthStatus();
      expect(typeof result.then).toEqual('function');
    });

    describe('when fetch is successful', function() {

      it('should mark auth as enabled if userSession.data.authScheme is truthy', function() {
        authentication.retrieveAuthStatus();
        userSession.data.authScheme = 'kerberos';
        dfd.resolve({
          status: status
        });
        $rootScope.$apply();
        expect(authentication.isEnabled()).toEqual(true);
      });

      it('should mark auth as disabled if userSession.data.authScheme is falsey', function() {
        authentication.retrieveAuthStatus();
        userSession.data.authScheme = '';
        dfd.resolve({
          status: status
        });
        $rootScope.$apply();
        expect(authentication.isEnabled()).toEqual(false);
      });
      
    });

    var when401or403 = function(status) {

      it('should set authentication state as enabled', function() {
        authentication.retrieveAuthStatus();
        dfd.reject({
          status: status
        });
        $rootScope.$apply();
        expect(authentication.isEnabled()).toEqual(true);
      });

      it('should make hasRetrievedAuthStatus return true', function() {
        authentication.retrieveAuthStatus();
        dfd.reject({
          status: status
        });
        $rootScope.$apply();
        expect(authentication.hasRetrievedAuthStatus()).toEqual(true);
      });

      it('user should not be authenticated', function() {
        authentication.retrieveAuthStatus();
        dfd.reject({
          status: status
        });
        $rootScope.$apply();
        expect(authentication.isAuthenticated()).toEqual(false);
      });

      it('should still resolve the promise returned', function() {
        var promise = authentication.retrieveAuthStatus();
        var spy = jasmine.createSpy();
        promise.then(spy);
        dfd.reject({
          status: status
        });
        $rootScope.$apply();
        expect(spy).toHaveBeenCalled();
      });

    };

    describe('when the response is a 401', function() {
      when401or403(401);
    });

    describe('when the response is a 403', function() {
      when401or403(403);
    });

    describe('when the response is an error but not from authentication', function() {

      it('should reject the promise that gets returned', function() {
        var spy = jasmine.createSpy();
        var promise = authentication.retrieveAuthStatus();
        promise.catch(spy);
        dfd.reject({
          status: 500
        });
        $rootScope.$apply();
        expect(spy).toHaveBeenCalled();
      });

    });

  });

  describe('hasRetrievedAuthStatus helper method', function() {
      
    describe('when retrieveAuthStatus has not been called', function() {
      it('should return false if retrieveAuthStatus has not been called yet', function() {
        expect(authentication.hasRetrievedAuthStatus()).toEqual(false);  
      });
    });

    describe('when retrieveAuthStatus has been called', function() {

      beforeEach(function() {
        authentication.retrieveAuthStatus();
      });
      
      describe('and the promise has not been resolved', function() {
        
        it('should return false', function() {
          expect(authentication.hasRetrievedAuthStatus()).toEqual(false);
        });

      });

      describe('and the promise has been resolved', function() {
        
        beforeEach(function() {
          dfd.resolve();
        });

        it('should return true', function() {
          $rootScope.$apply();
          expect(authentication.hasRetrievedAuthStatus()).toEqual(true);
        });

      });

      describe('and the promise has been rejected', function() {
        
        beforeEach(function() {
          dfd.reject({
            status: 501
          });
        });

        it('should return true', function() {
          $rootScope.$apply();
          expect(authentication.hasRetrievedAuthStatus()).toEqual(true);
        });

      });

    });

  });

});