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

angular.module('dtConsoleApp')
  .directive('dtState', function () {
    return {
      restrict: 'A',
      template: '<span class="status-running">{{value}}</span>',
      scope: {
        value: '='
      },
      link: function postLink(scope, element) {
        //element.text(DtText.get(scope.key));
        //scope.value = 'abc';
        function stateFormatter(value, row) {
          if (!value) {
            return '-';
          }
          var finalStatus = row.finalStatus;
          var html = '<span class="status-' + value.replace(' ', '-').toLowerCase() + '">' + value + '</span>';
          if (typeof finalStatus === 'string' && finalStatus.toLowerCase() !== 'undefined') {
            html += ' <small class="final-status" title="Final Status">(' + finalStatus + ')</small>';
          }
          return html;
        }
      }
    };
  });


/*
 angular.module('dtConsoleApp')
 .directive('compile', ['$compile', function ($compile) {
 return function(scope, element, attrs) {
 scope.$watch(
 function(scope) {
 // watch the 'compile' expression for changes
 return scope.$eval(attrs.compile);
 },
 function(value) {
 // when the 'compile' expression changes
 // assign it into the current DOM
 element.html(value);

 // compile the new DOM and link it to the current
 // scope.
 // NOTE: we only compile .childNodes so that
 // we don't get into infinite loop compiling ourselves
 $compile(element.contents())(scope);
 }
 );
 };
 }]);
 */
