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

angular.module('app.pages.dev.packages.package.dagEditor.directives.dagPort', [])
.directive('dagPort', function() {
  return {
    link: function(scope) {

      // set the port class
      scope.endpoint.addClass('dag-port');

      // get the overlay
      var overlay = scope.endpoint.getOverlay('label');

      // Watch to see if selected is this port
      scope.$watch('selected', function(selected) {
        if (selected === scope.port) {
          // debugger;
          scope.endpoint.addClass('selected');
          overlay.addClass('selected');
        }
        else {
          scope.endpoint.removeClass('selected');
          overlay.removeClass('selected');
        }
      });

      // Set click listener to endpoint
      scope.endpoint.bind('click', function(endpoint, event) {
        event.stopPropagation();
        scope.$emit('selectEntity', 'port', scope.port);
      });

      scope.endpoint.bind('mouseenter', function() {
        overlay.addClass('hover');
      });

      scope.endpoint.bind('mouseleave', function() {
        overlay.removeClass('hover');
      });

      scope.endpoint.bind('destroy', function() {
        scope.$destroy();
      });

    }
  };
});