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

angular.module('app.components.directives.opPropertyValue', [
  'app.components.directives.viewRawInModal',
  'app.components.directives.dtText'
])
.directive('opPropertyValue', function() {

  var defaultMaxStringLength = 50;

  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'components/directives/opPropertyValue/opPropertyValue.html',
    scope: {
      name: '=',
      value: '='
    },
    link: function(scope) {

      switch( typeof scope.value ) {
        case 'string':
          scope.displayValue = scope.value;
          if (scope.value.length > defaultMaxStringLength) {
            scope.viewInModal = true;
            scope.truncatedValue = scope.value.substr(0, defaultMaxStringLength - 3) + '...';
          }
        break;
        case 'object':
          var stringified = scope.displayValue = JSON.stringify(scope.value);
          if (stringified.length > defaultMaxStringLength) {
            scope.viewInModal = true;
            scope.truncatedValue = stringified.substr(0, defaultMaxStringLength - 3) + '...';
          }
        break;
        case 'number':
          scope.displayValue = scope.value;
        break;
      }
    }
  };
});