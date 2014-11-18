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

describe('Factory: newUserModal', function () {

  var $modal, $q, $timeout, modalOptions, mInstance, $rootScope, resultDfd, openedDfd, roles, users;

  // load the service's module
  beforeEach(module('app.pages.config.authManagement.newUserModal', function($provide) {
    $provide.value('$modal', $modal = {
      open: jasmine.createSpy('open').and.callFake(function(options) {
        modalOptions = options;
        return mInstance;
      })
    });
  }));

  // instantiate service
  var newUserModal;
  beforeEach(inject(function (_newUserModal_, _$q_, _$rootScope_, _$timeout_) {
    $timeout = _$timeout_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    newUserModal = _newUserModal_;
    resultDfd = $q.defer();
    openedDfd = $q.defer();
    mInstance = {
      result: resultDfd.promise,
      opened: openedDfd.promise
    };
    users = {};
    roles = {};
  }));

  it('should be a function', function() {
    expect(typeof newUserModal).toEqual('function');
  });

  it('should call $modal.open', function() {
    newUserModal(roles);
    expect($modal.open).toHaveBeenCalled();
  });

  it('should pass users and roles in the resolve block', function() {
    newUserModal(users, roles);
    expect(modalOptions.resolve.roles()).toEqual(roles);
    expect(modalOptions.resolve.users()).toEqual(users);
  });

  it('should return the result promise', function() {
    expect(newUserModal(users, roles)).toEqual(resultDfd.promise);
  });

  it('should broadcast newUserModalOpened event', function() {
    var scope = $rootScope.$new();
    var openListener = jasmine.createSpy('openListener');
    scope.$on('newUserModalOpened', openListener);
    newUserModal(users, roles);
    openedDfd.resolve();
    scope.$apply();
    $timeout.flush();
    expect(openListener).toHaveBeenCalled();
  });

});

describe('Controller: newUserModalController', function() {

    var $scope, users, roles, UserModel, modelAttrs, createDfd;
    
    beforeEach(module('app.pages.config.authManagement.newUserModal'));

    beforeEach(inject(function($rootScope, $controller, $q){
      createDfd = $q.defer();
      UserModel = function() {};
      UserModel.prototype = {
        set: jasmine.createSpy('set').and.callFake(function(attrs) {
          modelAttrs = attrs;
          return this;
        }),
        create: jasmine.createSpy('create').and.callFake(function() {
          return createDfd.promise;
        })
      };
      $scope = $rootScope.$new();
      $controller('newUserModalController', {
        $scope: $scope,
        users: users = {},
        roles: roles = {},
        UserModel: UserModel
      });
    }));

    it('should create a new UserModel and set it to newUser on the scope', function() {
      expect($scope.newUser instanceof UserModel).toEqual(true);
    });

    it('should set users to the scope', function() {
      expect($scope.users === users).toEqual(true);
    });

    it('should set roles to the scope', function() {
      expect($scope.roles === roles).toEqual(true);
    });

    describe('the create method', function() {
      
      it('should be a function', function() {
        expect(typeof $scope.create).toEqual('function');
      });

      it('should call create on second param object', function() {
        var model;
        $scope.create({}, model = new UserModel());
        expect(model.create).toHaveBeenCalled();
      });

      it('should clear any previous createError on the scope', function() {
        $scope.createError = {};
        $scope.create({}, new UserModel());
        expect(!!$scope.createError).toEqual(false);
      });

      it('should call $close on the scope when the save promise resolves', function() {
        $scope.create({}, new UserModel());
        $scope.$close = jasmine.createSpy('close');
        createDfd.resolve();
        $scope.$apply();
        expect($scope.$close).toHaveBeenCalled();
      });

      it('should set saveError to the statusText of the response when the save promise rejects', function() {
        $scope.create({}, new UserModel());
        $scope.$close = jasmine.createSpy('close');
        createDfd.reject({
          statusText: 'Errorz'
        });
        $scope.$apply();
        expect($scope.createError).toEqual('Errorz');

      });

    });

});