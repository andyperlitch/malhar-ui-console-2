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

describe('Directive: toggleText', function () {

  var element, scope, rootScope, isoScope, compile, str;

  beforeEach(function() {
    // define mock objects here
  });

  // load the template module
  beforeEach(module('templates-main'));

  // load the directive's module
  beforeEach(module('app.components.directives.toggleText', function($provide) {
    // Inject dependencies like this:
    $provide.value('dtText', function(key) {
      return key;
    });

  }));

  beforeEach(inject(function ($compile, $rootScope) {
    // Cache these for reuse    
    rootScope = $rootScope;
    compile = $compile;

    // Other setup, e.g. helper functions, etc.
    str = 'The quick brown fox jumped over the log, and then he found five dollars. cool story bro.';

    // Set up the outer scope
    scope = $rootScope.$new();
    scope.str = str;

    // Define and compile the element
    element = angular.element('<div toggle-text="str" threshold="37"></div>');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  it('should shorten the text to the specified number, plus a link to toggle more.', function() {
    element.find('.ng-hide').remove();
    expect(element.text().replace(/[\s\n]+/g, ' ').trim()).toEqual(str.substr(0,37) + '… more');
    expect(element.find('a[ng-click]').text()).toEqual('more');
  });

  it('should show all text when the more link is clicked', function() {
    element.find('a').eq(0).click();
    scope.$apply();
    element.find('.ng-hide').remove();
    expect(element.text().trim().replace(/[\s\n]+/g, ' ')).toEqual(str + ' less');
  });

  afterEach(function() {
    // tear down here
  });

});