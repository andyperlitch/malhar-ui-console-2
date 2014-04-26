'use strict';

angular.module('dtConsoleApp.formatters', [])
  .filter('dtByteFilter', function() {
    // holds number of bytes per level
    var levels = { b: 1 };
    levels.kb = 1024;
    levels.mb = levels.kb * 1024;
    levels.gb = levels.mb * 1024;
    levels.tb = levels.gb * 1024;
    /**
     * Format a given number of bytes (or other unit)
     * @param  {number} bytes The number of bytes (or other unit) to format
     * @param  {string} level (optional) units of the bytes parameter (defaults to "b" for bytes, can be "kb", "mb", "gb", or "tb")
     * @return {string} returns human-readable string format
     */
    function byteFormatter(bytes, level) {
      var precision = 1;
      level = level || 'b';
      if (!levels.hasOwnProperty(level)) {
        throw new TypeError('byteFormatter 2nd argument must be one of the following: "b","kb","mb","gb","tb"');
      }
      bytes *= levels[level];

      if ((bytes >= 0) && (bytes < levels.kb)) {
        return bytes + ' B';

      } else if ((bytes >= levels.kb) && (bytes < levels.mb)) {
        return (bytes / levels.kb).toFixed(precision) + ' KB';

      } else if ((bytes >= levels.mb) && (bytes < levels.gb)) {
        return (bytes / levels.mb).toFixed(precision) + ' MB';

      } else if ((bytes >= levels.gb) && (bytes < levels.tb)) {
        return (bytes / levels.gb).toFixed(precision) + ' GB';

      } else if (bytes >= levels.tb) {
        return (bytes / levels.tb).toFixed(precision) + ' TB';

      } else {
        return bytes + ' B';
      }
    }
    return byteFormatter;
  })
  .filter('dtCpuFilter', ['$filter', function($filter) {
      function cpusFormatter(percent, isNumerator) {
  
        if (percent === '' || percent === false || percent === undefined) {
          return '-';
        }
  
        if (isNumerator) {
          percent /= 100;
        } else {
          percent *= 1;
        }
  
        if (isNaN(percent)) {
          return '-';
        }
  
        percent = percent.toFixed(2);
        return $filter('dtCommaGroups')(percent + '');
        
      }
      return cpusFormatter;
    }])
  .filter('dtCommaGroups', function() {
    function commaGroups(value) {
      if (typeof value === 'undefined') return '';
      var parts = value.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
    return commaGroups;
  })
  
  // function containerFormatter(value, row) {
  //   if (!value) return '-';
  //   var vals = value.split('_');
  //   var displayval = vals[vals.length -1];
  //   return templates.container_link({
  //     containerId: value,
  //     appId: row.collection ? row.collection.appId : null,
  //     containerIdShort: displayval
  //   });
  // }

  // function windowFormatter(windowIdObj) {
  //   if (! ( /\d{5,}/.test(windowIdObj) ) ) return windowIdObj;
  //   if (typeof windowIdObj !== 'object') {
  //     windowIdObj = new WindowId(windowIdObj);
  //   }
  //   return windowIdObj.toString();
  // }

  // function windowOffsetFormatter(windowIdObj) {
  //   if (!_.isObject(windowIdObj)) {
  //     windowIdObj = new WindowId(windowIdObj);
  //   }

  //   return windowIdObj.offset;
  // }

  // function statusClassFormatter(status) {
  //   return 'status-' + status.replace(/[^a-zA-Z]+/,'-').toLowerCase();
  // }

  // function logicalOpStatusFormatter(statuses) {
  //   var strings = _.map(statuses, function(val, key) {
  //         // return val.length + ' <span class="' + statusClassFormatter(key) + '">' + key + '</span>';
  //         return ' <span class="' + statusClassFormatter(key) + '" title="' + val.length + ' ' + key + '">' + val.length + '</span>';
  //       }, '');
  //   return strings.join(', ');
  // }

  // function percentageFormatter(value, isNumerator) {
  //   var multiplyBy = isNumerator ? 1 : 100;
  //   value = parseFloat(value).toFixed(3) * multiplyBy;
  //   value = value.toFixed(1);
  //   value = bormat.commaGroups(value);
  //   return value + '%';
  // }

