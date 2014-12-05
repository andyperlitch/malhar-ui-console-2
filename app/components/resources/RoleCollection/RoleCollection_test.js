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

describe('Resource: RoleCollection', function () {

  // load the service's module
  var RoleModel, $q;
  beforeEach(module('app.components.resources.RoleCollection', function($provide) {
    RoleModel = function() {};
    RoleModel.prototype.transformResponse = jasmine.createSpy('transformResponse').and.callFake(function(obj) {
      obj.cool = 'the fonz';
      return obj;
    });
    RoleModel.prototype.save = jasmine.createSpy('save').and.callFake(function() {
      return $q.defer().promise;
    });
    $provide.value('webSocket', createService('webSocket'));
    $provide.value('RoleModel', RoleModel);
  }));

  // instantiate service
  var RoleCollection, rc;
  beforeEach(inject(function (_RoleCollection_, _$q_) {
    RoleCollection = _RoleCollection_;
    $q = _$q_;
    rc = new RoleCollection();
  }));

  describe('the transformResponse function', function() {
    
    var result;

    beforeEach(function() {
      result = rc.transformResponse({
        roles: [
          { name: 'frodo', permissions: [] },
          { name: 'gandalf', permissions: [] },
          { name: 'samwise', permissions: [] },
          { name: 'aragorn', permissions: [] }
        ]
      });
    });

    it('should call RoleModel\'s transformResponse', function() {
      expect(RoleModel.prototype.transformResponse.calls.count()).toEqual(4);
    });

    it('should sort the data according to name', function() {
      expect(result.map(function(r) {return r.name;})).toEqual(['aragorn', 'frodo', 'gandalf', 'samwise']);
    });

  });

  describe('the save function', function() {
    
    beforeEach(function() {
      rc.set([
        { name: 'frodo', permissions: [] },
        { name: 'gandalf', permissions: [] },
        { name: 'samwise', permissions: [] },
        { name: 'aragorn', permissions: [] }
      ]);
    });

    it('should call save for each role', function() {
      rc.save();
      expect(RoleModel.prototype.save.calls.count()).toEqual(4);
    });

  });

});