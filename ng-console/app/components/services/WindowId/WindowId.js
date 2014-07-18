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

angular.module('app.components.services.WindowId', [
  'jsbn.BigInteger'
])
.factory('WindowId', function(BigInteger, $log) {

  function WindowId(value, STREAMING_WINDOW_SIZE_MILLIS) {

    this.STREAMING_WINDOW_SIZE_MILLIS = STREAMING_WINDOW_SIZE_MILLIS;  
    this.set(value);

  }

  WindowId.prototype = {
      
      set: function(value) {
          value = this.value = '' + value;

          // Check for initial values of 0 and -1
          if (value === '-1' || value === '0' || value === 'undefined') {
              this.basetime = null;
              this.offset = null;
              return;
          }

          if (/[^0-9]/.test(value)) {
              $log.warn('WindowId first param not in expected format: ', value);
              this.basetime = null;
              this.offset = null;
              return;
          }
    
          var full64 = new BigInteger(this.value);
      
          this.basetime = new Date((full64.shiftRight(32).toString() + '000') * 1);
      
          this.offset = full64.and(new BigInteger('0x00000000ffffffff',16)).toString() * 1;

          if (this.STREAMING_WINDOW_SIZE_MILLIS) {
            this.timestamp = new Date((this.offset * this.STREAMING_WINDOW_SIZE_MILLIS) + this.basetime.valueOf());
          }
          
      },

      setWindowSize: function(STREAMING_WINDOW_SIZE_MILLIS) {

        this.STREAMING_WINDOW_SIZE_MILLIS = STREAMING_WINDOW_SIZE_MILLIS;
        if (this.basetime && this.offset) {
          this.timestamp = new Date((this.offset * this.STREAMING_WINDOW_SIZE_MILLIS) + this.basetime.valueOf());
        }

      }
      
  };

  return WindowId;

});