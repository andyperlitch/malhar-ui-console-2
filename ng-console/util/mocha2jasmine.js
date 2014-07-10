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

var fs = require('fs');
var argv = require('optimist').argv;
var testFileName = argv._[0];
var contents;
try {
  contents = fs.readFileSync(testFileName, 'utf8');
} catch (e) {
  console.log('Error reading file: ', e);
  process.exit(1);
}

// to.equal
contents = contents.replace(/expect\((.*)\)\.to\.equal\((.*)\)/g, 'expect($1 === $2).toEqual(true)');

// to.eql
contents = contents.replace(/expect\((.*)\)\.to\.eql\((.*)\)/g, 'expect($1).toEqual($2)');

// to.be.a(n)
contents = contents.replace(/expect\((.*)\)\.to\.be\.an?\((.*)\)/g, 'expect(typeof $1).toEqual($2)');

fs.writeFileSync(testFileName, contents);

console.log(testFileName + ' written.');
process.exit(0);