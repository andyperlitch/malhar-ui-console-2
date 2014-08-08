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

describe('Directive: containerLogsDropdown', function () {

  var element, scope, rootScope, isoScope, compile, myContainerLogs;

  beforeEach(function() {
    // define mock objects here
  });

  // load the template module
  beforeEach(module('templates-main'));

  // load the directive's module
  beforeEach(module('app.components.directives.containerLogsDropdown', function($provide) {
    // Inject dependencies like this:
    $provide.value('dtText', {
      get: function(key) {
        return key;
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
    myContainerLogs = scope.myContainerLogs = {
      fetching: false,
      data: [],
      containerId: 'ctnr1',
      appId: 'app1'
    };

    // Define and compile the element
    element = angular.element('<ul container-logs-dropdown="myContainerLogs"></ul>');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  afterEach(function() {
    // tear down here
  });

  it('should have a list item saying loading when fetching is true', function() {
    myContainerLogs.fetching = true;
    scope.$apply();
    expect(element.find('li').length).toEqual(1);
    expect($.trim(element.find('li').text())).toEqual('loading');
  });

  it('should have the same number of list items for the number of logs found', function() {
    var newData = myContainerLogs.data = [
      { length: 10000, name: 'dt.log' },
      { length: 10000, name: 'dt.log.2' },
      { length: 10000, name: 'stdout' },
      { length: 10000, name: 'stderr' }
    ];
    scope.$apply();
    expect(element.find('li').length).toEqual(newData.length);
    expect(element.find('li a').length).toEqual(newData.length);
  });

  it('should show an error message if fetching is false and fetchError is truthy', function() {
    myContainerLogs.fetchError = {};
    scope.$apply();
    expect(element.find('li').length).toEqual(1);
    expect($.trim(element.find('li').text())).toEqual('failed to load logs');
  });

});