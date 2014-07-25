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

describe('Directive: dtPageHref', function () {

  var element, scope, rootScope, isoScope, compile;

  beforeEach(function() {
    // define mock objects here
  });

  // load the directive's module
  beforeEach(module('app.components.directives.dtPageHref', function($provide) {
    // Inject dependencies like this:
    $provide.constant('settings', {
      pages: {
        AppInstance: '/ws/v1/applications/:appId'
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
    scope.params = {
      appId: 'application_0001'
    };
    // Define and compile the element
    element = angular.element('<a dt-page-href="AppInstance" params="params"></a>');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  afterEach(function() {
    // tear down here
  });

  it('should add an href to the element', function() {
    expect(element.attr('href')).toEqual('#/ws/v1/applications/application_0001');
  });

  it('should be able to be dynamic when params change', function() {
    scope.params.appId = 'application_0002';
    scope.$digest();
    expect(element.attr('href')).toEqual('#/ws/v1/applications/application_0002');
  });

  it('should not create an isolate scope', function() {
    expect(isoScope).toBeUndefined();
  });

});