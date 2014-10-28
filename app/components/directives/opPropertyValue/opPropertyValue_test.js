'use strict';

describe('Directive: opPropertyValue', function () {

  var scope, rootScope, isoScope, compile;

  beforeEach(function() {
    // define mock objects here
  });

  // load the template module
  beforeEach(module('templates-main'));

  // load the directive's module
  beforeEach(module('app.components.directives.opPropertyValue', function($provide) {
    // Inject dependencies like this:
    $provide.value('dtText', {
      get: function(key) {
        return key + '!';
      }
    });

  }));

  beforeEach(inject(function ($compile, $rootScope) {
    // Cache these for reuse    
    rootScope = $rootScope;
    compile = $compile;

    // Other setup, e.g. helper functions, etc.

    // Set up the outer scope
    scope = $rootScope.$new();
    scope.shortStr = {
      name: 'shortStr',
      value: 'A short value'
    };
    scope.number = {
      name: 'number',
      value: 1234
    }
    scope.longStr = {
      name: 'longStr',
      value:'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod' + 
            'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,' +
            'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo' +
            'consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse' +
            'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non' +
            'proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    };
    scope.smallObj = {
      name: 'smallObj',
      value: {
        ima: 'small object'
      }
    };

    scope.largeObj = {
      name: 'obj',
      value: {
        some: {
          nested: [
            'json',
            'structure'
          ]
        },
        con: {
          muchos: '...',
          muchisimos: '...',
          cosas: [
            1,
            2,
            3,
            4
          ]
        }
      }
    };
  }));

  describe('when the value is a short string', function() {
    
    var element;

    beforeEach(function() {
      // Define and compile the element
      element = angular.element('<op-property-value name="shortStr.name" value="shortStr.value"></op-property-value>');
      element = compile(element)(scope);
      scope.$digest();
      isoScope = element.isolateScope();
    });

    it('should replace the element with a span containing the property value', function() {
      var tagName = (element[0].tagName).toLowerCase();
      expect(tagName).toBe('span');
    });

    it('should have the text of the property value', function() {
      expect(element.text().trim()).toEqual('A short value');
    });

  });

  describe('when the value is a number', function() {
    var element;

    beforeEach(function() {
      // Define and compile the element
      element = angular.element('<op-property-value name="number.name" value="number.value"></op-property-value>');
      element = compile(element)(scope);
      scope.$digest();
      isoScope = element.isolateScope();
    });

    it('should replace the element with a span containing the property value', function() {
      var tagName = (element[0].tagName).toLowerCase();
      expect(tagName).toBe('span');
    });

    it('should have the text of the property value', function() {
      expect(element.text() * 1).toEqual(1234);
    });

  });

  describe('when the value is a long string', function() {
    
    var element;

    beforeEach(function() {
      // Define and compile the element
      element = angular.element('<op-property-value name="longStr.name" value="longStr.value"></op-property-value>');
      element = compile(element)(scope);
      scope.$digest();
      isoScope = element.isolateScope();
    });

    it('should replace the element with a span containing text and a link', function() {
      expect(element.find('[view-raw-in-modal]').length).toEqual(1);
    });

    it('should have text in the link from dtText.get("view")', function() {
      expect(element.find('[view-raw-in-modal]').text()).toEqual('view!');
    });

  });

  describe('when the value is a small object', function() {

    var element;

    beforeEach(function() {
      // Define and compile the element
      element = angular.element('<op-property-value name="smallObj.name" value="smallObj.value"></op-property-value>');
      element = compile(element)(scope);
      scope.$digest();
      isoScope = element.isolateScope();
    });

    it('should have the text of the JSON.stringify\'ed object', function() {
      expect(element.text().trim()).toEqual(JSON.stringify(scope.smallObj.value));
    });
    
  });

});