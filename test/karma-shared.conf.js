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

/**
 * Shared testing config
 */

var path = require('path');
var fs = require('fs');

// This code block reads index.html and 
// extracts all the relative-path scripts
// into the variable script_srcs. Also,
// "app/" is prepended to the paths so it
// works from the repository's root directory.
var index = fs.readFileSync(path.normalize(__dirname + '/../app/index.html'), 'utf8');
var externalRE = /src="(?![a-z]+:\/\/)[^"]+"/g;
var script_srcs = index.match(externalRE).map(function (str) {
  return str.replace('src="','app/').replace('"','');
});

module.exports = function() {
  return {
    // Set base as the repository's
    // root directory
    basePath: '../',

    // Choose a testing framework
    frameworks: ['jasmine'],

    // The browser(s) that will run the tests
    browsers: ['Chrome'],

    // Automatically watch files
    autoWatch: true,

    // Report type (usually 'dots')
    reporters: ['dots'],

    // these are default values anyway
    singleRun: false,
    colors: true,
    
    // Start the files 
    files : script_srcs.concat([
      
      // test framework-related code
      'app/bower_components/angular-mocks/angular-mocks.js'

    ])
  };
};
