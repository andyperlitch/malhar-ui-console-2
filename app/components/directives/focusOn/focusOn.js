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

angular.module('app.components.directives.focusOn', [])
/**
 * @ngdoc directive
 * @name app.components.directives.directives:focusOn
 * @restrict A
 * @description Listens for the supplied event and puts focus on the element when this event is fired.
 * @element ANY
 * @param {String}        focusOn      The event to listen for and trigger focus.
 * @example 
 * <pre><input type="text" focus-on="myCustomEvent"></pre>
**/
.directive('focusOn', function() {
   return function(scope, elem, attr) {
      scope.$on(attr.focusOn, function() {
        elem[0].focus();
      });
   };
});