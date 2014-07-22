'use strict';

describe('Directive: dtText', function () {

  var element, scope, rootScope, isoScope, compile, sandbox, mockText, trgText, srcText;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    
    // define mock objects here
  });

  // load the directive's module
  beforeEach(module('dtConsoleApp', function($provide) {

    mockText = {
      get: function(key) {}
    };

    // Inject dependencies like this:
    $provide.value('DtText', mockText);

  }));

  beforeEach(inject(function ($compile, $rootScope) {
    // Cache these for reuse    
    rootScope = $rootScope;
    compile = $compile;

    // Other setup, e.g. helper functions, etc.
    trgText = 'target text to show';
    sandbox.stub(mockText, 'get', function() {
      return trgText;
    });

    // Set up the outer scope
    scope = $rootScope.$new();

    // Define and compile the element
    srcText = 'This is some test text';
    element = angular.element('<div dt-text="' + srcText + '"></div>');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('should insert a response from DtText.get(value)', function() {
    expect(element.text()).to.equal(trgText);
  });

  it('should call DtText.get with key as attribute value', function() {
    expect(mockText.get.getCall(0).args[0]).to.equal(srcText);
  });

});