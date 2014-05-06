'use strict';

describe('Service: getUri', function () {

  // load the service's module
  beforeEach(module('dtConsoleApp', function($provide) {
    // Mock DtSettings
    $provide.value('DtSettings', {
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
      expect(getUri[method]).to.be.a('function');
    });
  });

  describe('the url method', function() {
    
    it('should return a string', function() {
      expect(getUri.url('Test')).to.be.a('string');
    });

    it('should use the version in DtSettings by default', function() {
      expect(getUri.url('Test')).to.equal('/ws/v8/testing/url');
    });

    it('should use the version passed in second argument object if present', function() {
      expect(getUri.url('Test', {v: 'myv'})).to.equal('/ws/myv/testing/url');
    });

    it('should use the second argument for all other parameters', function() {
      expect(getUri.url('Test2', { 'with': 'these', params: 'parameters'})).to.equal('/ws/v8/testing/these/parameters');
    });

  });

  describe('the action method', function() {
    
    it('should return a string', function() {
      expect(getUri.action('Test')).to.be.a('string');
    });

    it('should use the version in DtSettings by default', function() {
      expect(getUri.action('Test')).to.equal('/ws/v8/do/something');
    });

    it('should use the version passed in second argument object if present', function() {
      expect(getUri.action('Test', {v: 'myv'})).to.equal('/ws/myv/do/something');
    });

    it('should use the second argument for all other parameters', function() {
      expect(getUri.action('Test2', { something: 'this', params: 'that'})).to.equal('/ws/v8/do/this/with/that');
    });

  });

  describe('the topic method', function() {
    // Test: 'some.topic',
    // Test2: 'some.:param.topic'
    it('should return a string', function() {
      expect(getUri.topic('Test')).to.be.a('string');
    });

    it('should return the topic specified', function() {
      expect(getUri.topic('Test')).to.equal('some.topic');
    });

    it('should interpolate given parameters', function() {
      expect(getUri.topic('Test2', {param: 'xyz'})).to.equal('some.xyz.topic');
    });

  });

});