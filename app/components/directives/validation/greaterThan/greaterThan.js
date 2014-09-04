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

angular.module('app.components.directives.validation.greaterThan', [])
.directive('greaterThan', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      
      // Re-run the parsers when the value being compared to
      // has changed.
      scope.$watch(attrs.greaterThan, function() {
        // hack to get $parsers to trigger
        // @see http://stackoverflow.com/questions/16284878/how-to-trigger-angular-parsers-without-inputing-anything-in-the-field
        var val = ngModel.$viewValue; 
        ngModel.$setViewValue(null);
        ngModel.$setViewValue(val);
      });

      // Ensure this is at the end of the parsers
      ngModel.$parsers.push(function(currentValue) {
        var minimumValue = scope.$eval(attrs.greaterThan) * 1;
        var valid = minimumValue < currentValue;
        ngModel.$setValidity('greaterThan', valid);
        return currentValue;
      });

    }
  };
});