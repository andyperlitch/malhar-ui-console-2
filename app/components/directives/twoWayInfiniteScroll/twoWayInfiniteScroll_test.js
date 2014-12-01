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

describe('Directive: twoWayInfiniteScroll', function () {

  var element, scope, $timeout, rootScope, isoScope, compile, prependDfd, appendDfd, initDfd, createElement, itemCount;

  function createItems(i, count) {
    var result = [];
    for (var k = 0; k < count; k++) {
      result.push({
        key1: 'value1-' + i,
        key2: 'value2-' + i
      });
      i++;
    }
    return result;
  }

  beforeEach(module('templates-main'));

  beforeEach(function() {
    // define mock objects here
    itemCount = 10;
  });

  // load the directive's module
  beforeEach(module('app.components.directives.twoWayInfiniteScroll'));

  beforeEach(inject(function ($compile, $rootScope, $templateCache, _$timeout_) {
    // Cache these for reuse
    rootScope = $rootScope;
    compile = $compile;
    $timeout = _$timeout_;

    // Other setup, e.g. helper functions, etc.
    $templateCache.put('my/template.html', '<div ng-repeat="(key,value) in item"><span ng-class="key">{{ value }}</span></div>');

    // Set up the outer scope
    scope = $rootScope.$new();
    scope.my = {
      prependFn: jasmine.createSpy('prependFn').and.callFake(function(dfd) {
        prependDfd = dfd;
      }),
      appendFn: jasmine.createSpy('appendFn').and.callFake(function(dfd) {
        appendDfd = dfd;
      }),
      data: [],
      initFn: jasmine.createSpy('initFn').and.callFake(function(dfd) {
        initDfd = dfd;
      }),
      options: {
        itemTemplateUrl: 'my/template.html',
        maxItems: 100
      }
    };

    // Define and compile the element
    createElement = function() {
      element = angular.element(
        '<div ' +
          'two-way-infinite-scroll="my.options" ' +
          'init="my.initFn" ' +
          'prepend="my.prependFn" ' +
          'append="my.appendFn" ' +
          'item-class="my-item" ' +
          'item-template-url="my.options.itemTemplateUrl" ' +
        '></div>');
      element = compile(element)(scope);
      scope.$digest();
      isoScope = element.isolateScope();
    };

    createElement();

  }));

  it('should start by saying loading', function() {
    expect(element.find('.reset-message').text().trim()).toEqual('loading');
  });

  it('should create its own scope', function() {
    expect(isoScope).not.toBeUndefined();
  });

  it('should call the init function', function() {
    expect(scope.my.initFn).toHaveBeenCalled();
  });

  describe('when the init function resolves the deferred', function() {
    
    beforeEach(function() {
      initDfd.resolve(createItems(1, itemCount));
      scope.$apply();
    });

    it('should have the same number of item elements as elements in the array', function() {
      expect(element.find('.my-item').length).toEqual(itemCount);
    });

    it('should use the provided template', function() {
      expect(element.find('.my-item:eq(0) .key1').text()).toEqual('value1-1');
    });

    it('should not call the append or prepend functions', function() {
      expect(scope.my.prependFn).not.toHaveBeenCalled();
      expect(scope.my.appendFn).not.toHaveBeenCalled();
    });

    describe('when the user scrolls to the top of the div', function() {
      
      beforeEach(function() {
        spyOn(element, 'scrollTop').and.callFake(function() {
          return 0;
        });
        element.trigger('scroll');
        scope.$apply();
      });

      it('should call the prependFn', function() {
        expect(scope.my.prependFn).toHaveBeenCalled();
      });

      it('should add an alert saying that content is loading', function() {
        var alert = element.find('.prepend-message');
        expect(alert.length).toEqual(1);
        expect(alert.text().trim()).toEqual('loading');
      });

      it('should not call the prepend function again if the user scrolls before the first request is resolved', function() {
        scope.my.prependFn.calls.reset();
        element.trigger('scroll');
        scope.$apply();
        expect(scope.my.prependFn).not.toHaveBeenCalled();
      });

      var stringMessageTests = function(payload, string) {
        
        return function() {
          beforeEach(function() {
            prependDfd.resolve(payload);
            scope.$apply();
          });

          it('should display a message that has the text', function() {
            var alert = element.find('.prepend-message');
            expect(alert.length).toEqual(1);
            expect(alert.text().trim()).toMatch(new RegExp(string));
          });

          it('should not change the length of the items array', function() {
            expect(isoScope.items.length).toEqual(itemCount);
          });
        };

      };

      describe('and the prepend deferred is resolved with an object only containing message key', stringMessageTests({ message: 'Reached top of stuff' }, 'Reached top of stuff'));

      describe('and the prepend deferred is resolved with a string', stringMessageTests('Reached top of stuff', 'Reached top of stuff'));

      describe('and the prepend deferred is resolved with an object containing message and timeout keys', function() {
        
        stringMessageTests({ message: 'Reached top of stuff', timeout: 5000 }, 'Reached top of stuff')();

        it('should remove the alert after the specified time', function() {
          $timeout.flush(5000);
          var alert = element.find('.prepend-message');
          expect(alert.length).toEqual(0);
        });

      });

      describe('and the prepend deferred resolves with an array', function() {
        
        beforeEach(function() {
          prependDfd.resolve(createItems(100, 10));
          scope.$apply();
          $timeout.flush(100);
        });

        it('should add those items to the internal array', function() {
          expect(isoScope.items.length).toEqual(itemCount + 10);
        });

        it('should render these items after some time for DOM dimension calculations', function() {
          expect(element.find('.my-item').length).toEqual(itemCount + 10);
        });

      });

      describe('and the prepend deferred resolves with something other than an object, string, or array', function() {
        
        it('should display numbers', function() {
          prependDfd.resolve(1234);
          scope.$apply();
          var alert = element.find('.prepend-message');
          expect(alert.length).toEqual(1);
          expect(alert.text().trim()).toMatch(new RegExp('1234'));
        });

        it('should not show an alert if it resolves with nothing', function() {
          prependDfd.resolve();
          scope.$apply();
          var alert = element.find('.prepend-message');
          expect(alert.length).toEqual(0);
        });

        it('should not show an alert if it resolves with null', function() {
          prependDfd.resolve(null);
          scope.$apply();
          var alert = element.find('.prepend-message');
          expect(alert.length).toEqual(0);
        });

        it('should not show an alert if it resolves with undefined', function() {
          prependDfd.resolve();
          scope.$apply();
          var alert = element.find('.prepend-message');
          expect(alert.length).toEqual(0);
        });

        it('should not show an alert if it resolves with false', function() {
          prependDfd.resolve(false);
          scope.$apply();
          var alert = element.find('.prepend-message');
          expect(alert.length).toEqual(0);
        });

        it('should not show an alert if it resolves with object not containing message', function() {
          prependDfd.resolve({ a: 'a', b: 'b' });
          scope.$apply();
          var alert = element.find('.prepend-message');
          expect(alert.length).toEqual(0);
        });

      });
      
      describe('and the prepend deferred rejects with a string', function() {
        
        var msg;

        beforeEach(function() {
          msg = 'Failed to get previous';
          prependDfd.reject(msg);
          scope.$apply();
        });

        it('should show an alert with the given text', function() {
          var alert = element.find('.prepend-message');
          expect(alert.length).toEqual(1);
          expect(alert.text().trim()).toEqual('Error: ' + msg);
        });

        it('should not change the length of the items array', function() {
          expect(isoScope.items.length).toEqual(itemCount);
        });

      });

      describe('and the prepend deferred rejects with an object containing a message key', function() {
        
        var msg;

        beforeEach(function() {
          msg = 'Failed to get previous';
          prependDfd.reject({ message: msg });
          scope.$apply();
        });

        it('should show an alert with the given text', function() {
          var alert = element.find('.prepend-message');
          expect(alert.length).toEqual(1);
          expect(alert.text().trim()).toEqual('Error: ' + msg);
        });

      });

      describe('and the prepend deferred rejects with an object containing message and timeout keys', function() {
        
        var msg;

        beforeEach(function() {
          msg = 'Failed to get previous';
          prependDfd.reject({ message: msg, timeout: 5000 });
          scope.$apply();
        });

        it('should show an alert with the given text', function() {
          var alert = element.find('.prepend-message');
          expect(alert.length).toEqual(1);
          expect(alert.text().trim()).toEqual('Error: ' + msg);
        });

        it('should remove the message after timeout', function() {
          $timeout.flush(5000);
          var alert = element.find('.prepend-message');
          expect(alert.length).toEqual(0);
        });

      });

    });

    describe('when the user scrolls to the bottom of the div', function() {
      
      // ISSUE TRIGGERING SCROLLING TO BOTTOM IN UNIT TESTS...
      // Uncomment and continue these tests if this issue can
      // be solved.

      // beforeEach(function() {
      //   // simulate situation where append is called
      //   spyOn(element, 'scrollTop').and.callFake(function() {
      //     return 100;
      //   });
      //   spyOn(element, 'outerHeight').and.callFake(function() {
      //     return 100;
      //   });
      //   element.trigger('scroll');
      //   scope.$apply();
      // });

      // it('should call the appendFn', function() {
      //   expect(scope.my.appendFn).toHaveBeenCalled();
      //   expect(scope.my.prependFn).not.toHaveBeenCalled();
      // });

      // it('should add an alert saying that content is loading', function() {
      //   var alert = element.find('.append-message');
      //   expect(alert.length).toEqual(1);
      //   expect(alert.text().trim()).toEqual('loading');
      // });

      // it('should not call the append function again if the user scrolls before the first request is resolved', function() {
      //   scope.my.appendFn.calls.reset();
      //   element.trigger('scroll');
      //   scope.$apply();
      //   expect(scope.my.appendFn).not.toHaveBeenCalled();
      // });

    });

  });

});