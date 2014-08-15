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

describe('Directive: uiResizable', function () {

  var element, scope, rootScope, isoScope, compile;

  beforeEach(function() {
    // define mock objects here
  });

  // load the directive's module
  beforeEach(module('app.components.directives.uiResizable'));

  beforeEach(inject(function ($compile, $rootScope) {
    // Cache these for reuse    
    rootScope = $rootScope;
    compile = $compile;

    $.fn.resizable = function() {
      return this;      
    };

    spyOn($.fn, 'resizable').and.callThrough();

    // Set up the outer scope
    scope = $rootScope.$new();
    scope.options = {

    };
    scope.onResize = jasmine.createSpy();

    // Define and compile the element
    element = angular.element('<div ui-resizable="options" on-resize="onResize(event, ui)"></div>');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  it('should call resizable on the element', function() {
    expect($.fn.resizable).toHaveBeenCalledWith(scope.options);
  });

  it('should set an event handler on resizestop if provided in the attributes', function() {
    element.trigger('resizestop');
    scope.$digest();
    expect(scope.onResize).toHaveBeenCalled();
  });

  it('should not throw if a callback is not provided', function() {
    element = angular.element('<div ui-resizable="options"></div>');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
    expect(function() {

      element.trigger('resizestop');
      scope.$digest();  
    }).not.toThrow();
  });

});