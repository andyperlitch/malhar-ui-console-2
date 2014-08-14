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

describe('Factory: extend', function () {

  // load the service's module
  beforeEach(module('app.components.services.extend'));

  // instantiate service
  var extend;
  beforeEach(inject(function (_extend_) {
    extend = _extend_;
  }));

  it('should add extend to the child class', function() {
    function Parent() {}
    Parent.extend = extend;

    var Child = Parent.extend({});

    expect(Child.extend).toEqual(extend);
  });

  describe('when the constructor is provided', function() {
    
    it('should use the provided function as the constructor', function() {
      
      function Parent() {
        this.isParent = true;
      }
      Parent.extend = extend;

      var Child = Parent.extend({
        constructor: function() {
          this.isParent = false;
        }
      });

      var c = new Child();

      expect(c.isParent).toEqual(false);

    });

  });

});