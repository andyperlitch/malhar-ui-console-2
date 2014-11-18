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

describe('Factory: newRoleModal', function () {

  var $modal, $q, $timeout, modalOptions, mInstance, $rootScope, resultDfd, openedDfd, roles;

  // load the service's module
  beforeEach(module('app.pages.config.authManagement.newRoleModal', function($provide) {
    $provide.value('$modal', $modal = {
      open: jasmine.createSpy('open').and.callFake(function(options) {
        modalOptions = options;
        return mInstance;
      })
    });
  }));

  // instantiate service
  var newRoleModal;
  beforeEach(inject(function (_newRoleModal_, _$q_, _$rootScope_, _$timeout_) {
    $timeout = _$timeout_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    newRoleModal = _newRoleModal_;
    resultDfd = $q.defer();
    openedDfd = $q.defer();
    mInstance = {
      result: resultDfd.promise,
      opened: openedDfd.promise
    };
    roles = {};
  }));

  it('should be a function', function() {
    expect(typeof newRoleModal).toEqual('function');
  });

  it('should call $modal.open', function() {
    newRoleModal(roles);
    expect($modal.open).toHaveBeenCalled();
  });

  it('should pass roles in the resolve block', function() {
    newRoleModal(roles);
    expect(modalOptions.resolve.roles()).toEqual(roles);
  });

  it('should return the result promise', function() {
    expect(newRoleModal(roles)).toEqual(resultDfd.promise);
  });

  it('should broadcast newRoleModalOpened event', function() {
    var scope = $rootScope.$new();
    var openListener = jasmine.createSpy('openListener');
    scope.$on('newRoleModalOpened', openListener);
    newRoleModal(roles);
    openedDfd.resolve();
    scope.$apply();
    $timeout.flush();
    expect(openListener).toHaveBeenCalled();
  });

});

describe('Controller: newRoleModalController', function() {

    var $scope, roles, RoleModel, modelAttrs, saveDfd;
    
    beforeEach(module('app.pages.config.authManagement.newRoleModal'));

    beforeEach(inject(function($rootScope, $controller, $q){
      saveDfd = $q.defer();
      RoleModel = function() {};
      RoleModel.prototype = {
        set: jasmine.createSpy('set').and.callFake(function(attrs) {
          modelAttrs = attrs;
          return this;
        }),
        save: jasmine.createSpy('save').and.callFake(function() {
          return saveDfd.promise;
        })
      };
      $scope = $rootScope.$new();
      $controller('newRoleModalController', {
        $scope: $scope,
        roles: roles = {},
        RoleModel: RoleModel
      });
    }));

    it('should create a new RoleModel and set it to newRole on the scope', function() {
      expect($scope.newRole instanceof RoleModel).toEqual(true);
    });

    it('should set roles to the scope', function() {
      expect($scope.roles === roles).toEqual(true);
    });

    describe('the create method', function() {
      
      it('should be a function', function() {
        expect(typeof $scope.create).toEqual('function');
      });

      it('should call save on second param object', function() {
        var model;
        $scope.create({}, model = new RoleModel());
        expect(model.save).toHaveBeenCalled();
      });

      it('should clear any previous saveError on the scope', function() {
        $scope.saveError = {};
        $scope.create({}, new RoleModel());
        expect(!!$scope.saveError).toEqual(false);
      });

      it('should call $close on the scope when the save promise resolves', function() {
        $scope.create({}, new RoleModel());
        $scope.$close = jasmine.createSpy('close');
        saveDfd.resolve();
        $scope.$apply();
        expect($scope.$close).toHaveBeenCalled();
      });

      it('should set saveError to the statusText of the response when the save promise rejects', function() {
        $scope.create({}, new RoleModel());
        $scope.$close = jasmine.createSpy('close');
        saveDfd.reject({
          statusText: 'Errorz'
        });
        $scope.$apply();
        expect($scope.saveError).toEqual('Errorz');

      });

    });

});