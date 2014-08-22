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

describe('Directive: dtBreadcrumbCollection', function () {

  var element, scope, rootScope, isoScope, compile, mocks, collectionOptions;

  // load the template module
  beforeEach(module('templates-main'));

  beforeEach(function() {
    mocks = {};
    mocks.BudgieCollection = function(options) {
      collectionOptions = options;
    };
    mocks.BudgieCollection.prototype = {
      fetch: function() {

      }
    };
    spyOn(mocks, 'BudgieCollection').and.callThrough();
  });

  // load the directive's module
  beforeEach(module('app.components.directives.dtBreadcrumbCollection', function($provide) {
    // Inject dependencies like this:
    $provide.value('BudgieCollection', mocks.BudgieCollection);
    $provide.value('dtText', {
      get: function(key) {
        return '!' + key + '!';
      }
    });
    $provide.value('settings', {
      pages: {
        Budgie: '/budgie/:id/subs/:sub'
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
    scope.myCollection = {
      label: 'budgies',
      resource: 'BudgieCollection',
      resourceParams: ['myId'],
      dtPage: 'Budgie',
      dtPageParams: {
        id: 'myId',
        sub: 'mySubId'
      }
    };
    scope.routeParams = {
      myId: '123',
      mySubId: '456',
      myThirdId: '789'
    };

    // Define and compile the element
    element = angular.element('<span dt-breadcrumb-collection="myCollection" route-params="routeParams"></span>');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  afterEach(function() {
    // tear down here
  });

  it('should create a .btn-group', function() {
    expect(element.find('.btn-group').length).toEqual(1);
  });

  it('should create a new resource', function() {
    expect(mocks.BudgieCollection).toHaveBeenCalled();
  });

  it('should pass the options specified by resourceParams', function() {
    expect(collectionOptions).toEqual({ myId: '123' });
  });

  it('should put collection.label into the button dropdown', function() {
    expect($.trim(element.find('.dropdown-toggle').text())).toEqual('budgies');
  });

  describe('when the dropdown is clicked', function() {

    beforeEach(function() {
      mocks.BudgieCollection.prototype.fetch = function() {
        isoScope.resource.fetching = true;
      };
      spyOn(mocks.BudgieCollection.prototype, 'fetch').and.callThrough();
      element.find('.dropdown-toggle').trigger('click');
      scope.$digest();
    });

    it('should call fetch on the resource when the .dropdown-toggle button is clicked', function() {
      expect(mocks.BudgieCollection.prototype.fetch).toHaveBeenCalled();
    });

    it('should say loading in the menu while the resource is fetching', function() {
      expect($.trim(element.find('.dropdown-menu li').text())).toEqual('!loading...!');
    });

  });

  describe('the pick function', function() {
    
    it('should be a function', function() {
      expect(typeof isoScope.pick).toEqual('function');
    });

    it('should create a new object extracted from the first arg, specified by second arg', function() {
      var result = isoScope.pick({ id: '123', name: 'andy', foo: 'bar' }, { appId: 'id', appName: 'name' });
      expect(result).toEqual({ appId: '123', appName: 'andy' });
    });

  });

});