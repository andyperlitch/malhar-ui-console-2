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

describe('Module: text-directives', function () {

  var element, scope, rootScope, isoScope, compile, mockText;

  // load the directive's module
  beforeEach(module('app.components.directives.dtText', function($provide) {

    mockText = {
      get: function(key) {
        return key + ' some text';
      }
    };

    // Inject dependencies like this:
    $provide.value('dtText', mockText);

  }));

  describe('Directive: dtText', function() {

    beforeEach(inject(function ($compile, $rootScope) {
      // Cache these for reuse    
      rootScope = $rootScope;
      compile = $compile;

      // Set up the outer scope
      scope = $rootScope.$new();

      // Define and compile the element
      element = angular.element('<div dt-text="this is"></div>');
      element = compile(element)(scope);
      scope.$digest();
      isoScope = element.isolateScope();
    }));

    it('should fill the text of the element with what is returned by the get function', function() {
      expect(element.text()).toEqual('this is some text');
    });

    it('should not have an isoScope', function() {
      expect(isoScope).toBeUndefined();
    });

    describe('when there is no value in the attribute', function() {
      
      it('should take the element.text() as the value', function() {
        element = angular.element('<div dt-text>this is</div>');
        element = compile(element)(scope);
        scope.$digest();
        expect(element.text()).toEqual('this is some text');
      });

    });

  });

  describe('Directive: dtTextTitle', function () {

    beforeEach(inject(function ($compile, $rootScope) {
      // Cache these for reuse    
      rootScope = $rootScope;
      compile = $compile;

      // Other setup, e.g. helper functions, etc.

      // Set up the outer scope
      scope = $rootScope.$new();

      // Define and compile the element
      element = angular.element('<div dt-text-title="how about"></div>');
      element = compile(element)(scope);
      scope.$digest();
      isoScope = element.isolateScope();
    }));

    it('should fill the title attribute of the element with the text returned by the get function', function() {
      expect(element.attr('title')).toEqual('how about some text');
    });

    it('should not have an isoScope', function() {
      expect(isoScope).toBeUndefined();
    });

  });

  describe('Directive: dtTextTooltip', function() {
    
    beforeEach(inject(function ($compile, $rootScope) {
      // Cache these for reuse    
      rootScope = $rootScope;
      compile = $compile;

      // Other setup, e.g. helper functions, etc.

      // Set up the outer scope
      scope = $rootScope.$new();

      // Define and compile the element
      element = angular.element('<div dt-text-tooltip="how about"></div>');
      element = compile(element)(scope);
      scope.$digest();
      isoScope = element.isolateScope();
    }));

    it('should remove the dt-text-tooltip attribute', function() {
      expect(element.attr('dt-text-tooltip')).toBeFalsy();
    });

    it('should add the tooltip directive', function() {
      expect(element.attr('tooltip')).toBeTruthy();
    });

  });

});