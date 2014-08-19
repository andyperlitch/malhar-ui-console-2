/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
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

describe('Service: BaseResource', function () {

  var mockWebSocket, mockGetUri;

  // set up mock services
  beforeEach(function() {
    mockWebSocket = {
      send: function() {},
      subscribe: function() {},
      unsubscribe: function() {}
    };
    mockGetUri = {
      url: function() {
        return '/fake/end/point';
      },
      topic: function() {
        return 'fake.topic';
      }
    };
  });

  // load the service's module
  beforeEach(module('app.components.resources.BaseResource', function($provide) {
    $provide.value('webSocket', mockWebSocket);
    $provide.value('getUri', mockGetUri);
  }));

  // instantiate service
  var BaseResource, BaseModel, BaseCollection;
  beforeEach(inject(function (_BaseResource_) {
    BaseResource = _BaseResource_;
  }));

  // test backend
  var $httpBackend;

  beforeEach(inject(function(_$httpBackend_) {
    $httpBackend = _$httpBackend_;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be a function', function() {
    expect(typeof BaseResource).toEqual('function');
  });

  describe('the fetch method', function() {
      
    var C, r, reqHandler;

    beforeEach(function() {
      C = BaseResource.extend({
        set: function(data) {
          this.data = data;
        }
      });
      r = new C();
      r.url = '/my-url';
      reqHandler = $httpBackend.whenGET(/\/my\-url(\?key=value)?/);
      reqHandler.respond({});
    });

    it('should make a GET request to this.url with any passed options', function() {
      r.fetch({ params: { key: 'value' }});
      $httpBackend.expectGET('/my-url?key=value');
      $httpBackend.flush();
    });

    it('should return a promise', function() {
      var result = r.fetch({ params: { key: 'value' }});      
      $httpBackend.flush();
      expect(typeof result.then).toEqual('function');
    });

    it('should set fetching=true after it is called', function() {
      r.fetch({ params: { key: 'value' }});
      expect(r.fetching).toEqual(true);
      $httpBackend.flush();
    });

    it('should set fetching=false after the server responds', function() {
      r.fetch();
      $httpBackend.flush();
      expect(r.fetching).toEqual(false);
    });

    it('should set fetching=false after the server errors', function() {
      reqHandler.respond(404, {});
      r.fetch();
      $httpBackend.flush();
      expect(r.fetching).toEqual(false);
    });

    it('should set fetchError to response when the server errors', function() {
      reqHandler.respond(404, {});
      r.fetch();
      $httpBackend.flush();
      expect(r.fetchError).toBeDefined();
    });

    it('should reset fetchError to response when the server responds successfully', function() {
      // bad response
      reqHandler.respond(404, {});
      r.fetch();
      $httpBackend.flush();

      // good response
      reqHandler.respond({});
      r.fetch();
      $httpBackend.flush();
      expect(r.fetchError).toEqual(false);
    });

    it('should call onFetchError method when server response is bad', function() {

      // spy
      spyOn(r, 'onFetchError');

      // bad response
      reqHandler.respond(404, {});
      r.fetch();
      $httpBackend.flush();

      expect(r.onFetchError).toHaveBeenCalled();  
    });

    it('should be able to set fetchError to truthy in the transformResponse method', function() {
      r.transformResponse = function() {
        this.fetchError = true;
      };
      // good response
      reqHandler.respond({});
      r.fetch();
      $httpBackend.flush();
      expect(r.fetchError).toEqual(true);
    });

  });

});