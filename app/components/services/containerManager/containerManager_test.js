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

describe('Service: containerManager', function () {

  var mocks, constrOpts;

  beforeEach(function() {
    mocks = {};
    mocks.confirm = function() {
      return mocks.confirmDeferred.promise;
    };
    mocks.ContainerLogCollection = function(options) {
      constrOpts = options;
    };
    mocks.ContainerLogCollection.prototype.fetch = function() {

    };
    mocks.settings = {
      actions: {
        killContainer: '/ws/applications/:appId/physicalPlan/containers/:containerId/kill'
      }
    };
    spyOn(mocks, 'confirm').and.callThrough();
  });

  // load the service's module
  beforeEach(module('app.components.services.containerManager', function($provide) {
    $provide.value('confirm', mocks.confirm);
    $provide.constant('settings', mocks.settings);
    $provide.value('ContainerLogCollection', mocks.ContainerLogCollection);
  }));

  // instantiate service
  var containerManager, $rootScope;
  beforeEach(inject(function (_containerManager_, $q, _$rootScope_) {
    containerManager = _containerManager_;
    mocks.confirmDeferred = $q.defer();
    $rootScope = _$rootScope_;
  }));

  describe('the isAppMaster method', function() {
    
    it('should take an id as an argument, and should return true if it ends in 00001', function() {
      expect(containerManager.isAppMaster('container_12989823749823_00001')).toEqual(true);
    });

    it('should return false if the id does not end with 00001', function() {
      expect(containerManager.isAppMaster('container_12989823749823_00002')).toEqual(false);
    });

    it('the number of zeroes should not matter', function() {
      expect(containerManager.isAppMaster('container_12989823749823_001')).toEqual(true);
      expect(containerManager.isAppMaster('container_12989823749823_00000001')).toEqual(true);
    });

  });

  describe('the kill method', function() {

    // test backend
    var $httpBackend, appId, id, masterId;
    
    beforeEach(inject(function(_$httpBackend_) {
      appId = 'app_1';
      id = 'container_12989823749823_0002';
      masterId = 'container_12989823749823_0001';
      var killRE = new RegExp('^/ws/applications/[^/]+/physicalPlan/containers/[^/]+/kill$');
      $httpBackend = _$httpBackend_;
      $httpBackend.whenPOST(killRE).respond({});
      // USAGE:
      // $httpBackend.whenGET('/my-url?key=value').respond({});
      // $httpBackend.expectGET('/my-url?key=value');
      // $httpBackend.flush();
    }));
    
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
    
    it('should call confirm if the container is the App Master', function() {
      containerManager.kill({ id: masterId, appId: appId });
      expect(mocks.confirm).toHaveBeenCalled();
    });

    describe('confirm rejected', function() {
      it('should not make an API call', function() {
        containerManager.kill({ id: masterId, appId: appId });
        mocks.confirmDeferred.reject();
        $rootScope.$apply();
        // this test will fail if a request is made
        // because the afterEach block calls verifyNoOutstandingRequest
      });
    });

    describe('confirm resolved', function() {
      it('should post to kill action', function() {
        $httpBackend.expectPOST('/ws/applications/' + appId + '/physicalPlan/containers/' + masterId + '/kill');
        containerManager.kill({ id: masterId, appId: appId });
        mocks.confirmDeferred.resolve();
        $rootScope.$apply();
        $httpBackend.flush();
      });
    });

    it('should not call confirm if the container is not the App Master', function() {
      containerManager.kill({ id: id, appId: appId });
      $httpBackend.flush();
      expect(mocks.confirm).not.toHaveBeenCalled();
    });

    it('should post to kill action outright if not app master', function() {
      $httpBackend.expectPOST('/ws/applications/' + appId + '/physicalPlan/containers/' + id + '/kill');
      containerManager.kill({ id: id, appId: appId });
      $httpBackend.flush();
    });

    it('should accept appId as the second argument', function() {
      $httpBackend.expectPOST('/ws/applications/' + appId + '/physicalPlan/containers/' + id + '/kill');
      containerManager.kill({ id: id }, appId);
      $httpBackend.flush();
    });

    describe('the force flag', function() {

      it('should bypass the confirm call even if it is the app master', function() {
        $httpBackend.expectPOST('/ws/applications/' + appId + '/physicalPlan/containers/' + masterId + '/kill');
        containerManager.kill({ id: masterId, appId: appId }, true);
        $httpBackend.flush();
      });
      
      it('can be the third argument if appId is supplied as the second', function() {
        $httpBackend.expectPOST('/ws/applications/' + appId + '/physicalPlan/containers/' + masterId + '/kill');
        containerManager.kill({ id: masterId }, appId, true);
        $httpBackend.flush();
      });

    });

  });

  describe('the getLogsFor method', function() {
    
    it('should return a ContainerLogCollection', function() {
      var result = containerManager.getLogsFor({ id: 'ctnr1', appId: 'app1' });
      expect(result instanceof mocks.ContainerLogCollection).toEqual(true);
    });

    it('should pass an object with containerId and appId', function() {
      containerManager.getLogsFor({ id: 'ctnr1', appId: 'app1' });
      expect(constrOpts.containerId).toEqual('ctnr1');
      expect(constrOpts.appId).toEqual('app1');
    });

    it('should call fetch', function() {
      spyOn(mocks.ContainerLogCollection.prototype, 'fetch');
      containerManager.getLogsFor({ id: 'ctnr1', appId: 'app1' });
      expect(mocks.ContainerLogCollection.prototype.fetch).toHaveBeenCalled();
    });

    it('should be able to take appId as a second argument', function() {
      containerManager.getLogsFor({ id: 'ctnr1' }, 'app1');
      expect(constrOpts.containerId).toEqual('ctnr1');
      expect(constrOpts.appId).toEqual('app1');
    });

  });

});