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

angular.module('app.components.directives.appState', [])
.directive('appState', function () {
  return {
    restrict: 'A',
    scope: {
      state: '=appState',
      finalStatus: '='
    },
    link: function postLink(scope, element, attrs) {

      console.log("scope.state", scope.state);
      console.log("attrs.state", attrs.state);
      console.log("element.attr('state')", element.attr('state'));
      console.log("scope.finalStatus", scope.finalStatus);
      console.log("attrs.finalStatus", attrs.finalStatus);
      console.log("element.attr('finalStatus')", element.attr('final-status'));
      

      if (!scope.state) {
        element.html('-');
        return;
      }

      var html = '<span class="status-' + scope.state.toLowerCase() + '">' + scope.state + '</span>';
      if (scope.finalStatus && scope.finalStatus !== 'UNDEFINED') {
        html += ' <small class="final-status" title="Final Status">' + scope.finalStatus + '</small>';
      }
      element.html(html);
    }
  };
});
