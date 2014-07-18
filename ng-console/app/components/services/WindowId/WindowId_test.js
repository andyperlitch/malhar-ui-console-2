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

/* global describe, before, beforeEach, after, afterEach, inject, it, expect, module */

describe('Factory: WindowId', function () {

  // load the service's module
  beforeEach(module('app.components.services.WindowId'));

  // instantiate service
  var WindowId;
  beforeEach(inject(function (_WindowId_) {
    WindowId = _WindowId_;
  }));

  var windowId;
  var windowValue = '5896637953039405386';
  var windowOffset = 4426;
  var windowBasetime = 1372918010000;
  var STREAMING_WINDOW_SIZE_MILLIS = '500';

  beforeEach(function() {
    windowId = new WindowId(windowValue);
  });
  
  afterEach(function() {
    windowId = undefined;
  });
  
  it('should be a function', function() {
    expect(typeof WindowId).toEqual('function');
  });

  it('basetime should be a Date', function() {
    expect(windowId.basetime instanceof Date).toBeTruthy();
  });
  
  it('should have basetime, offset, and value', function() {
    expect( windowId.basetime.valueOf()  === windowBasetime).toEqual(true);
    expect(windowId.offset === windowOffset).toEqual(true);
    expect(windowId.value === windowValue).toEqual(true);
  });
  
  it('should have a set method that allows you to change the value', function() {
    expect(typeof windowId.set).toEqual('function');
    windowId.set('5896637953039405387');
    expect(windowId.basetime.valueOf() === 1372918010000).toEqual(true);
    expect(windowId.offset === 4427).toEqual(true);
    expect(windowId.value === '5896637953039405387').toEqual(true);
  });

  it('should not throw if no arguments passed', function() {
    var fn = function() {
      return new WindowId();
    };
    expect(fn).not.toThrow();
  });
  
  it('should not throw even if first arg is non-numeric string', function() {
    var fn = function() {
      return new WindowId('343k18ia');
    };
    expect(fn).not.toThrow();
  });

  it('should not set a timestamp if setWindowSize is called on a WindowId whose basetime/offset are not set', function() {
    var w = new WindowId('343k18ia');
    w.setWindowSize(STREAMING_WINDOW_SIZE_MILLIS);
    expect(w.STREAMING_WINDOW_SIZE_MILLIS).toEqual(STREAMING_WINDOW_SIZE_MILLIS);
    expect(w.timestamp).toBeUndefined();
  });

  describe('when the window width is supplied in the constructor', function() {
    
    beforeEach(function() {
      windowId = new WindowId(windowValue, STREAMING_WINDOW_SIZE_MILLIS);
    });

    it('should create a timestamp, where timestamp=(offset*window_size)+basetime', function() {
      expect(windowId.timestamp.valueOf()).toEqual( windowOffset*STREAMING_WINDOW_SIZE_MILLIS + windowBasetime );
    });

    it('should set STREAMING_WINDOW_SIZE_MILLIS on the object', function() {
      expect(windowId.STREAMING_WINDOW_SIZE_MILLIS).toEqual(STREAMING_WINDOW_SIZE_MILLIS);
    });

  });

  describe('when the window width is supplied with setWindowSize method', function() {
    
    beforeEach(function() {
      windowId.setWindowSize(STREAMING_WINDOW_SIZE_MILLIS);
    });

    it('should create a timestamp, where timestamp=(offset*window_size)+basetime', function() {
      expect(windowId.timestamp.valueOf()).toEqual( windowOffset*STREAMING_WINDOW_SIZE_MILLIS + windowBasetime );
    });

    it('should set STREAMING_WINDOW_SIZE_MILLIS on the object', function() {
      expect(windowId.STREAMING_WINDOW_SIZE_MILLIS).toEqual(STREAMING_WINDOW_SIZE_MILLIS);
    });

  });

});