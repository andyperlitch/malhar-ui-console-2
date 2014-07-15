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

describe('Filter: commaGroups', function() {
  
  var f;

  beforeEach(module('app.components.filters.commaGroups'));

  beforeEach(inject(function(commaGroupsFilter) {
    f = commaGroupsFilter;
  }));

  it('should exist', function() {
    expect(typeof f).toEqual('function');
  });

  it('should format number strings with commas every three places', function(){
    expect( f('1000000000')  === '1,000,000,000').toEqual(true);
  });

  it('should accept a number as an argument', function() {
    expect( f(1000000000)  === '1,000,000,000').toEqual(true);
  });

  it('should not format numbers less than 1000', function() {
    expect( f('893')  === '893').toEqual(true);
  });

  it('should return "-" if nothing is passed to it', function() {
    expect( f()  === '-').toEqual(true);
  });

});