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

describe('Controller: ContainerLogCtrl', function() {

  var $scope, $routeParams, $location, breadcrumbs, ContainerLogCollection, ContainerLogModel, fetchCallback, userStorage, settings, setupCtrl;

  beforeEach(function() {
    $routeParams = {
      appId: 'app1',
      containerId: 'ctnr1',
      logName: 'log1'
    };
    $location = {
      path: jasmine.createSpy()
    };
    ContainerLogCollection = function() {};
    ContainerLogCollection.prototype.fetch = function() {
      return { then: function (fn) {
        fetchCallback = fn;
      }};
    };
    ContainerLogModel = function() {

    };
  });

  beforeEach(module('app.pages.ops.appInstance.container.containerLog', function($provide) {
    $provide.value('webSocket', {
      subscribe: jasmine.createSpy(),
      unsubscribe: jasmine.createSpy()
    });
    $provide.value('breadcrumbs', breadcrumbs = {
      options: {}
    });
    $provide.constant('settings', settings = {
      pages: {
        ContainerLog: '/ws/v1/applications/:appId/:containerId/:logName'
      },
      urls: {
        ContainerLog: ''
      },
      containerLogs: {
        DEFAULT_START_OFFSET: -1000,
        VIEWPORT_HEIGHT_KEY: 'myAwesomeKey',
        DEFAULT_HEIGHT: 456
      }
    });
    // $provide.value('ContainerLogModel', ContainerLogModel);
    $provide.value('ContainerLogCollection', ContainerLogCollection);
  }));

  beforeEach(inject(function($rootScope, $controller, _userStorage_){
    $scope = $rootScope.$new();
    userStorage = _userStorage_;
    userStorage.removeItem(settings.containerLogs.VIEWPORT_HEIGHT_KEY);

    spyOn(userStorage, 'getItem').and.callThrough();
    spyOn(userStorage, 'setItem').and.callThrough();

    setupCtrl = function() {
      $controller('ContainerLogCtrl', {
        $scope: $scope,
        $routeParams: $routeParams,
        dtText: {
          get: function(key) {
            return key;
          }
        },
        $location: $location
      });
    };
  }));

  afterEach(function() {
    userStorage.removeItem(settings.containerLogs.VIEWPORT_HEIGHT_KEY);
  });

  it('should set the container log object with the result from the collection being fetched', function() {
    setupCtrl();
    var logs = [
      {name: 'log0'},
      {name: 'log1', length: 10000},
      {name: 'log2'},
      {name: 'log3'}
    ];
    fetchCallback(logs);
    expect($scope.log.data.length).toEqual(10000);
  });

  describe('the resizableOptions', function() {

    beforeEach(function() {
      
    });

    it('should be an object', function() {
      setupCtrl();
      expect(typeof $scope.resizableOptions).toEqual('object');
    });

    it('should have a stop method that sets settings.containerLogs.VIEWPORT_HEIGHT_KEY in userStorage', function() {
      setupCtrl();
      $scope.resizableOptions.stop({}, { size: { height: 1234 }});
      expect(userStorage.setItem).toHaveBeenCalledWith(settings.containerLogs.VIEWPORT_HEIGHT_KEY, 1234);
    });

    it('should set scope.initialViewportHeight to settings.containerLogs.DEFAULT_HEIGHT by default', function() {
      setupCtrl();
      expect($scope.initialViewportHeight).toEqual(settings.containerLogs.DEFAULT_HEIGHT);
    });

    it('should set scope.initialViewportHeight to userStorage item if present', function() {
      userStorage.setItem(settings.containerLogs.VIEWPORT_HEIGHT_KEY, 567);
      setupCtrl();
      expect($scope.initialViewportHeight).toEqual(567);
    });

  });

});