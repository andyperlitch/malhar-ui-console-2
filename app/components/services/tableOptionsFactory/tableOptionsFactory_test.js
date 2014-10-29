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

describe('Service: tableOptionsFactory', function () {

  var userStorage;

  // load the service's module
  beforeEach(module('app.components.services.tableOptionsFactory', function($provide){
    $provide.value('userStorage', userStorage = {});
  }));

  var scope, widget;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
    widget = {};
  }));

  // instantiate service
  var tableOptionsFactory;
  beforeEach(inject(function (_tableOptionsFactory_) {
    tableOptionsFactory = _tableOptionsFactory_;
  }));

  it('should be a function', function() {
    expect(typeof tableOptionsFactory).toEqual('function');
  });

  it('should extend the passed object with storage:userStorage if a widget is not provided', function() {
    var result = tableOptionsFactory({
      row_limit: 23,
      arbitrary: true
    }, scope);
    expect(result.storage).toBeDefined();
    expect(result.storage).toEqual(userStorage);
    expect(result.arbitrary).toEqual(true);
    expect(result.row_limit).toEqual(23);
  });

  describe('storage when a widget is provided', function() {
    
    var dmo, storage;

    beforeEach(function() {
      var result = tableOptionsFactory({}, widget, scope);
      dmo = widget.dataModelOptions;
      storage = result.storage;
    });

    it('should create a dataModelOptions object if there is not one already', function() {
      expect(widget.dataModelOptions).toBeDefined();
    });

    it('should use the dataModelOptions provided if they exist', function() {
      var previousDmo = { foo: 'bar' };
      var widget2 = { dataModelOptions: previousDmo };
      tableOptionsFactory({}, widget2, scope);
      expect(widget2.dataModelOptions === previousDmo).toEqual(true);
    });

    it('should set items on the dataModelOptions', function() {
      storage.setItem('testing123', 'foobar');
      expect(dmo.testing123).toBe('foobar');
    });

    it('should get items on the dataModelOptions', function() {
      dmo.foo = 'a test';
      expect(storage.getItem('foo')).toBe('a test');
    });

    it('should remove items from dataModelOptions', function() {
      dmo.foo = 'bar';
      storage.removeItem('foo');
      expect(dmo.foo).toBeUndefined();
    });

  });

});