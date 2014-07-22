/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
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

describe('Resource: ApplicationCollection', function() {

  var ApplicationCollection, mockWebSocket, mockSettings, $httpBackend, BaseCollection;

  beforeEach(function() {
    mockWebSocket = {
      send: function() {},
      subscribe: function() {},
      unsubscribe: function() {}
    };
    mockSettings = {
      NONENDED_APP_STATES: ['STATE1', 'STATE2', 'STATE3'],
      urls: {
        Application: '/ws/v1/applications'
      },
      topics: {
        Applications: 'applications'
      }
    };
  });

  beforeEach(module('app.components.resources.ApplicationCollection', function($provide){
    $provide.value('webSocket', mockWebSocket);
    $provide.constant('settings', mockSettings);
  }));

  beforeEach(inject(function(_ApplicationCollection_, _$httpBackend_, _BaseCollection_) {
    ApplicationCollection = _ApplicationCollection_;
    BaseCollection = _BaseCollection_;
    $httpBackend = _$httpBackend_;

    spyOn(BaseCollection.prototype, 'fetch');
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be a function', function() {
    expect(typeof ApplicationCollection).toEqual('function');
  });

  describe('the fetch function', function() {
    
    it('should create a states parameter on the options.params object when no options passed', function() {
      var c = new ApplicationCollection();
      c.fetch();
      expect(BaseCollection.prototype.fetch).toHaveBeenCalledWith({ params: { states: 'STATE1,STATE2,STATE3' } });
    });

    it('should add params.states if no params object exists', function() {
      var c = new ApplicationCollection();
      c.fetch({});
      expect(BaseCollection.prototype.fetch).toHaveBeenCalledWith({ params: { states: 'STATE1,STATE2,STATE3' } });      
    });

    it('should not change params.states if a params object is specified in options', function() {
      var c = new ApplicationCollection();
      c.fetch({ params: {} });
      expect(BaseCollection.prototype.fetch).toHaveBeenCalledWith({ params: {} });      
    });

  });

});