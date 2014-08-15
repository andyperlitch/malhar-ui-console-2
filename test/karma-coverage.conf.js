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
 * Unit testing + Coverage report config
 */
var sharedConfig = require('./karma-unit.conf');

module.exports = function(config, chain) {
  var conf = sharedConfig(config, true);

  if (conf.reporters.indexOf('coverage') === -1) {
    conf.reporters.push('coverage');  
  }

  // tell karma how you want the coverage results
  conf.coverageReporter = {
    type : 'html',
    // where to store the report
    dir : 'coverage/'
  };

  // here we specify which of the files we want to appear in the coverage report
  conf.preprocessors['app/components/**/!(*_test)+(.js)'] = ['coverage'];
  conf.preprocessors['app/pages/**/!(*_test)+(.js)'] = ['coverage'];
  conf.preprocessors['app/app!(*_test)+(.js)'] = ['coverage'];

  if (chain) {
    return conf;
  }

  config.set(conf);
};
