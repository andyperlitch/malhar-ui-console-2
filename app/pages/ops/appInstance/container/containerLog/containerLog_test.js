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

  var $scope, $routeParams, $location, breadcrumbs, ContainerLogCollection, ContainerLogModel, fetchCallback;

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
    $provide.constant('settings', {
      pages: {
        ContainerLog: '/ws/v1/applications/:appId/:containerId/:logName'
      },
      urls: {
        ContainerLog: ''
      },
      containerLogs: {
        DEFAULT_START_OFFSET: -1000
      }
    });
    // $provide.value('ContainerLogModel', ContainerLogModel);
    $provide.value('ContainerLogCollection', ContainerLogCollection);
  }));

  beforeEach(inject(function($rootScope, $controller){
    $scope = $rootScope.$new();
    
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
  }));

  it('should set the container log object with the result from the collection being fetched', function() {
    var logs = [
      {name: 'log0'},
      {name: 'log1', length: 10000},
      {name: 'log2'},
      {name: 'log3'}
    ];
    fetchCallback(logs);
    expect($scope.log.data.length).toEqual(10000);
  });

});