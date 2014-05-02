'use strict';

describe('Directive: dtOverview', function () {

  // load the directive's module
  beforeEach(module('dtConsoleApp'));

  var element,
    scope,
    isoScope;

  // returns nth overview-item
  function getNth(n) {
    return element.find('.overview-item:eq('+n+')');
  }

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
    scope.myFields = [
      {
        key: 'metric1'
      },
      {
        key: 'metric2',
        label: 'Metric 2'
      },
      {
        key: 'metric3',
        value: function(value, obj) {
          return (value + '').toUpperCase();
        }
      },
      {
        key: 'metric4',
        label: 'Metric 4',
        value: function(value, obj) {
          return obj.metric1 + ' ' + value;
        }
      },
      {
        key: 'timestamp',
        label: 'The Year',
        filter: 'date'
      },
      {
        key: 'timestamp',
        label: 'Actual Year',
        filter: 'date',
        filterArgs: ['yyyy']
      },
      {
        key: 'special'
      },
      {
        key: 'special',
        trustAsHtml: true
      }
    ];
    scope.myData = {
      metric1: 100,
      metric2: 200,
      metric3: 'three hundred',
      metric4: '$',
      timestamp: Date.now(),
      special: '<div>hello</div>'
    };
    
    element = angular.element('<div dt-overview fields="myFields" data="myData"></div>');
    element = $compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();

  }));

  describe('the isolate scope', function() {
    
    it('should have a printLabel function', function() {
      expect(isoScope.printLabel).to.be.a('function');
    });

    describe('the printLabel function', function() {

      var fn;

      beforeEach(function() {
        fn = isoScope.printLabel;
      });

      it('should return the key if label not present', function() {
        expect(fn(scope.myFields[0])).to.equal('metric1');
      });

      it('should put the label in the .key element if present', function() {
        expect(fn(scope.myFields[1])).to.equal('Metric 2');
      });

    });

    it('should have a printValue function', function() {
      expect(isoScope.printValue).to.be.a('function');
    });

    describe('the printValue function', function() {
      
      var fn;

      function printV(n) {
        return fn(scope.myFields[n],scope.myData);
      }

      beforeEach(function() {
        fn = isoScope.printValue;
      });

      it('should return data[key] by default', function() {
        expect(printV(0)).to.equal(100);
      });

      it('should evaluate the value function if present', function() {
        expect(printV(2)).to.equal('THREE HUNDRED');
      });

      it('should check for a specified filter to use', function() {
        var y = (new Date()).getFullYear();
        var computed = printV(4);
        var date = new Date(computed);
        expect(date.getFullYear()).to.equal(y);
      });

      it('should pass in additional filter arguments', function() {
        var y = (new Date()).getFullYear();
        var computed = printV(5);
        expect(computed).to.equal(y + '');
      });

      it('should encode htmlentities when trustAsHtml is not set to true', function() {
        var computed = element.find('.overview-item > div.value:eq(6)').html();
        expect(computed).to.equal('&lt;div&gt;hello&lt;/div&gt;');
      });

      it('should NOT encode htmlentities when trustAsHtml is set to true', function() {
        var computed = element.find('.overview-item > div.value:eq(7)').html();
        expect(computed).to.equal('<div>hello</div>');
      });

    });

  });

  describe('a div.overview-item', function() {
    
    it('should have as many .overview-items as fields', function () {
      expect(element.find('.overview-item').length).to.equal(scope.myFields.length);
    });

    it('should have a div.key and div.value element', function() {
      var keys = element.find('.overview-item > div.key');
      var values = element.find('.overview-item > div.value');
      expect(keys.length).to.equal(scope.myFields.length);
      expect(values.length).to.equal(scope.myFields.length);
    });

    it('should use printLabel for div.key text', function() {
      isoScope.printLabel = function() { return 'charles mingus'; };
      scope.$digest();
      element.find('.overview-item > div.key').each(function(i, el) {
        expect(this.innerHTML).to.equal('charles mingus');
      });
    });

    it('should use printValue for div.value text', function() {
      isoScope.printValue = function() { return 'john coltrane'; };
      scope.$digest();
      element.find('.overview-item > div.value').each(function(i, el) {
        expect(this.innerHTML).to.equal('john coltrane');
      });
    });

  });

  

});
