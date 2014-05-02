'use strict';

describe('Service: getUri', function () {

  // load the service's module
  beforeEach(module('dtConsoleApp', function($provide) {
    // Mock dtSettings
    $provide.value('dtSettings', {
      version: 'v8',
      urls: {
        Test: '/ws/{{v}}/testing/url',
        Test2: '/ws/{{v}}/testing/{{with}}/{{params}}'
      },
      actions: {
        Test: '/ws/{{v}}/do/something',
        Test2: '/ws/{{v}}/do/{{something}}/with/{{params}}'
      },
      topics: {
        Test: 'some.topic',
        Test2: 'some.{{param}}.topic'
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

    it('should use the version in dtSettings by default', function() {
      expect(getUri.url('Test')).to.equal('/ws/v8/testing/url');
    });

    it('should use the version passed in second argument object if present', function() {
      expect(getUri.url('Test', {v: 'myv'})).to.equal('/ws/myv/testing/url');
    });

  });

});