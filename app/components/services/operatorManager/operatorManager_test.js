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

describe('Factory: operatorManager', function () {

  // load the service's module
  beforeEach(module('app.components.services.operatorManager', function($provide) {
    $provide.constant('settings', {
      urls: {
        Recording                :'/apps/:appId/physOps/:operatorId/recordings',
        RecordingTuples          :'/apps/:appId/physOps/:operatorId/recordings/:startTime/tuples'
      },
      actions: {
        startOpRecording         :'/apps/:appId/physOps/:operatorId/recordings/start',
        startPortRecording       :'/apps/:appId/physOps/:operatorId/ports/:portName/recordings/start',
        stopOpRecording          :'/apps/:appId/physOps/:operatorId/recordings/stop',
        stopPortRecording        :'/apps/:appId/physOps/:operatorId/ports/:portName/recordings/stop'
      },
      recording: {
        POLLING_FOR_RECORDING_TIMEOUT: 10000,
        POLLING_FOR_RECORDING_INTERVAL: 1000
      }
    });
    $provide.value('webSocket', {});
  }));

  // instantiate service
  var operatorManager;
  beforeEach(inject(function (_operatorManager_) {
    operatorManager = _operatorManager_;
  }));

  // test backend
  var $httpBackend;
  
  beforeEach(inject(function(_$httpBackend_) {
    $httpBackend = _$httpBackend_;
  
    // USAGE:
    // $httpBackend.whenGET('/my-url?key=value').respond({});
    // $httpBackend.expectGET('/my-url?key=value');
    // $httpBackend.flush();
  }));
  
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('the startRecording method', function() {

    var portName, opId, appId, opUrl, portUrl;

    beforeEach(function() {
      portName = 'example_port';
      opId = 123;
      appId = 'application_0001';
      opUrl = '/apps/' + appId + '/physOps/' + opId + '/recordings/start';
      portUrl = '/apps/' + appId + '/physOps/' + opId + '/ports/' + portName + '/recordings/start';
      $httpBackend.whenPOST(opUrl).respond({});
      $httpBackend.whenPOST(portUrl).respond({});
      spyOn(operatorManager, 'pollForRecording');
    });
    
    it('should be a function', function() {
      expect(typeof operatorManager.startRecording).toEqual('function');
    });

    it('should call startOpRecording url if no port is specified', function() {
      operatorManager.startRecording(appId, opId);
      $httpBackend.expectPOST(opUrl);
      $httpBackend.flush();
    });

    it('should call startPortRecording url if a port is specified', function() {
      operatorManager.startRecording(appId, opId, portName);
      $httpBackend.expectPOST(portUrl);
      $httpBackend.flush();
    });

    it('should return an object with a request promise', function() {
      var result = operatorManager.startRecording(appId, opId, portName);
      expect(typeof result.request).toEqual('object');
      $httpBackend.flush();
    });

  });

  describe('the stopRecording method', function() {
    
    var portName, opId, appId, opUrl, portUrl;

    beforeEach(function() {
      portName = 'example_port';
      opId = 123;
      appId = 'application_0001';
      opUrl = '/apps/' + appId + '/physOps/' + opId + '/recordings/stop';
      portUrl = '/apps/' + appId + '/physOps/' + opId + '/ports/' + portName + '/recordings/stop';
      $httpBackend.whenPOST(opUrl).respond({});
      $httpBackend.whenPOST(portUrl).respond({});
    });

    it('should be a function', function() {
      expect(typeof operatorManager.stopRecording).toEqual('function');
    });

    it('should call stopOpRecording url if no port is specified', function() {
      operatorManager.stopRecording(appId, opId);
      $httpBackend.expectPOST(opUrl);
      $httpBackend.flush();
    });

    it('should call stopPortRecording url if a port is specified', function() {
      operatorManager.stopRecording(appId, opId, portName);
      $httpBackend.expectPOST(portUrl);
      $httpBackend.flush();
    });

    it('should return an object with a request promise', function() {
      var result = operatorManager.stopRecording(appId, opId, portName);
      expect(typeof result.request).toEqual('object');
      $httpBackend.flush();
    });

  });

  describe('the pollForRecording method', function() {
    
    var portName, opId, appId, opUrl, portUrl;

    beforeEach(function() {
      portName = 'example_port';
      opId = 123;
      appId = 'application_0001';
      opUrl = '/apps/' + appId + '/physOps/' + opId + '/recordings';
      $httpBackend.whenGET(opUrl).respond({ recordings: [] });
    });

    it('should be a function', function() {
      expect(typeof operatorManager.pollForRecording).toEqual('function');
    });

    it('should call Recording url', function() {
      // $httpBackend.expectGET(opUrl);

      // $httpBackend.flush();
    });

    it('should return a promise', function() {
       var result = operatorManager.pollForRecording(appId, opId, portUrl);
       expect(typeof result).toEqual('object');
       expect(typeof result.then).toEqual('function');
       $httpBackend.flush();
    });

  });

});