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

var _ = require('lodash');
var fs = require('fs');
var path = require('path');

// Walks a directory and gets an array of filenames
function walk (dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) {
      return done(err);
    }
    var pending = list.length;
    if (!pending) {
      return done(null, results);
    }
    list.forEach(function(file) {
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) {
              done(null, results);
            }
          });
        } else {
          results.push(file);
          if (!--pending) {
            done(null, results);
          }
        }
      });
    });
  });
}

/**
 * ADD LICENSE HEADERS
 * 
 * Scans js folders for all js files without the proper license
 * headers.
 */
function addLicenseHeaders(options) {
    var include = options.include;
    var exclude = options.exclude;
    var year = (new Date()).getFullYear();
  var license_re = require('./license_regex');
    var license_string = require('./license_header')();

  function doneFn (err, list) {

    if (err) {
      console.log('An error occurred: ', err);
    } else {
      var included = _.filter(list, function(item) {
            
                // Only test js files
                if (!/\.js$/.test(item)) {
                    return false;
                }

                // Filter result variable
                var include = true;

                // Perform exclusions
                exclude.forEach(function(ex) {

                    // Test for regex excludes
                    if (ex instanceof RegExp) {
                        if (ex.test(item)) {
                            include = false;
                            return;
                        }
                    }
                    // Test for string excludes
                    else {
                        if (ex === item) {
                            include = false;
                            return;   
                        }
                    }
                });

                return include;

      });
      var already = 0;
      _.each(included, function(filepath) {
        var contents = fs.readFileSync(filepath, 'utf8');
                var match = license_re.exec(contents);
        if (!match) {
          fs.writeFileSync(filepath, license_string + contents);
          console.log('added license headers to: ' + filepath);
        } else if (match[1] != year) {
            console.log('updating year: ' + filepath);
            fs.writeFileSync(filepath, contents.replace(license_re, license_string));
        } else {
          already++;
        }
      });

      console.log(already + ' files already had license headers');
    }

  }

    include.forEach(function(incl) {
        walk(path.normalize(__dirname + incl), doneFn);
    });
}

addLicenseHeaders({
    include: [
      '/../app'
    ],
    exclude: [
        /app\/bower_components\//
    ]
});