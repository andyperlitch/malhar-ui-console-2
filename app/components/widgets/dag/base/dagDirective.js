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

angular.module('app.components.widgets.dag.base',
  [
    'app.components.widgets.dag.DagRenderer',
    'app.components.directives.logicalDag.MetricModelFactory',
    'app.components.widgets.dag.DagHelper'
  ])
  .directive('dtDag', function (DagRenderer, DagHelper) {
    return {
      restrict: 'A',
      templateUrl: 'components/widgets/dag/base/dagDirective.html',
      replace: true,
      scope: true,
      controller: function ($scope, $element) {
        DagHelper.setupResize($scope);
        DagHelper.setupResetPositionAction($scope);

        angular.extend(this, {
          renderDag: function (logicalPlan) {
            $scope.renderer = new DagRenderer($element, logicalPlan);
            $scope.renderer.displayGraph();
          }
        });
      },
      link: function postLink(scope, element, attrs, ctrl) {
        scope.$emit('registerController', ctrl);
      }
    };
  });
