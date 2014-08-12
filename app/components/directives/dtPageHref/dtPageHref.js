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

/**
 * dt-page-href
 *
 * Looks up page url in settings
 * and interpolates params, then
 * sets the href of the element
 * to interpolated url.
 */

angular.module('app.components.directives.dtPageHref', [
  'app.components.services.getUri'
])
.directive('dtPageHref', function(getUri) {

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {

      // set up pageKey and params
      var pageKey = attrs.dtPageHref;

      // watch for changes to the expression
      scope.$watch(
        attrs.params, 
        function() {
          element.attr('href', getUri.page(pageKey, scope.$eval(attrs.params) ));
        },
        true
      );

    }
  };
});