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

angular.module('app.components.directives.windowId', [
  'app.components.filters.relativeTimestamp',
  'jsbn.BigInteger'
])
.directive('windowId', function(BigInteger) {

  return {
    scope: {
      windowId: '=',
      windowSize: '='
    },
    templateUrl: 'components/directives/windowId/windowId.html',
    link: function(scope) {

      var watchHandler = function() {

        var raw = scope.windowId;

        // Convert to "long"
        var value = new BigInteger(raw);

        // Offset is lower 16 bits
        scope.offset = value.and(new BigInteger('0x00000000ffffffff',16)).toString() * 1;

        // Check if windowSize
        if (scope.windowSize) {
          
          // Basetime is upper 16 bits, in seconds
          var basetime = new Date((value.shiftRight(32).toString() + '000') * 1);

          // Add offset * windowSize to basetime
          scope.timestamp = (scope.windowSize * scope.offset) + basetime.valueOf();
        }

        // Otherwise unset
        else {
          scope.timestamp = null;
        }

      };

      scope.$watch('windowId', watchHandler);
      // TODO: only watch once
      scope.$watch('windowSize', watchHandler);
    }
  };

});