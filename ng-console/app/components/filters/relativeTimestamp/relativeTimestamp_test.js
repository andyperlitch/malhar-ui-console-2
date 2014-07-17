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

describe('Filter: relativeTimestamp', function() {
  
  beforeEach(module('app.components.filters.relativeTimestamp'));

  var f, now, dayStart, fullDateExpr, timeExpr;

  beforeEach(inject(function($filter) {
    f = $filter('relativeTimestamp');
    now = new Date();
    dayStart = +new Date(now.toDateString());
    fullDateExpr = /^\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}:\d{2} [AP]M$/;
    timeExpr = /^\d{1,2}:\d{2}:\d{2} [AP]M$/;
  }));

  describe('when a Date is passed', function() {
    
    it('should return just the time if the day is the same', function() {

      var d = new Date( dayStart + 1000 * 60 * 60 * 3 );
      expect(f(d)).toMatch(timeExpr);

    });

    it('should return the day and the time if the day is different', function() {

      var d = new Date( dayStart - 1000 * 60 * 60 * 8 );
      expect(f(d)).toMatch(fullDateExpr);
      
    });

    it('should return a hyphen if an invalid date was passed', function() {
      
      var d = new Date('My brothers car');
      expect(f(d)).toEqual('-');
    });

  });

  describe('when a number is passed', function() {
    
    it('should return just the time if the day is the same', function() {
      var d = dayStart + 1000 * 60 * 60 * 3;
      expect(f(d)).toMatch(timeExpr);
    });

    it('should return the day and the time if the day is different', function() {
      var d = dayStart - 1000 * 60 * 60 * 8;
      expect(f(d)).toMatch(fullDateExpr);
    });

  });

  describe('when anything other than a Date, number, or string get passed', function() {
    
    it('should return a hyphen', function() {
      
      expect(f()).toEqual('-');
      expect(f({})).toEqual('-');

    });

  });

  describe('when a string is passed', function() {
    
    it('should return just the time if the day is the same', function() {
      var d = dayStart + 1000 * 60 * 60 * 3;
      expect(f(d + '')).toMatch(timeExpr);
    });

    it('should return the day and the time if the day is different', function() {
      var d = dayStart - 1000 * 60 * 60 * 8;
      expect(f(d + '')).toMatch(fullDateExpr);
    });

    it('should return a hyphen if an invalid date was passed', function() {
      var d = 'My brothers car';
      expect(f(d)).toEqual('-');
    });

  });

});