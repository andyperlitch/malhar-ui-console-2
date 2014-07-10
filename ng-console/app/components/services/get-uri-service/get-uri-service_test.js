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

describe('Service: getUri', function () {

  // load the service's module
  beforeEach(module('dtConsole.getUri', function($provide) {
    // Mock DtSettings
    $provide.constant('settings', {
      GATEWAY_API_VERSION: 'v8',
      urls: {
        Test: '/ws/:v/testing/url',
        Test2: '/ws/:v/testing/:with/:params'
      },
      actions: {
        Test: '/ws/:v/do/something',
        Test2: '/ws/:v/do/:something/with/:params'
      },
      topics: {
        Test: 'some.topic',
        Test2: 'some.:param.topic'
      }
    });

  }));

  // instantiate service
  var getUri;
  beforeEach(inject(function (_getUri_) {
    getUri = _getUri_;
  }));

  it('should have url, action, and topic methods', function() {
    ['url', 'action', 'topic'].forEach(function(method) {
      expect(typeof getUri[method]).toEqual('function');
    });
  });

  describe('the url method', function() {
    
    it('should return a string', function() {
      expect(typeof getUri.url('Test')).toEqual('string');
    });

    it('should use the version in DtSettings by default', function() {
      expect(getUri.url('Test') === '/ws/v8/testing/url').toEqual(true);
    });

    it('should use the version passed in second argument object if present', function() {
      expect(getUri.url('Test', {v: 'myv'}) === '/ws/myv/testing/url').toEqual(true);
    });

    it('should use the second argument for all other parameters', function() {
      expect(getUri.url('Test2', { 'with': 'these', params: 'parameters'}) === '/ws/v8/testing/these/parameters').toEqual(true);
    });

  });

  describe('the action method', function() {
    
    it('should return a string', function() {
      expect(typeof getUri.action('Test')).toEqual('string');
    });

    it('should use the version in DtSettings by default', function() {
      expect(getUri.action('Test') === '/ws/v8/do/something').toEqual(true);
    });

    it('should use the version passed in second argument object if present', function() {
      expect(getUri.action('Test', {v: 'myv'}) === '/ws/myv/do/something').toEqual(true);
    });

    it('should use the second argument for all other parameters', function() {
      expect(getUri.action('Test2', { something: 'this', params: 'that'}) === '/ws/v8/do/this/with/that').toEqual(true);
    });

  });

  describe('the topic method', function() {
    // Test: 'some.topic',
    // Test2: 'some.:param.topic'
    it('should return a string', function() {
      expect(typeof getUri.topic('Test')).toEqual('string');
    });

    it('should return the topic specified', function() {
      expect(getUri.topic('Test') === 'some.topic').toEqual(true);
    });

    it('should interpolate given parameters', function() {
      expect(getUri.topic('Test2', {param: 'xyz'}) === 'some.xyz.topic').toEqual(true);
    });

  });

});