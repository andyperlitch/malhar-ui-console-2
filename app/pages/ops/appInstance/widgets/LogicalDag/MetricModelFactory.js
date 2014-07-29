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

angular.module('app.components.directives.logicalDag.MetricModelFactory', [
  'app.components.directives.logicalDag.MetricModel'
])
  .factory('MetricModelFactory', function (MetricModel) {
    return {
      getMetricModel: function (metricId) {
        return new MetricModel({
          metricId: metricId,
          implementation: this.metrics[metricId]
        });
      },
      metrics: {
        none: {
          showMetric: function () {
            return false;
          }
        },

        tuplesProcessedPSMA: {
          showMetric: function (id, map) {
            var value = map[id];
            return (map.hasOwnProperty(id) && value > 0);
          },

          ngFilter: 'commaGroups'
        },

        tuplesEmittedPSMA: {
          showMetric: function (id, map) {
            var value = map[id];
            return (map.hasOwnProperty(id) && value > 0);
          },

          ngFilter: 'commaGroups'
        },

        latencyMA: {
          showMetric: function (id, map) {
            var value = map[id];
            return (map.hasOwnProperty(id) && value > 0);
          },

          ngFilter: 'number'
        },

        partitions: {
          showMetric: function (id, map) {
            return map.hasOwnProperty(id);
          },

          valueToString: function (value) {
            return value.length;
          }
        },

        containerIds: {
          showMetric: function (id, map) {
            return map.hasOwnProperty(id);
          },

          valueToString: function (value) {
            return value.length;
          }
        },

        cpuPercentageMA: {
          showMetric: function (id, map) {
            return map.hasOwnProperty(id);
          },

          valueToString: function (value) {
            return (value * 1).toFixed(2) + '%';
          }
        },

        lastHeartbeat: {
          showMetric: function (id, map) {
            return map.hasOwnProperty(id);
          },

          ngFilter: 'relativeTimestamp'
        },

        currentWindowId: {
          showMetric: function (id, map) {
            return map.hasOwnProperty(id);
          },

          ngFilter: 'windowOffset'
        },

        totalTuplesProcessed: {
          showMetric: function (id, map) {
            var value = map[id];
            return (map.hasOwnProperty(id) && value > 0);
          },

          ngFilter: 'commaGroups'
        },

        totalTuplesEmitted: {
          showMetric: function (id, map) {
            var value = map[id];
            return (map.hasOwnProperty(id) && value > 0);
          },

          ngFilter: 'commaGroups'
        },

        recoveryWindowId: {
          showMetric: function (id, map) {
            return map.hasOwnProperty(id);
          },

          ngFilter: 'windowOffset'
        }
      }
    };
  });