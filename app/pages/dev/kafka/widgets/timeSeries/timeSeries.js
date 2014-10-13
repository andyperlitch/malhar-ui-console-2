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

angular.module('app.pages.dev.kafka.widgets.timeSeries', [])
  .directive('wtTimeSeries', function ($filter) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'pages/dev/kafka/widgets/timeSeries/timeSeries.html',
      scope: {
        data: '=data',
        metricValue: '=',
        excludeMetrics: '=',
        showTimeRange: '=',
        timeAxisFormat: '=?'
      },
      controller: function ($scope) {
        var filter = $filter('date');
        var numberFilter = $filter('number');

        $scope.summaryDateFormat = 'yyyy/MM/dd HH:mm:ss';
        $scope.dateFormat = 'HH:mm';

        $scope.xAxisTickFormatFunction = function () {
          return function (d) {
            return filter(d, $scope.timeAxisFormat);
          };
        };

        $scope.yAxisTickFormatFunction = function () {
          return function (d) {
            if (d > 999) {
              var value;
              var scale;
              if (d < 999999) {
                value = Math.round(d/1000);
                scale = 'k';
              } else {
                value = Math.round(d/1000000);
                scale = 'm';
              }
              return numberFilter(value) + scale;
            } else {
              return numberFilter(d);
            }
          };
        };

        $scope.xFunction = function () {
          return function (d) {
            return d.timestamp;
          };
        };
        $scope.yFunction = function () {
          return function (d) {
            return d.value;
          };
        };

        $scope.$watch('mode', function (mode) {
          if (mode) {
            $scope.dateFormat = getFormat(mode);
          }
        });
      },
      link: function postLink(scope) {
        scope.timeAxisFormat = scope.timeAxisFormat || 'HH:mm';

        scope.chartData = [{
          key: '',
          values: []
        }];

        if (scope.metricValue) {
          scope.metric = scope.metricValue;
        } else {
          scope.metric = null;
        }

        scope.metricChanged = function () {
          scope.$emit('metricChanged', scope.metric);
        };

        function updateChart(timeseries) {
          var values = _.map(timeseries, function (item) {
            return {
              timestamp: item.timestamp,
              value: item[scope.metric]
            };
          });

          scope.chartData = [{
            key: 'key',
            values: values
          }];
        }

        scope.$watch('data', function (data) {
          if (data && (data.length > 1)) {
            var timeseries = _.sortBy(data, function (item) {
              return item.timestamp;
            });

            var start = timeseries[0].timestamp;
            var end = timeseries[timeseries.length - 1].timestamp;
            scope.start = start;
            scope.end = end;

            var sampleObject = timeseries[0];
            var keys = _.keys(sampleObject);
            _.pull(keys, 'timestamp');

            if (scope.excludeMetrics) {
              _.remove(keys, function (metric) {
                return _.contains(scope.excludeMetrics, metric);
              });
            }

            keys = _.sortBy(keys, function (key) {
              return key;
            });

            scope.metrics = keys;
            if ((!scope.metric && (keys.length > 0)) || (scope.metric && !sampleObject.hasOwnProperty(scope.metric))) {
              sampleObject = _.clone(sampleObject);
              delete sampleObject.timestamp; // don't count timestamp
              var pairs = _.pairs(sampleObject);
              var maxPair = _.max(pairs, function (pair) {
                return pair[1]; //key value
              });
              scope.metric = maxPair[0];
            }

            updateChart(timeseries);
          }
        });
      }
    };
  });