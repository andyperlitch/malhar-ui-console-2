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

describe('Filter: timeSince', function () {

  // load the filter's module
  beforeEach(module('app.components.filters.timeSince'));

  // initialize a new instance of the filter before each test
  var timeSince;
  beforeEach(inject(function (timeSinceFilter) {
    timeSince = timeSinceFilter;
  }));

  it('should calculate the time since a given unix timestamp', function() {
    var now = +new Date();
    var timestamp = now - 176400000; // 2 days and 1 hour
    expect(timeSince(timestamp) === '2 days, 1 hour').toEqual(true);
  });

  it('should be able to take a compare date in lieu of assuming the current timestamp', function() {
    var compare = +new Date() - 172800000; // 2 days from now
    var timestamp = compare - 3602000; // 1 hour and 2 seconds before compare
    expect(timeSince(timestamp, { compareDate: compare }) === '1 hour, 2 seconds').toEqual(true);
  });

  it('should be able to specify a max unit size', function() {
    var timestamp = +new Date() - 2419200000 - 604800000;
    expect(timeSince(timestamp) === '1 month, 1 week').toEqual(true);
    expect(timeSince(timestamp, { maxUnit: 'day' }) === '35 days').toEqual(true);
  });

  it('should be able to output unix uptime format', function() {
    var timestamp = +new Date() - 2419200000 - 604800000 - 3720000; // 35 days, 1 hour, 2 minutes
    expect(timeSince(timestamp, {unixUptime: true}) === '35 days, 1:02').toEqual(true);
  });

  it('should be able to output unix uptime format for less than 24 hours', function() {
    var timestamp = +new Date() - 3600000 - 120000 - 3000; // 1 hour, 2 minutes, 3 seconds
    expect(timeSince(timestamp, {unixUptime: true}) === '01:02:03').toEqual(true);
  });

  it('should be able to output unix uptime format when none of the places need leading zeroes', function() {
    var timestamp = +new Date() - (36000000 + 3600000) - 1260000 - 39000; // 11 hours, 21 minutes, 39 seconds
    expect(timeSince(timestamp, {unixUptime: true})).toEqual('11:21:39');
  });

  it('should say "day" instead of "days" when there is only one', function() {
    var timestamp = +new Date() - (1000*60*60*24 *1) - (1000*60*60 *12) - (1000*60 *21) - (1000 *32); // 1 day, 12 hours, 21 minutes, 32 seconds
    expect(timeSince(timestamp, {unixUptime: true})).toEqual('1 day, 12:22');
  });

  it('should be able to take a max_level', function() {
    var timestamp = +new Date() - (1000*60*60*24 *3) - (1000*60*60 *10) - (1000*60 *51) - (1000 *9); // 3 days, 10 hours, 51 minutes, 32 seconds
    expect(timeSince(timestamp, {max_level: 3})).toEqual('3 days, 10 hours, 51 minutes');
  });

  it('should be able to take a time chunk', function() {
    expect(timeSince({timeChunk: 3600000}) === '1 hour').toEqual(true);
  });

});
