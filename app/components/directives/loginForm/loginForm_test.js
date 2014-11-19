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

describe('Directive: loginForm', function () {

  var element, scope, rootScope, isoScope, compile, currentUser, q, loginDfd;

  beforeEach(function() {
    // define mock objects here
  });

  beforeEach(module('templates-main'));

  // load the directive's module
  beforeEach(module('app.components.directives.loginForm', function($provide) {
    // Inject dependencies like this:
    $provide.value('currentUser', currentUser = {});

  }));

  beforeEach(inject(function ($compile, $rootScope, $q) {
    // Cache these for reuse    
    rootScope = $rootScope;
    compile = $compile;
    q = $q;

    // Other setup, e.g. helper functions, etc.
    loginDfd = q.defer();
    currentUser.login = jasmine.createSpy('login').and.callFake(function() {
      return loginDfd.promise;
    });

    // Set up the outer scope
    scope = $rootScope.$new();
    scope.onSuccess = jasmine.createSpy('onSuccess');

    // Define and compile the element
    element = angular.element('<div login-form on-success="onSuccess"></div>');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  it('should have two inputs, one text and one password', function() {
    expect(element.find('input[type="text"]').length).toEqual(1);
    expect(element.find('input[type="password"]').length).toEqual(1);
  });

  it('should include the title by default', function() {
    expect(element.find('h3').length).toEqual(1);
  });

  it('should omit the title if the omitTitle attribute is set to true', function() {
    element = angular.element('<div login-form on-success="onSuccess" omit-title="true"></div>');
    element = compile(element)(scope);
    scope.$digest();
    expect(element.find('h3').length).toEqual(0);
  });

  describe('the login method', function() {
    
    it('should set the attemptingLogin flag to true and loginError flag to null', function() {
      isoScope.login({
        userName: 'username',
        password: 'password'
      });
      expect(isoScope.attemptingLogin).toEqual(true);
      expect(isoScope.loginError).toEqual(null);
    });

    it('should call the currentUser.login method with the username and password in the passed object', function() {
      isoScope.login({
        userName: 'mrbojangles',
        password: 'kitty'
      });
      expect(currentUser.login).toHaveBeenCalledWith('mrbojangles', 'kitty');
    });

    describe('when currentUser.login resolves', function() {
      
      beforeEach(function() {
        isoScope.login({
          userName: 'username',
          password: 'password'
        });
        loginDfd.resolve();
        scope.$digest();
      });

      it('should call the on-success function', function() {
        expect(scope.onSuccess).toHaveBeenCalled();     
      });

      it('should set attemptingLogin to false', function() {
        expect(isoScope.attemptingLogin).toEqual(false);
      });

    });

    describe('when the currentUser.login rejects', function() {
      
      beforeEach(function() {
        isoScope.login({
          userName: 'username',
          password: 'password'
        });
        loginDfd.reject();
        scope.$digest();
      });

      it('should set loginError on the isolate scope', function() {
        expect(isoScope.loginError).toBeTruthy();
      });

      it('should set attemptingLogin to false', function() {
        expect(isoScope.attemptingLogin).toEqual(false);
      });

    });

  });

});