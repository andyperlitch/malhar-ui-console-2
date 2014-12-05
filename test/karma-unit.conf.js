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
 * Unit testing config
 */

var sharedConfig = require('./karma-shared.conf');
var argv = require('optimist').argv;

module.exports = function(config, chain) {
  var conf = sharedConfig();

  conf.files = conf.files.concat([
    //extra testing code
    'app/bower_components/angular-mocks/angular-mocks.js',
  ]);

  if (argv.f) {
    conf.files = conf.files.concat(argv.f);
  }

  else {
    conf.files = conf.files.concat([
      //test files
      'app/components/**/*_test.js',
      'app/pages/**/*_test.js',
      'app/app_test.js',
      'app/app-controller_test.js',
    ]);
  }

  conf.files = conf.files.concat([
    // template files
    'app/components/**/*.html',
    'app/pages/**/*.html'
  ]);

  
  conf.preprocessors = {
    // File locations
    'app/components/**/*.html': ['ng-html2js'],
    'app/pages/**/*.html': ['ng-html2js']
  };

  conf.ngHtml2JsPreprocessor = {
    // strip this from the file path
    stripPrefix: 'app/',

    // setting this option will create only a single module that contains templates
    // from all the files, so you can load them all with module('foo')
    moduleName: 'templates-main'
  };

  if (chain) {
    return conf;
  }
  config.set(conf);
};
