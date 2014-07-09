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

describe('Service: BaseResource', function () {

  var mockWebSocket, mockGetUri;

  beforeEach(function() {
    mockWebSocket = {
      send: function() {},
      subscribe: function() {},
      unsubscribe: function() {}
    };
    mockGetUri = {
      url: function() {
        return '/fake/end/point';
      },
      topic: function() {
        return 'fake.topic';
      }
    }
  });

  // load the service's module
  beforeEach(module('dtConsole.resources.Base', function($provide) {
    $provide.value('webSocket', mockWebSocket);
    $provide.value('getUri', mockGetUri);
  }));

  // instantiate service
  var BaseResource, BaseModel, BaseCollection;
  beforeEach(inject(function (_BaseResource_, _BaseModel_, _BaseCollection_) {
    BaseResource = _BaseResource_;
    BaseModel = _BaseModel_;
    BaseCollection = _BaseCollection_;
  }));

  describe('BaseResource', function () {

  });

  describe('BaseModel', function () {

    it('should have "id" as the default idAttribute', function() {
      expect(BaseModel.prototype.idAttribute).toEqual('id');
    });

  });

  describe('BaseCollection', function () {

    var c, c2, C, M2, C2;

    beforeEach(function() {
      C = BaseCollection.extend({
        urlKey: 'Test'
      });
      M2 = BaseModel.extend({
        idAttribute: '_id'
      });
      C2 = BaseCollection.extend({
        urlKey: 'Test',
        model: M2
      });
      c = new C();
      c2 = new C2();
    });

    it('should set a url', function() {
      expect(c.url).toBeDefined();
    });

    it('should set a topic, if topicKey is present on the prototype', function() {
      C.prototype.topicKey = 'Test';
      c = new C();
      expect(c.topic).toBeDefined();
    });

    describe('the get method', function() {
      
      it('should look for the object with the idAttribute of id', function() {
        var target;
        c.data = [
          { id: '1' },
          { id: '2' },
          target = { id: '3' },
          { id: '4' }
        ];
        expect(c.get('3')).toEqual(target);
      });

      it('should use idAttribute on the model prototype', function() {
        var target;
        c2.data = [
          { _id: '1' },
          target = { _id: '2' },
          { _id: '3' },
          { _id: '4' }
        ];
        expect(c2.get('2')).toEqual(target);
      });

      it('should return undefined if it cannot find it', function() {
        c.data = [
          { id: '1' },
          { id: '2' }
        ];
        expect(c.get('3')).toBeUndefined();
      });

    });

    describe('the set function', function() {
      
      var data;

      beforeEach(function() {
        data = c.data;
      });

      it('should not change the data object', function() {
        c.set([]);
        expect(data === c.data).toEqual(true);
      });

      it('should add elements that previously were not there (by id)', function() {
        var el = {id: '1'};
        c.set([el]);
        expect(data.indexOf(el) > -1).toEqual(true);
      });

      it('should merge elements with the same id', function() {
        var newEl = {id: '1', name: 'andy'};
        var oldEl = {id: '1'};
        data.push(oldEl);

        c.set([newEl]);
        expect(data.indexOf(oldEl) > -1).toEqual(true);
        expect(oldEl.name).toEqual('andy');
        expect(data.indexOf(newEl) === -1).toEqual(true);
      });

    });

  });



});