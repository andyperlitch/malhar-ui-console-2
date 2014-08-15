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

describe('Top-level app module', function() {

  var storageKey = 'testing';

  beforeEach(function() {
    angular.module('datatorrent.mlhrTable',[]);
  });

  describe('when the stored state is valid', function() {
    beforeEach(function() {
      localStorage.setItem(storageKey, JSON.stringify({
        key1: 'value1'
      }));
    });

    beforeEach(module('app', function($provide) {
      $provide.constant('settings', {
        STORAGE_KEY: storageKey
      });
    }));

    afterEach(function() {
      localStorage.removeItem(storageKey);
    });

    it('should load the STORAGE_KEY state into userStorage', inject(function(userStorage) {
      expect(userStorage.toObject()).toEqual({
        key1: 'value1'
      });
    }));
  });

  describe('when the stored state is invalid', function() {

    var $log;

    beforeEach(function() {
      localStorage.setItem(storageKey, JSON.stringify({
        key1: 'value1'
      }) + '}'); // force parse error
    });

    beforeEach(module('app', function($provide) {
      $provide.constant('settings', {
        STORAGE_KEY: storageKey
      });
      $provide.value('$log', $log = {
        warn: jasmine.createSpy()
      });
    }));

    afterEach(function() {
      localStorage.removeItem(storageKey);
    });

    it('should load the STORAGE_KEY state into userStorage', inject(function(userStorage) {
      expect(userStorage.toObject()).toEqual({});
      expect(localStorage.getItem(storageKey)).toEqual(null);
    }));

    it('should call $log.warn', function() {
      expect($log.warn).toHaveBeenCalled();   
    });

  });

  describe('when there is no stored state', function() {

    beforeEach(module('app', function($provide) {
      $provide.constant('settings', {
        STORAGE_KEY: storageKey
      });
    }));

    afterEach(function() {
      localStorage.removeItem(storageKey);
    });

    it('should set the storage to an empty object', inject(function(userStorage) {
      expect(userStorage.toObject()).toEqual({});
    }));

  });

});