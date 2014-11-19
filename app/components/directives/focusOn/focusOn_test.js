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

describe('Directive: focusOn', function () {

  var element, scope, rootScope, isoScope, compile;

  beforeEach(function() {
    // define mock objects here
  });

  // load the directive's module
  beforeEach(module('app.components.directives.focusOn'));

  beforeEach(inject(function ($compile, $rootScope) {
    // Cache these for reuse    
    rootScope = $rootScope;
    compile = $compile;

    // Other setup, e.g. helper functions, etc.

    // Set up the outer scope
    scope = $rootScope.$new();

    // Define and compile the element
    element = angular.element('<input type="text" focus-on="awesome" />');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  it('should focus on the element when the specified event is fired', function() {
    spyOn(element[0], 'focus').and.callThrough();
    rootScope.$broadcast('awesome');
    rootScope.$digest();
    expect(element[0].focus).toHaveBeenCalled();
  });

});