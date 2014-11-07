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

describe('Factory: authentication', function () {

  var userSession;

  // load the service's module
  beforeEach(module('app.components.services.authentication', function($provide) {
    $provide.value('userSession', userSession = {
      create: jasmine.createSpy(),
      destroy: jasmine.createSpy(),
      authStatus: undefined
    });
  }));

  // instantiate service
  var authentication;
  beforeEach(inject(function (_authentication_) {
    authentication = _authentication_;
  }));

  describe('isEnabled method', function() {
    
    it('should return true if userSession.authStatus is true OR undefined', function() {
      userSession.authStatus = undefined;
      expect(authentication.isEnabled()).toEqual(true);
      delete userSession.authStatus;
      expect(authentication.isEnabled()).toEqual(true);
      userSession.authStatus = true;
    });

    it('should return false if userSession.authStatus is false', function() {
      userSession.authStatus = false;
      expect(authentication.isEnabled()).toEqual(false);
    });

  });


});