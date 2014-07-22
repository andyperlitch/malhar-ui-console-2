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

angular.module('app.components.directives.logicalDag',
    ['app.components.directives.logicalDag.LogicalDagRenderer'])
  .directive('dtLogicalDag', function (LogicalDagRenderer) {
    return {
      restrict: 'A',
      templateUrl: 'pages/ops/appInstance/widgets/LogicalDag/logicalDagDirective.html',
      scope: {
        appId: '=',
        logicalPlan: '='
      },
      link: function postLink(scope, element, attrs) {
        scope.values = ['option1', 'option2', 'option3'];
        scope.value = scope.values[0];

        //TODO unwatch
        scope.$watch('logicalPlan', function (logicalPlan) {
          if (logicalPlan) {
            scope.renderer = new LogicalDagRenderer(element, logicalPlan);
            scope.renderer.displayGraph();
          }
        });

        scope.showLocality = false;
        scope.toggleLocality = function (event) {
          event.preventDefault();

          scope.showLocality = !scope.showLocality;

          if (scope.showLocality) {
            //toggleLocalityLink.text('Hide Stream Locality');
            //legend.show();
            if (scope.renderer) {
              //scope.renderer.updateStreams(); //TODO
            }
          } else {
            //toggleLocalityLink.text('Show Stream Locality');
            //this.clearStreamLocality(this.svgRoot); //TODO
            //legend.hide();
          }
        }
      }
    };
  });
