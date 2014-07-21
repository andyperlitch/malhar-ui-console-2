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

describe('Resource: LogicalOperatorCollection', function () {

  var mockWebSocket;

  beforeEach(function() {
    mockWebSocket = {
      send: function() {},
      subscribe: function() {},
      unsubscribe: function() {}
    };
  });

  beforeEach(module('app.components.resources.LogicalOperatorCollection', function($provide) {
    $provide.value('webSocket', mockWebSocket);
  }));

  // instantiate service
  var LogicalOperatorCollection;
  beforeEach(inject(function (_LogicalOperatorCollection_) {
    LogicalOperatorCollection = _LogicalOperatorCollection_;
  }));

  it('should be a function', function() {
    expect(typeof LogicalOperatorCollection).toEqual('function');
  });

  it('should have a topicKey and urlKey', function() {
    expect(LogicalOperatorCollection.prototype.urlKey).toBeDefined();
    expect(LogicalOperatorCollection.prototype.topicKey).toBeDefined();
  });

  it('should have a string for transformResponse', function() {
    expect(LogicalOperatorCollection.prototype.transformResponse).toEqual('operators');
  });

});