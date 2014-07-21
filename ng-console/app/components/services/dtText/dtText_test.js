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

describe('Service: dtText', function () {

  var $log;

  // load the service's module
  beforeEach(module('app.components.services.dtText', function($provide) {
    $provide.value('$log', $log = {
      warn: function() {}
    })
  }));

  // instantiate service
  var dtText;
  beforeEach(inject(function (_dtText_) {
    dtText = _dtText_;
  }));

  it('should be an object', function() {
    expect(typeof dtText).toEqual('object');
  });

  it('should have a get method', function() {
    expect(typeof dtText.get).toEqual('function');
  });

  describe('the get method', function() {
    
    it('should return the value if found in the text library', function() {
      var key = 'id_label';
      expect(typeof dtText.get(key)).toEqual('string');
    });

    it('should return the key itself if it was not found in the text library', function() {
      var key = 'something that is not in the map';
      expect(dtText.get(key) === key).toEqual(true);
    });

    it('should call $log.warn if the key is not found', function() {
      spyOn($log, 'warn');
      var key = 'something that is not in the map';
      dtText.get(key);
      expect($log.warn).toHaveBeenCalled();
    });

  });

});