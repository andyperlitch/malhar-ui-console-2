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

/* global describe, before, beforeEach, after, afterEach, inject, it, expect, module */

'use strict';

describe('Directive: logicalOperatorStatus', function () {

  var element, scope, rootScope, isoScope, compile;

  beforeEach(module('templates-main'));

  beforeEach(function() {
    // define mock objects here
  });

  // load the directive's module
  beforeEach(module('app.components.directives.logicalOperatorStatus', function($provide) {
    // Inject dependencies like this:
    // $provide.value('', mockThing);

  }));

  beforeEach(inject(function ($compile, $rootScope) {
    // Cache these for reuse
    rootScope = $rootScope;
    compile = $compile;

    // Other setup, e.g. helper functions, etc.

    // Set up the outer scope
    scope = $rootScope.$new();
    scope.statuses = {
      ACTIVE: 3,
      PENDING_DEPLOY: 1,
      INACTIVE: 2
    };

    // Define and compile the element
    element = angular.element('<div logical-operator-status="statuses"></div>');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  afterEach(function() {
    // tear down here
  });

  it('should have a span.status-* for each key in the statuses object', function() {
    expect(element.find('span.status-active').length).toEqual(1);
    expect(element.find('span.status-pending_deploy').length).toEqual(1);
    expect(element.find('span.status-inactive').length).toEqual(1);
  });

  it('should split each status with a comma', function() {
    expect(element.text()).toMatch(/\d,\d,\d/);
  });

});