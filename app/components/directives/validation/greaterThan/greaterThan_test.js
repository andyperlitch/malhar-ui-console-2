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

describe('Directive: greaterThan', function () {

  var element, scope, rootScope, isoScope, compile, form;

  beforeEach(function() {
    // define mock objects here
  });

  // load the directive's module
  beforeEach(module('app.components.directives.validation.greaterThan'));

  beforeEach(inject(function ($compile, $rootScope) {
    // Cache these for reuse    
    rootScope = $rootScope;
    compile = $compile;

    // Other setup, e.g. helper functions, etc.

    // Set up the outer scope
    scope = $rootScope.$new();
    scope.myModel = { value: 31 };
    scope.compareTo = { value: 30 };

    // Define and compile the element
    element = angular.element('<form name="form"><input type="number" name="myInput" ng-model="myModel.value" greater-than="compareTo.value"></form>');
    element = compile(element)(scope);
    scope.$digest();
    form = scope.form;
    isoScope = element.isolateScope();
  }));

  afterEach(function() {
    // tear down here
  });

  it('should pass if the model is greater than the comparing value', function() {
    form.myInput.$setViewValue(40);
    scope.$digest();
    expect(scope.myModel.value).toEqual(40);
    expect(form.myInput.$valid).toBe(true);
  });

  it('should mark as invalid if the model is less than the comparing value', function() {
    form.myInput.$setViewValue(20);
    scope.$digest();
    expect(form.myInput.$valid).toBe(false);
  });

  it('should mark as invalid if the model is equal to the comparing value', function() {
    form.myInput.$setViewValue(30);
    scope.$digest();
    expect(form.myInput.$valid).toBe(false);
  });

  it('should mark as invalid if the value being compared to changes', function() {
    scope.compareTo.value = 100;
    scope.$digest();
    expect(form.myInput.$valid).toBe(false);
  });


});