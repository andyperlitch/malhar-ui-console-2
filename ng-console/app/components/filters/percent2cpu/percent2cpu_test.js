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

describe('Filter: percent2cpu', function() {

  var f;

  beforeEach(module('app.components.filters.percent2cpu'));

  beforeEach(inject(function(percent2cpuFilter) {
    f = percent2cpuFilter;
  }));

  it('should take a percentage as a first argument and return a string', function() {
    expect(typeof f(0.1)).toEqual('string');
  });

  it('should convert to CPU count to .01 precision', function() {
    expect(f(110)).toEqual('1.10');
  });

  it('should be able to take a string', function() {
    expect(f('126.1')).toEqual('1.26');
    expect(f('110')).toEqual('1.10');
  });

  it('should return "-" if the value passed is not a parseable number', function() {
    expect(f('not_number') === '-').toEqual(true);
    expect(f('') === '-').toEqual(true);
    expect(f() === '-').toEqual(true);
  });

});