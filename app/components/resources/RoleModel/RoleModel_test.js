'use strict';

describe('Resource: RoleModel', function () {

  var confirm, confirmDfd, $rootScope;

  // load the service's module
  beforeEach(module('app.components.resources.RoleModel', function($provide) {
    $provide.value('webSocket', {});
    $provide.constant('settings', {
      urls: {
        Role: '/roles'
      }
    });
    $provide.value('confirm', confirm = jasmine.createSpy('confirm').and.callFake(function() {
      return confirmDfd.promise;
    }));
  }));

  // instantiate service
  var RoleModel, r;
  beforeEach(inject(function (_RoleModel_, $q, _$rootScope_) {
    RoleModel = _RoleModel_;
    $rootScope = _$rootScope_;
    r = new RoleModel();
    confirmDfd = $q.defer();
  }));

  it('should be a function', function() {
    expect(typeof RoleModel).toEqual('function');
  });

  describe('the transformResponse method', function() {
    
    it('should convert a list of permissions into an object where ability is key and boolean is value', function() {
      var result = r.transformResponse({ permissions: ['MANAGE_USERS', 'MANAGE_ROLES'] }).permissions;
      expect(result).toEqual({
        MANAGE_USERS: true,
        MANAGE_ROLES: true
      });
    });

  });

  describe('the save method', function() {
    
    // test backend
    var $httpBackend;
    
    beforeEach(inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      r.data.name = 'myrole';
      r.data.permissions = {
        MANAGE_USERS: true,
        MANAGE_ROLES: true,
        DROP_A_DEUCE: false
      };
      // USAGE:
      // $httpBackend.whenGET('/my-url?key=value').respond({});
      // $httpBackend.expectGET('/my-url?key=value');
      // $httpBackend.flush();
    }));
    
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should PUT the role to the server with permissions as a list', function() {
      $httpBackend.whenPUT('/roles/myrole').respond({});
      $httpBackend.expectPUT('/roles/myrole', { name: 'myrole', permissions: ['MANAGE_USERS', 'MANAGE_ROLES'] });
      expect(typeof r.save().then).toEqual('function');
      $httpBackend.flush();
    });

    describe('when it is the admin role', function() {
      beforeEach(function() {
        r.data.name = 'admin';
      });

      it('should not try and save if it is the admin role', function() {
        r.save();
      });

      it('should return a promise', function() {
        expect(angular.isPromise(r.save())).toEqual(true);
      });

    });

  });

  describe('the delete method', function() {
    
    var $httpBackend, delUrl;
    
    beforeEach(inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      r.data.name = 'myrole';
      delUrl = '/roles/myrole';
      $httpBackend.whenDELETE(delUrl).respond({});
    }));
    
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should first confirm with the user', function() {
      r.delete();
      expect(confirm).toHaveBeenCalled();
    });

    it('should DELETE the user when confirmed', function() {
      $httpBackend.expectDELETE(delUrl);
      r.delete();
      confirmDfd.resolve();
      $rootScope.$apply();
      $httpBackend.flush();
    });

    describe('when the force flag is used', function() {

      it('should DELETE the user without asking for confirmation', function() {
        $httpBackend.expectDELETE(delUrl);
        r.delete(true);
        $httpBackend.flush(); 
      });
      
    });

  });

});