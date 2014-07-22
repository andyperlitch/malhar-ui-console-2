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

/* global describe, before, beforeEach, after, afterEach, inject, it, expect, module */

'use strict';

describe('Resource: ApplicationModel', function() {
  
  var ApplicationModel, BaseModel, mockWebSocket, m;

  beforeEach(function() {
    mockWebSocket = {
      send: function() {},
      subscribe: function() {},
      unsubscribe: function() {}
    };
  });

  beforeEach(module('app.components.resources.ApplicationModel', function($provide) {
    $provide.value('webSocket', mockWebSocket);
  }));

  beforeEach(inject(function(_ApplicationModel_, _BaseModel_) {
    ApplicationModel = _ApplicationModel_;
    BaseModel = _BaseModel_;
    m = new ApplicationModel({ id: 'application_0000_0001'});
  }));

  it('should be a function', function() {
    expect(typeof ApplicationModel).toEqual('function');
  });

  describe('transformResponse method', function() {

    var s_raw, f_raw;

    beforeEach(function() {
      
      f_raw = {
        state: 'RUNNING',
        currentWindowId: '12345678912345',
        recoveryWindowId: '12345678912341',
        stats: {
          tuplesProcessedPSMA: '1000',
          tuplesEmittedPSMA: '1000',
          plannedContainers: '1',
          numOperators: '1',
          totalTuplesEmitted: '10000',
          totalTuplesProcessed: '10000'
        },
        attributes: {
          STREAMING_WINDOW_SIZE_MILLIS: '500'
        }
      };

      s_raw = {
        currentWindowId: '12345678912345',
        recoveryWindowId: '12345678912341',
        state: 'RUNNING',
        tuplesProcessedPSMA: '1000',
        tuplesEmittedPSMA: '1000'
      };

    });

    
    describe('when the type is fetch, or undefined', function() {

      

    });

    describe('when the type is subscribe', function() {
      
      it('should return an object with state, windowIds, and stats', function() {
        var result = m.transformResponse(s_raw, 'subscribe');
        var expected = ['state', 'recoveryWindowId', 'currentWindowId', 'stats'];
        for (var k in result) {
          if (result.hasOwnProperty(k)) {
            expect(expected).toContain(k);
          }
        }
      });
      
    });

  });

});