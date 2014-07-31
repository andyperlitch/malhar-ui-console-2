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

angular.module('app.components.widgets.dag.physical.logicalDag',
  [
    'app.components.directives.logicalDag.LogicalDagRenderer',
    'app.components.directives.logicalDag.MetricModelFactory'
  ])
  .directive('dtLogicalDag', function (LogicalDagRenderer, LogicalDagHelper) {
    return {
      restrict: 'A',
      templateUrl: 'components/widgets/dag/logical/logicalDagDirective.html',
      scope: true,
      controller: function ($scope, $element) {
        angular.extend(this, {
          renderDag: function (logicalPlan) {
            $scope.renderer = new LogicalDagRenderer($element, logicalPlan);
            $scope.renderer.displayGraph();
          },

          updateMetrics: function (collection) {
            $scope.updateMetrics(collection);
          }
        });
      },
      link: function postLink(scope, element, attrs, ctrl) {
        LogicalDagHelper.setupActions(scope);
        LogicalDagHelper.setupMetrics(scope);

        scope.$emit('registerController', ctrl);
      }
    };
  })
  .factory('LogicalDagHelper', function (dtText, MetricModelFactory) {
    return {
      setupActions: function (scope) {
        scope.showLocality = false;
        scope.toggleLocality = function (event) {
          event.preventDefault();

          scope.showLocality = !scope.showLocality;

          if (scope.showLocality) {
            if (scope.renderer) {
              scope.renderer.updateStreams();
            }
          } else {
            if (scope.renderer) {
              scope.renderer.clearStreamLocality();
            }
          }
        };

        scope.resetPosition = function (event) {
          event.preventDefault();
          if (scope.renderer) {
            scope.renderer.resetPosition();
          }
        };
      },
      setupMetrics: function (scope) {
        scope.metrics = [
          {
            value: 'none',
            label: 'None'
          },
          {
            value: 'tuplesProcessedPSMA',
            label: dtText.get('processed_per_sec')
          },
          {
            value: 'tuplesEmittedPSMA',
            label: dtText.get('emitted_per_sec')
          },
          {
            value: 'latencyMA',
            label: dtText.get('latency_ms_label')
          },
          {
            value: 'partitions',
            label: dtText.get('num_partitions_label')
          },
          {
            value: 'containerIds',
            label: dtText.get('num_containers_label')
          },
          {
            value: 'cpuPercentageMA',
            label: dtText.get('cpu_sum_label')
          },
          {
            value: 'lastHeartbeat',
            label: dtText.get('last_heartbeat_label')
          },
          {
            value: 'currentWindowId',
            label: dtText.get('current_wid_title')
          },
          {
            value: 'recoveryWindowId',
            label: dtText.get('recovery_wid_title')
          },
          {
            value: 'totalTuplesProcessed',
            label: dtText.get('processed_total')
          },
          {
            value: 'totalTuplesEmitted',
            label: dtText.get('emitted_total')
          }
        ];

        scope.metric1 = scope.metrics[1];
        scope.metricModel = MetricModelFactory.getMetricModel(scope.metric1.value);
        scope.metric2 = scope.metrics[2];
        scope.metricModel2 = MetricModelFactory.getMetricModel(scope.metric2.value);

        //TODO use ng-model in select
        scope.$watch('metric1', function (metric) {
          scope.metricModel = MetricModelFactory.getMetricModel(metric.value);
          if (scope.collection) {
            scope.metricModel.update(scope.collection);
            scope.renderer.updateMetricLabels(scope.metricModel);
          }
        });
        scope.$watch('metric2', function (metric) {
          scope.metricModel2 = MetricModelFactory.getMetricModel(metric.value);
          if (scope.collection) {
            scope.metricModel2.update(scope.collection);
            scope.renderer.updateMetric2Labels(scope.metricModel2);
          }
        });

        scope.updateMetrics = function (collection) {
          scope.collection = collection;

          if (scope.renderer && !scope.metricModel.isNone()) {
            scope.metricModel.update(collection);
            //console.log(scope.renderer);
            scope.renderer.updateMetricLabels(scope.metricModel);
          }

          if (scope.renderer && !scope.metricModel2.isNone()) {
            scope.metricModel2.update(collection);
            scope.renderer.updateMetric2Labels(scope.metricModel2);
          }
        };
      }
    };
  });
