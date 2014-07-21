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

describe('Factory: StramEventsWidgetDataModel', function () {

  // load the service's module
  beforeEach(module('app.pages.ops.appInstance.widgets.StramEvents'));

  // instantiate service
  var StramEventsWidgetDataModel;
  beforeEach(inject(function (_StramEventsWidgetDataModel_) {
    StramEventsWidgetDataModel = _StramEventsWidgetDataModel_;
  }));

  it('should be a function', function() {
    expect(typeof StramEventsWidgetDataModel).toEqual('function');
  });


});