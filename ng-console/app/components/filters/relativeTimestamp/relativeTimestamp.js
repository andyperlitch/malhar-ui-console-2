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

angular.module('app.components.filters.relativeTimestamp', [])
.filter('relativeTimestamp', function() {
  return function relativeTimestamp(date) {

    // first check if this is not already a Date
    if (!(date instanceof Date)) {

      // then check if number
      if (typeof date === 'number') {
        date = new Date(date);
      }

      // then check for string
      else if (typeof date === 'string') {

        // check for all digits
        if (/^\d+$/.test(date)) {
          date = new Date(date * 1);
        }
        // otherwise give it a shot
        else {
          date = new Date(date);
        }

      }

      else {
        return '-';
      }

    }

    if (date.toString() === 'Invalid Date') {
      return '-';
    }

    var nowDay = new Date().toDateString();

    return nowDay === date.toDateString() ? date.toLocaleTimeString() : date.toLocaleString();

  };

});