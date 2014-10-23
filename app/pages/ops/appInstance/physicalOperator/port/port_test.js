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

describe('Controller: PortPageCtrl', function() {

  var $scope, $q, fetchDFD, $httpBackend, PortModel;
  
  beforeEach(module('app.pages.ops.appInstance.physicalOperator.port', function($provide){
    PortModel = function() {
      this.operator = {
        name: 'operatorName'
      };
    };
    PortModel.prototype.fetch = function() {
      return fetchDFD.promise;
    };
    PortModel.prototype.subscribe = function() {

    };
    $provide.value('PortModel', PortModel);
    $provide.constant('settings', {
      urls: {
        PortAttributes: '/port-attributes'
      }
    });
  }));
  
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  beforeEach(inject(function(_$httpBackend_, _$q_, $rootScope, $controller){
    spyOn(PortModel.prototype, 'fetch').and.callThrough();
    spyOn(PortModel.prototype, 'subscribe').and.callThrough();
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    fetchDFD = $q.defer();
    $scope = $rootScope.$new();

    $controller('PortPageCtrl', {
      $scope: $scope
    });
  }));

  it('should put a port object on the $scope', function() {
    expect(typeof $scope.port).toEqual('object');
  });

  it('should call port.fetch', function() {
    expect($scope.port.fetch).toHaveBeenCalled();
  });

  it('should try to get port attributes if the port fetch succeeds', function() {
    $httpBackend.whenGET('/port-attributes').respond({});
    fetchDFD.resolve();
    $httpBackend.expectGET('/port-attributes');
    $httpBackend.flush();
  });

});