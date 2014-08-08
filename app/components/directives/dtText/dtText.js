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

angular.module('app.components.directives.dtText', [
  'app.components.services.dtText',
  'ui.bootstrap'
])
.config(function($tooltipProvider) {
  $tooltipProvider.options({
    popupDelay: 1000
  });
})
.directive('dtText', function (dtText) {
  return {
    restrict: 'A',
    scope: false,
    link: function postLink(scope, element, attrs) {
      var key = attrs.dtText || $.trim(element.text());
      element.text(dtText.get(key));
    }
  };
})
.directive('dtTextTitle', function(dtText) {
  return {
    restrict: 'A',
    scope: false,
    link: function postLink(scope, element, attrs) {
      element.attr('title', dtText.get(attrs.dtTextTitle));
    }
  };
})
.directive('dtTextTooltip', function(dtText, $compile) {
  return {
    restrict: 'A',
    scope: false,
    compile: function(tElement, attrs) {

      attrs.$set('tooltip', dtText.get(attrs.dtTextTooltip));
      tElement.removeAttr('dt-text-tooltip');
      var link = $compile(tElement);

      return function($scope, $element) {
        link($scope, function(clonedElement) {
          $element.replaceWith(clonedElement);
        });
      };
    }
  };
});
