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

describe('Resource: RecordingModel', function () {

  // load the service's module
  beforeEach(module('app.components.resources.RecordingModel', function($provide) {
    $provide.value('webSocket', {
      subscribe: function() {

      },
      unsubscribe: function() {

      }
    });
  }));

  // instantiate service
  var RecordingModel, recording;
  beforeEach(inject(function (_RecordingModel_) {
    RecordingModel = _RecordingModel_;
    recording = new RecordingModel({
      appId: 'app1',
      operatorId: '1'
    });
  }));

  it('should be a function', function() {
    expect(typeof RecordingModel).toEqual('function');
  });

  it('should set a tupleUrl on instantiation', function() {
    expect(recording.tupleUrl).toEqual(recording.url + '/tuples');
  });

  describe('the getTuples method', function() {
    
    // test backend
    var $be, tupleUrlRE;
    
    beforeEach(inject(function(_$httpBackend_) {
      tupleUrlRE = new RegExp(recording.tupleUrl + '\\?.*');
      $be = _$httpBackend_;
      $be.whenGET(tupleUrlRE).respond({
        tuples: [
          {
            tuples: [
              { data: { string: '"hello"' } }
            ],
            windowId: '12345'
          }, 
          {
            tuples: [
              { data: { string: '"goodbye"' } }
            ],
            windowId: '12346'
          }
        ]
      });
      // USAGE:
      // $be.whenGET('/my-url?key=value').respond({});
      // $be.expectGET('/my-url?key=value');
      // $be.flush();
    }));
    
    afterEach(function() {
      $be.verifyNoOutstandingExpectation();
      $be.verifyNoOutstandingRequest();
    });

    it('should throw if no offset or limit is supplied', function() {
      expect(function() {
        recording.getTuples();
      }).toThrow();
      expect(function() {
        recording.getTuples('0');
      }).toThrow();
    });

    it('should throw if one or both of offset and limit are not numbers or numeric strings', function() {
      expect(function() {
        recording.getTuples('abc', 'def');
      }).toThrow();
      expect(function() {
        recording.getTuples('10', 'def');
      }).toThrow();
      expect(function() {
        recording.getTuples('abc', '10');
      }).toThrow();
    });

    it('should send a request to the tuples url of the recording', function() {
      recording.getTuples('0', '50');
      $be.expectGET(recording.tupleUrl + '?limit=50&offset=0');
      $be.flush();
    });

    it('should include ports in the query string if specified as a third argument', function() {
      recording.getTuples('0', '50', [0, 1]);
      $be.expectGET(recording.tupleUrl + '?limit=50&offset=0&ports=0,1');
      $be.flush();
    });

    it('should return a promise', function() {
      var result = recording.getTuples('0', '50');
      expect(angular.isObject(result)).toEqual(true);
      expect(typeof result.then).toEqual('function');
      $be.flush();
    });

    it('should resolve the promise with the aggregated tuples', function() {
      recording.getTuples('0', '50').then(function(res) {
        expect(angular.isArray(res)).toEqual(true);
        expect(res[0].hasOwnProperty('index')).toEqual(true);
        expect(res[0].windowId).toEqual('12345');
        expect(res[1].hasOwnProperty('index')).toEqual(true);
        expect(res[1].windowId).toEqual('12346');
      });
      $be.flush();

    });

  });

});