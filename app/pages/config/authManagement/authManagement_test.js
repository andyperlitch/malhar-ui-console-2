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

describe('Controller: AuthManagementCtrl', function() {

  var $scope,
      $q,
      $controller,
      userMethods = ['createUser', 'deleteUser'],
      roleMethods = ['saveRoles', 'cancelRoleChanges', 'deleteRole', 'createRole'],
      injections,
      currentUser,
      abilities,
      UserCollection,
      RoleCollection,
      RoleModel,
      webSocket,
      users,
      roles,
      role,
      newRoleModal,
      newUserModal,
      newRoleModalDfd,
      newUserModalDfd,
      deleteRoleDfd,
      saveRolesDfd,
      fetchUsersDfd,
      fetchRolesDfd;


  beforeEach(module('app.pages.config.authManagement',function($provide) {
    $provide.value('webSocket', webSocket = {});
  }));

  beforeEach(inject(function($rootScope, _$controller_, _$q_){
    $q = _$q_;
    $controller = _$controller_;
    $scope = $rootScope.$new();
    currentUser = {
      can: function(ability) {
        return abilities.indexOf(ability) > -1;
      }
    };

    newRoleModalDfd = $q.defer();
    newUserModalDfd = $q.defer();
    deleteRoleDfd = $q.defer();
    saveRolesDfd = $q.defer();
    fetchRolesDfd = $q.defer();
    fetchUsersDfd = $q.defer();

    injections = {
      $scope: $scope,
      currentUser: currentUser,
      UserCollection: UserCollection = function() {
        users = this;
        this.fetch = jasmine.createSpy('fetchUsers').and.callFake(function() {
          return fetchUsersDfd.promise;
        });
      },
      RoleCollection: RoleCollection = function() {
        roles = this;
        this.fetch = jasmine.createSpy('fetchRoles').and.callFake(function() {
          return fetchRolesDfd.promise;
        });
        this.data = [role = {
          name: 'admin',
          permissions: ['MANAGE_ROLES', 'MANAGE_USERS']
        }];
        this.save = jasmine.createSpy('saveRoles').and.callFake(function() {
          return saveRolesDfd.promise;
        });
      },
      newUserModal: newUserModal = jasmine.createSpy('newUserModal').and.callFake(function() { return newUserModalDfd.promise; }),
      newRoleModal: newRoleModal = jasmine.createSpy('newRoleModal').and.callFake(function() { return newRoleModalDfd.promise; })
    };

    RoleModel = function() {

    };

    RoleModel.prototype = {
      delete: jasmine.createSpy('delete').and.callFake(function() {
        return deleteRoleDfd.promise;
      })
    };

    RoleCollection.prototype = {
      model: RoleModel
    };

  }));

  describe('when the user can only manage roles', function() {

    beforeEach(function() {
      abilities = ['MANAGE_ROLES'];
      $controller('AuthManagementCtrl', injections);
    });

    it('should not create a users collection', function() {
      expect($scope.users).toBeUndefined();  
    });

    it('should create a roles collection', function() {
      expect($scope.roles instanceof RoleCollection).toEqual(true);
    });

    it('should expose role-management methods', function() {
      angular.forEach(roleMethods, function(method) {
        expect(typeof $scope[method]).toEqual('function');
      });
    });

    it('should not expose user-management scope methods', function() {
      angular.forEach(userMethods, function(method) {
        expect($scope[method]).toBeUndefined();
      });
    });

    describe('the createRole method', function() {
      
      it('should call newRoleModal service with the roles collection', function() {
        $scope.createRole();
        expect(injections.newRoleModal).toHaveBeenCalled();
        expect(injections.newRoleModal).toHaveBeenCalledWith(roles);
      });

      it('should fetch roles when newRoleModal has resolved', function() {
        $scope.createRole();
        newRoleModalDfd.resolve();
        $scope.$apply();
        expect(roles.fetch).toHaveBeenCalled();
      });

    });

    describe('the deleteRole method', function() {
      
      it('should call RoleModel::delete', function() {
        $scope.deleteRole(role);
        expect(RoleModel.prototype.delete).toHaveBeenCalled();
      });

      it('should remove the role from roles.data when the delete promise is resolved', function() {
        $scope.deleteRole(role);
        deleteRoleDfd.resolve();
        $scope.$apply();
        expect(roles.data.indexOf(role)).toEqual(-1);
      });

    });

    describe('the cancelRoleChanges method', function() {
      
      it('should refetch the roles and set flags.editingRoles to false', function() {
        $scope.cancelRoleChanges();
        expect(roles.fetch).toHaveBeenCalled();
        expect($scope.flags.editingRoles).toEqual(false);
      });

    });

    describe('the saveRoles method', function() {
      
      it('should set svaeRolesError to false before the save promise is resolved', function() {
        $scope.saveRolesError = {};
        $scope.saveRoles();
        expect($scope.saveRolesError).toEqual(null);
      });

      it('should call roles.save', function() {
        $scope.saveRoles();
        expect(roles.save).toHaveBeenCalled();
      });

      describe('when the save promise is resolve', function() {

        beforeEach(function() {
          $scope.flags.editingRoles = true;
          $scope.saveRoles();
          saveRolesDfd.resolve();
          $scope.$apply();
        });
        
        it('should fetch the roles and set the editingRoles flag to false when that has finished', function() {
          expect(roles.fetch).toHaveBeenCalled();
          expect($scope.flags.editingRoles).toEqual(true);
          fetchRolesDfd.resolve();
          $scope.$apply();
          expect($scope.flags.editingRoles).toEqual(false);
        });

        it('should set the savingRoles flag to false', function() {
          expect($scope.flags.savingRoles).toEqual(false);
        });

      });

      describe('when the save promise is rejected', function() {

        var saveErr;

        beforeEach(function() {
          $scope.saveRoles();
          saveRolesDfd.reject(saveErr = {});
          $scope.$apply();
        });
        
        it('should set the saveRolesError to the response', function() {
          expect($scope.saveRolesError).toEqual(saveErr);
        });

        it('should set the savingRoles flag to false', function() {
          expect($scope.flags.savingRoles).toEqual(false);
        });

      });

    });

  });

  describe('when the user can only manage users', function() {

    beforeEach(function() {
      abilities = ['MANAGE_USERS'];
      $controller('AuthManagementCtrl', injections);
    });

    it('should still have a roles collection', function() {
      expect($scope.roles instanceof RoleCollection).toEqual(true);
    });

    it('should expose user-management scope methods', function() {
      angular.forEach(userMethods, function(method) {
        expect(typeof $scope[method]).toEqual('function');
      });
    });

    it('should not expose role-management scope methods', function() {
      angular.forEach(roleMethods, function(method) {
        expect($scope[method]).toBeUndefined();
      });
    });

    describe('the createUser method', function() {
      
      it('should call newUserModal with users and roles', function() {
        $scope.createUser(users, roles);
        expect(newUserModal).toHaveBeenCalledWith(users, roles);
      });

      it('should fetch users when the newUserModal promise has resolved', function() {
        $scope.createUser(users, roles);
        newUserModalDfd.resolve();
        $scope.$apply();
        expect(users.fetch).toHaveBeenCalled();
      });

    });

    describe('the deleteUser method', function() {

      var dfd, user;

      beforeEach(function() {
        dfd = $q.defer();
        $scope.deleteUser(user = {
          delete: jasmine.createSpy('delete').and.callFake(function(){
            return dfd.promise;
          })
        });
      });
      
      it('should call delete on the user that gets passed to it', function() {
        expect(user.delete).toHaveBeenCalled();
      });

      it('should fetch users when the user.delete promise resolves', function() {
        dfd.resolve();
        $scope.$apply();
        expect(users.fetch).toHaveBeenCalled();
      });

    });

  });

  describe('when the user can manage users and roles', function() {

    beforeEach(function() {
      abilities = ['MANAGE_ROLES', 'MANAGE_USERS'];
      $controller('AuthManagementCtrl', injections);
    });

    it('should expose role-management methods', function() {
      angular.forEach(roleMethods, function(method) {
        expect(typeof $scope[method]).toEqual('function');
      });
    });

    it('should expose user-management scope methods', function() {
      angular.forEach(userMethods, function(method) {
        expect(typeof $scope[method]).toEqual('function');
      });
    });

  });

});