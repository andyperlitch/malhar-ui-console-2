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

angular.module('app.components.directives.readableBytes', [
  'app.components.filters.byte'
])
.directive('readableBytes', function($filter) {

  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {

      var levels = { b: 1 };
      levels.kb = levels.k = 1024;
      levels.mb = levels.m = levels.kb * 1024;
      levels.gb = levels.g = levels.mb * 1024;
      levels.tb = levels.t = levels.gb * 1024;

      var parseRegExp = /^\s*([\d\.]+)\s*([a-zA-Z]+)$/;

      function fromUserString(text) {
        var matches = parseRegExp.exec(text);
        if (matches) {
          var qty = matches[1] * 1;
          var unit = matches[2].toLowerCase();

          if (!levels.hasOwnProperty(unit)) {
            ngModel.$setValidity('readableBytes', false);  
          }
          else {
            return qty * levels[unit];
          }
        }
        else {
          ngModel.$setValidity('readableBytes', false);
        }
      }

      function toUserString(text) {
        var string = $filter('byte')(text);
        if (string === '-') {
          return '';
        }
        return string;
      }


      ngModel.$parsers.push(fromUserString);
      ngModel.$formatters.push(toUserString);
    }
  };
});