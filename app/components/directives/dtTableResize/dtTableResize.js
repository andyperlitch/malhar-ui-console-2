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

angular.module('app.components.directives.dtTableResize', [])
.directive('dtTableResize', function($timeout) {

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {

      var onResize = function($event, updates) {
        if (!updates.hasOwnProperty('height')) {
          return;
        }
        var fullHeight = updates.height;
        var paletteHeight = element.find('.palette').outerHeight(true);
        var headerHeight = element.find('.mlhr-header-table').outerHeight(true);
        var contentPadding = parseInt(element.parents('.widget-content').css('padding-bottom'));
        var resizerHeight = element.parents('.widget').find('.widget-s-resizer').height();
        options.bodyHeight = fullHeight - paletteHeight - headerHeight - contentPadding - resizerHeight;
        if(!scope.$$phase) {
          scope.$digest();
        }
      };

      var options = scope.$eval(attrs.options);

      var initHeight = parseInt(scope.widget.size.height);

      if (initHeight) {
        $timeout(function() {
          onResize({}, { height: initHeight });
        });
      }

      scope.$on('widgetResized', onResize);
    }
  };
});