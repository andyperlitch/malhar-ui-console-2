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

describe('BaseModel', function () {

  var mockWebSocket, mockSettings;

  beforeEach(function() {
    mockWebSocket = {
      send: function() {},
      subscribe: function() {},
      unsubscribe: function() {}
    };
    mockSettings = {
      urls: {
        somekey: '/fake/endpoint',
        otherkey: '/other/:thing/endpoint'
      },
      topics: {
        someTopicKey: 'fake.topic',
        otherTopicKey: 'other.fake.:thing.topic'
      }
    }
  });

  // load the service's module
  beforeEach(module('app.components.resources.BaseModel', function($provide) {
    $provide.value('webSocket', mockWebSocket);
    $provide.constant('settings', mockSettings);
  }));

  // instantiate service
  var BaseModel;
  beforeEach(inject(function (_BaseModel_) {
    BaseModel = _BaseModel_;
  }));

  it('should have "id" as the default idAttribute', function() {
    expect(BaseModel.prototype.idAttribute).toEqual('id');
  });

  describe('the constructor', function() {
    
    var M1, M2, M3, m1_1, m1_2, m1_3, m2_1, m2_2, m3;

    beforeEach(function() {
      M1 = BaseModel.extend({
        urlKey: 'somekey',
        topicKey: 'someTopicKey'
      });

      M2 = BaseModel.extend({
        urlKey: 'otherkey',
        topicKey: 'otherTopicKey',
        idAttribute: 'otherId'
      });

      M3 = BaseModel.extend({
        urlKey: 'otherkey'
      });

      m1_1 = new M1('1234');
      m1_2 = new M1({ id: '4321' });
      m1_3 = new M1();
      m2_1 = new M2({ thing: 'something', otherId: '5678'});
      m2_2 = new M2({ thing: 'otherthing'});
      m3 = new M3();

    });

    it('should take a string as its first argument and use it as the id for the url', function() {
      expect(m1_1.url).toEqual('/fake/endpoint/1234')
    });

    it('should take a parameters object as its first argument and use it to interpolate the url and topic', function() {
      expect(m1_2.url).toEqual('/fake/endpoint/4321');
      expect(m2_1.url).toEqual('/other/something/endpoint/5678');
    });

    it('should build the url without an idValue', function() {
      expect(m1_3.url).toEqual('/fake/endpoint');
      expect(m2_2.url).toEqual('/other/otherthing/endpoint');
    });

    it('should create this.data object', function() {
      expect(_.isObject(m1_1.data)).toEqual(true);
    });

    it('should create this.topic with the params object', function() {
      expect(m1_1.topic).toEqual('fake.topic');
      expect(m2_1.topic).toEqual('other.fake.something.topic');
    });

    it('should leave this.topic undefined if no topicKey exists', function() {
      expect(m3.topic).toBeUndefined();
    });

  });

  describe('the set method', function() {

    var M, m;

    beforeEach(function() {
      M = BaseModel.extend({
        urlKey: 'somekey'
      });
      m = new M();
    });

    it('should extend this.data object', function() {
      var thisdata = m.data;
      m.set({ cool: 'stuff' });
      expect(m.data === thisdata).toEqual(true);
      expect(m.data.cool).toEqual('stuff');
    });
  });

});