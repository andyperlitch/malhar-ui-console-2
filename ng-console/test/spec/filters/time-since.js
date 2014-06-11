'use strict';

describe('Filter: timeSince', function () {

  // load the filter's module
  beforeEach(module('dtConsoleApp'));

  // initialize a new instance of the filter before each test
  var timeSince;
  beforeEach(inject(function ($filter) {
    timeSince = $filter('timeSince');
  }));

  it('should calculate the time since a given unix timestamp', function() {
    var now = +new Date();
    var timestamp = now - 176400000; // 2 days and 1 hour
    expect(timeSince(timestamp)).to.equal('2 days, 1 hour');
  });

  it('should be able to take a compare date in lieu of assuming the current timestamp', function() {
    var compare = +new Date() - 172800000; // 2 days from now
    var timestamp = compare - 3602000; // 1 hour and 2 seconds before compare
    expect(timeSince(timestamp, { compareDate: compare })).to.equal('1 hour, 2 seconds');
  });

  it('should be able to specify a max unit size', function() {
    var timestamp = +new Date() - 2419200000 - 604800000;
    expect(timeSince(timestamp)).to.equal('1 month, 1 week');
    expect(timeSince(timestamp, { maxUnit: 'day' })).to.equal('35 days');
  });

  it('should be able to output unix uptime format', function() {
    var timestamp = +new Date() - 2419200000 - 604800000 - 3720000; // 35 days, 1 hour, 2 minutes
    expect(timeSince(timestamp, {unixUptime: true})).to.equal('35 days, 1:02');
  });

  it('should be able to output unix uptime format for less than 24 hours', function() {
    var timestamp = +new Date() - 3600000 - 120000 - 3000; // 1 hour, 2 minutes, 3 seconds
    expect(timeSince(timestamp, {unixUptime: true})).to.equal('01:02:03');
  });

  it('should be able to take a time chunk', function() {
    expect(timeSince({timeChunk: 3600000})).to.equal('1 hour');
  });

});
