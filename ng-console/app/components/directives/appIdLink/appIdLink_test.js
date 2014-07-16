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

describe('Directive: appIdLink', function () {

  var element, shortElement, scope, rootScope, isoScope, compile;

  beforeEach(function() {
    // define mock objects here
  });

  // load the directive's module
  beforeEach(module('app.components.directives.appIdLink', function($provide) {
    // Inject dependencies like this:
    $provide.constant('settings', {
      pages: {
        AppInstance: '/app/:appId'
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
    scope.id = 'application_001_0001';

    // Define and compile the element
    element = angular.element('<a app-id-link="id"></a>');
    shortElement = angular.element('<a app-id-link="id" short="true"></a>');
    element = compile(element)(scope);
    shortElement = compile(shortElement)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  afterEach(function() {
    // tear down here
  });

  it('should interpolate AppInstance page route for the href', function() {
    expect(element.attr('href')).toEqual('#/app/' + scope.id);
    expect(shortElement.attr('href')).toEqual('#/app/' + scope.id);
  });

  it('should put the full id in the <a> tag by default', function() {
    expect(element.text()).toEqual(scope.id);
  });

  it('should put a shortened id in the <a> tag if short="true"', function() {
    expect(shortElement.text()).toEqual('0001');
  });

});