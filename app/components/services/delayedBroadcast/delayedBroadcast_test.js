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

describe('Factory: delayedBroadcast', function () {

  // load the service's module
  beforeEach(module('app.components.services.delayedBroadcast'));

  // instantiate service
  var delayedBroadcast, $timeout, scope;
  beforeEach(inject(function (_delayedBroadcast_, $rootScope, _$timeout_) {
    scope = $rootScope.$new();
    $timeout = _$timeout_;
    delayedBroadcast = _delayedBroadcast_;
  }));

  it('should be a function', function() {
    expect(typeof delayedBroadcast).toEqual('function');
  });

  it('should broadcast the provided event after $timeout', function(done) {
    scope.$on('customEvent', function() {
      done();
    });
    delayedBroadcast('customEvent');
    $timeout.flush(200);
  });

  it('should use the provided delay', function() {
    var spy = jasmine.createSpy();
    scope.$on('customEvent', spy);
    delayedBroadcast('customEvent', 484);
    $timeout.flush(483);
    expect(spy).not.toHaveBeenCalled();
    $timeout.flush(484);
    expect(spy).toHaveBeenCalled();
  });

});