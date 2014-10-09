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

angular.module('app.pages.dev.packages.package.dagEditor.directives.dagOperatorClass', [])
// Directive: Operator Class option
.directive('dagOperatorClass', function() {
  return {
    restrict:'A',
    link: function(scope, element) {

      // Make it draggable
      element.draggable({
        // let it go back to its original position
        revert:true,
        revertDuration: 0,
        zIndex: 1,
        helper: function(event) {
          // TODO: use the same routines that operators on the canvas use. We have reimplemented various filters below.
          var displayName = event.currentTarget.getAttribute('data-displayname');
          return $('<div class="dag-operator selected"><div class="dag-operator-content">'+
            '<h4 class="dag-operator-name">Operator</h4>'+
            '<h5 class="operator-class-name">' + displayName + '</h5>'+
          '</div></div>');
        },
        appendTo: 'body',
        cursorAt: { left: 130/2, top: 130/2 }
      });

    }
  };
});
