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
  beforeEach(module('app.components.resources.Base', function($provide) {
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

});