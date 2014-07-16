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

describe('Resource: ApplicationModel', function() {
  
  var ApplicationModel, BaseModel, mockWebSocket;

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
  }));

  it('should be a function', function() {
    expect(typeof ApplicationModel).toEqual('function');
  });

});