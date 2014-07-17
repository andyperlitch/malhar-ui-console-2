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

describe('Directive: dtSelect', function () {

  var element, scope, rootScope, compile;

  beforeEach(function() {
    // define mock objects here
  });

  // load templates
  beforeEach(module('templates-main', function($provide) {
  }));

  // load the directive's module
  beforeEach(module('app.components.directives.dtSelect', function($provide) {
    // Inject dependencies
  }));

  beforeEach(inject(function ($compile, $rootScope) {
    // Cache these for reuse
    rootScope = $rootScope;
    compile = $compile;

    // Other setup, e.g. helper functions, etc.

    // Set up the outer scope
    scope = $rootScope.$new();
    scope.values = ['option1', 'option2', 'option3'];
    scope.value = scope.values[0];

    // Define and compile the element
    element = angular.element('<span dt-select label="Select Title" value="value" options="values"></span>');
    element = compile(element)(scope);
    scope.$digest();
  }));

  it('should render label', function() {
    expect(element.html()).toContain('Select Title');
  });

});