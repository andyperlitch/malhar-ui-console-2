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
describe('Filter: byte', function() {

  var f;

  beforeEach(module('app.components.filters.byte'));

  beforeEach(inject(function(byteFilter) {
    f = byteFilter;
  }));

  it('should format bytes', function() {
    expect(f('10')).toEqual('10 B');
  });

  it('should be able to specify what level is being supplied', function() {
    expect(f('2048', 'gb')).toEqual('2.0 TB');
  });

  it('should be able to handle mb', function() {
    expect(f('2048', 'kb')).toEqual('2.0 MB');
  });

  it('should be able to handle gb', function() {
    expect(f(3.5 * 1024 * 1024 * 1024)).toEqual('3.5 GB');
  });

  it('should return just bytes if number is negative', function() {
    expect(f('-35')).toEqual('-35 B');
  });

  it('should convert a string to a fixed tenths position number', function() {
    expect(f('2048') === '2.0 KB').toEqual(true);
  });

  it('should be able to handle uppercase level', function() {
    expect(f('2048', 'KB')).toEqual('2.0 MB');
    expect(f('2048', 'GB')).toEqual('2.0 TB');
  });

  it('should throw if the second argument is not an available level', function() {
    var fn = function() {
      f(2048, {});
    };
    expect(fn).toThrow();
  });

  it('should return "-" if a non-number is the first arg', function() {
    expect(f() === '-').toEqual(true);
    expect(f('not_a_number') === '-').toEqual(true);
    expect(f('') === '-').toEqual(true);
  });

});