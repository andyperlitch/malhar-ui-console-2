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

describe('Factory: PhysicalOperatorCollection', function () {

  // load the service's module
  beforeEach(module('app.components.resources.PhysicalOperatorCollection', function($provide) {
    $provide.value('webSocket', { subscribe: jasmine.createSpy() });
  }));

  // instantiate service
  var PhysicalOperatorCollection;
  beforeEach(inject(function (_PhysicalOperatorCollection_) {
    PhysicalOperatorCollection = _PhysicalOperatorCollection_;
  }));

  describe('transformResponse', function() {
    
    it('should just be the string "operators" when only appId is specified', function() {
        
      var c = new PhysicalOperatorCollection({
        appId: 'application_1'
      });

      expect(c.transformResponse).toEqual('operators');

    });

    it('should be a function that filters response.operators when containerId or operatorName is specified', function() {
      
      var c = new PhysicalOperatorCollection({
        appId: 'application_1',
        containerId: '1'
      });

      expect(typeof c.transformResponse).toEqual('function');

      var response = {
        operators: [
          { id: '1', container: '1', name: 'console' },
          { id: '2', container: '1', name: 'generator' },
          { id: '3', container: '2', name: 'console' },
          { id: '4', container: '3', name: 'generator' },
          { id: '5', container: '1', name: 'console' }
        ]
      };

      expect(c.transformResponse(response)).toEqual([
        response.operators[0],
        response.operators[1],
        response.operators[4]
      ]);

      var c2 = new PhysicalOperatorCollection({
        appId: 'application_1',
        operatorName: 'console'
      });

      expect(c2.transformResponse(response)).toEqual([
        response.operators[0],
        response.operators[2],
        response.operators[4]
      ]);

    });

  });

});