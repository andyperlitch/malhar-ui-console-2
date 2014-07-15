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

describe('Service: webSocket', function () {

  var webSocket, webSocketObject;

  beforeEach(module('app.components.services.webSocket', function(webSocketProvider) {
    webSocketObject = {
      send: function () {}
    };

    webSocketProvider.setWebSocketObject(webSocketObject);
  }));

  beforeEach(inject(function (_webSocket_) {
    webSocket = _webSocket_;
  }));

  it('should notify subscribers', function () {
    expect(webSocketObject.onmessage).toBeDefined();

    var listener1 = jasmine.createSpy();
    var listener2 = jasmine.createSpy();

    webSocket.subscribe('test', listener1);
    webSocket.subscribe('test', listener2);

    var message1 = { topic: 'test', data: { value: 100 } };
    webSocketObject.onmessage({ data: JSON.stringify(message1) });

    expect(listener1).toHaveBeenCalledWith({ value: 100 });
    expect(listener2).toHaveBeenCalledWith({ value: 100 });

    var message2 = { topic: 'test', data: { value: 50 } };
    webSocketObject.onmessage({ data: JSON.stringify(message2) });

    expect(listener1).toHaveBeenCalledWith({ value: 50 });
    expect(listener2).toHaveBeenCalledWith({ value: 50 });
  });

  it('should send message when WebSocket connection is opened', inject(function ($rootScope) {
    expect(webSocketObject.onopen).toBeDefined();

    spyOn(webSocketObject, 'send');

    webSocket.send({ value: 100 });

    expect(webSocketObject.send).not.toHaveBeenCalled(); // no connection yet

    webSocketObject.onopen();
    $rootScope.$apply(); // required for AngularJS promise resolution

    expect(webSocketObject.send).toHaveBeenCalled();
  }));

});