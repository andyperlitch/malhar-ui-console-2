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

angular.module('app.components.directives.validation.uniqueInSet', [])

    /**
      * @ngdoc directive
      * @name app.components.directives.validation.uniqueInSet
      * @restrict A
      * @description Validation directive for ensuring that a value is unique given a set.
      * @param {Array}         uniqueInSet The set to compare against.
      * @param {String}        uniqueKey The key to be unique.
      * @param {Array|Object=} exclude An object or array of objects to exclude from the unique check. 
      *                                This can useful when the object is in the collection.
      * @example 
      * <pre>
      * <input type="text" ng-model="myModel" unique-in-set="allModels" unique-key="name" exclude="myModel">
      * </pre>
      * 
    **/
    
.directive('uniqueInSet', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      var collection = scope.$eval(attrs.uniqueInSet);
      var key = attrs.uniqueKey;

      if (!collection || !key) {
        return;
      }

      var exclude = scope.$eval(attrs.exclude);
      if (exclude) {
        exclude = [].concat(exclude);
      }

      ngModel.$parsers.unshift(function(value) {
        var unique = !_.any(collection, function(o) {
          if (exclude && exclude.indexOf(o) > -1) {
            return false;
          }
          return key ? o[key] === value : o === value;
        });
        ngModel.$setValidity('uniqueInSet', unique);
        return unique ? value : ngModel.$modelValue;
      });
    }
  };
});