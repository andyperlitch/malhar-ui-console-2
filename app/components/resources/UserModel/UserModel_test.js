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
  var url;
  beforeEach(module('app.components.resources.UserModel', function($provide) {
    $provide.value('webSocket', {
      subscribe: function() {},
      unsubscribe: function() {}
    });
    $provide.constant('settings', {
      urls: {
        User: url = '/profile/user'
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

  describe('the transformResponse method', function() {

    var u;

    beforeEach(function() {
      u = new UserModel();
    });
    
    it('should not return the raw object', function() {
      var raw = {};
      var result = u.transformResponse(raw);
      expect(raw === result).toEqual(false);
    });

    it('should change the key "auth-scheme" to "scheme"', function() {
      var raw = {
        'auth-scheme': 'kerberos',
        principle: 'mrbojangles'
      };
      var result = u.transformResponse(raw);
      expect(result.scheme).toEqual('kerberos');
      expect(result['auth-scheme']).toBeUndefined();
    });

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
      
      it('should set data.scheme to an empty string', function() {
        $httpBackend.whenGET(url).respond({
          'auth-scheme': ''
        });
        u.fetch();
        $httpBackend.flush();
        expect(u.data.scheme).toEqual('');
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

});