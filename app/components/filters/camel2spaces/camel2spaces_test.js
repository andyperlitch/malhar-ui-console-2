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

describe('Filter: camel2spaces', function () {

  // load the service's module
  beforeEach(module('app.components.filters.camel2spaces'));

  // instantiate service
  var camel2spaces;
  beforeEach(inject(function ($filter) {
    camel2spaces = $filter('camel2spaces');
  }));

  it('should be a function', function() {
    expect(typeof camel2spaces).toEqual('function');    
  });

  it('should convert PascalCase to space-separated words', function() {
    var result = camel2spaces('ThisIsPascalCase');
    expect(result).toEqual('This Is Pascal Case');
  });

  it('should convert camelCase to space-separated words', function() {
    var result = camel2spaces('thisIsCamelCase');
    expect(result).toEqual('this Is Camel Case');
  });

  it('should group capitalized letters together', function() {
    expect(camel2spaces('HDFSPascalCase')).toEqual('HDFS Pascal Case');
  });

});