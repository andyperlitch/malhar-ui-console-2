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

describe('Service: userStorage', function () {

  // instantiate service
  var userStorage, provider, saveFn;
  beforeEach(function () {
    saveFn = jasmine.createSpy();
    var fakeModule = angular.module('fakeModule', ['app.components.services.userStorage']);
    fakeModule.config(function(userStorageProvider) {
      userStorageProvider.setSaveFunction(saveFn);
    });
    module('app.components.services.userStorage', 'fakeModule');
    inject(function(_userStorage_) {
      userStorage = _userStorage_;
      userStorage.load({
        foo: 'bar'
      });
    });
    
  });

  describe('the provider', function() {
    it('load method should set the initial state of the storage', function() {
      expect(userStorage.getItem('foo')).toEqual('bar');
    });
    it('should have a setSaveFunction method that passes a function that gets called when save() is called on the service', function() {
      userStorage.save();
      expect(saveFn).toHaveBeenCalled();
      expect(saveFn.calls.first().object).toEqual(userStorage);
    });
  });

  describe('the service', function() {

    beforeEach(function() {
      userStorage.clear();
    });

    it('should be an object', function() {
      expect(typeof userStorage).toEqual('object');
    });

    it('should implement the Web Storage interface and several other methods', function() {
      _.each(['setItem', 'getItem', 'removeItem', 'clear', 'serialize', 'toObject', 'load', 'save', 'set'], function(method) {
        expect(typeof userStorage[method]).toEqual('function');
      });
    });

    describe('the web storage interface', function() {
      
      it('should be able to set an item and then get it later', function() {
        userStorage.setItem('key1', 'value1');
        expect(userStorage.getItem('key1')).toEqual('value1');
      });

      it('should be able to remove previously set items', function() {
        userStorage.setItem('key1', 'value1');
        userStorage.removeItem('key1');
        expect(userStorage.getItem('key1')).toBeUndefined();
      });

      it('should call save on itself whenever setItem, removeItem, clear, or load is called', function() {
        spyOn(userStorage, 'save');
        userStorage.setItem('key1', 'value1');
        userStorage.setItem('key1');
        userStorage.clear();
        userStorage.load({});
        expect(userStorage.save.calls.count()).toEqual(4);
      });

      it('should be able to clear all values', function() {
        userStorage.setItem('key1', 'value1');
        userStorage.setItem('key2', 'value2');
        userStorage.clear();
        expect(userStorage.getItem('key1')).toBeUndefined();
        expect(userStorage.getItem('key2')).toBeUndefined();
      });

      it('should be able to load a storage object', function() {
        userStorage.load({
          key1: 'value1',
          key2: 'value2'
        });
        expect(userStorage.getItem('key1')).toEqual('value1');
        expect(userStorage.getItem('key2')).toEqual('value2');
      });

    });

    describe('toObject', function() {
      it('should be able to return the storage object', function() {
        userStorage.setItem('key1', 'value1');
        userStorage.setItem('key2', 'value2');
        expect(userStorage.toObject()).toEqual({
          key1: 'value1',
          key2: 'value2'
        });
      });

      it('should pass by reference by default', function() {
        var s = userStorage.toObject();
        s.foo = 'bar';
        expect(userStorage.getItem('foo')).toEqual('bar');
      });

      it('should allow a "copy" flag as the first argument', function() {
        userStorage.setItem('foo', 'baz');
        var s = userStorage.toObject(true);
        s.foo = 'bar';
        expect(userStorage.getItem('foo')).toEqual('baz');
      });
    });

    describe('serialize', function() {
      it('should be able to serialize the storage to a string', function() {
        userStorage.setItem('key1', 'value1');
        userStorage.setItem('key2', 'value2');
        expect(userStorage.serialize()).toEqual(JSON.stringify(userStorage.toObject()));
      });
    });

    describe('set', function() {
      it('should allow multiple updates at once', function() {
        userStorage.setItem('key1', 'value1');
        userStorage.setItem('key2', 'value2');
        userStorage.setItem('foo', 'bar');
        userStorage.set({
          key2: 'other2',
          foo: 'baz'
        });
        expect(userStorage.getItem('key1')).toEqual('value1');
        expect(userStorage.getItem('key2')).toEqual('other2');
        expect(userStorage.getItem('foo')).toEqual('baz');
      });
    });
  });

});