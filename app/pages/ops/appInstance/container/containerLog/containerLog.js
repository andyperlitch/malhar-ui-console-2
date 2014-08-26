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

angular.module('app.pages.ops.appInstance.container.containerLog', [
  'ngRoute',
  'app.settings',
  'app.components.resources.ContainerLogModel',
  'app.components.resources.ContainerLogCollection',
  'app.components.directives.readableBytes',
  'app.components.services.getUri',
  'app.components.services.confirm',
  'app.components.services.dtText'
])
  // Route
  .config(function($routeProvider, settings) {
    $routeProvider
      .when(settings.pages.ContainerLog, {
        controller: 'ContainerLogCtrl',
        templateUrl: 'pages/ops/appInstance/container/containerLog/containerLog.html',
        label: 'containerLog',
        collection: {
          label: 'logs',
          resource: 'ContainerLogCollection',
          resourceParams: ['appId', 'containerId'],
          templateUrl: 'pages/ops/appInstance/container/containerLog/breadcrumbTemplate.html',
          orderBy: 'name'
        }
      });
  })

  // Counts the bytes of a string
  .factory('byteCount', function() {

    return function byteCount(s) {
      return encodeURI(s).split(/%..|./).length - 1;
    };

  })

  // Retrieves the log content (wrapper for $http.get).
  // Used to ensure the user is informed if they are about
  // to download the entire 200 mb file into the browser
  .factory('getLogContent', function($http, $q, $routeParams, getUri, confirm, settings, dtText, $filter) {

    function getLogContent(log, params) {

      var url = getUri.url('ContainerLog', $routeParams, $routeParams.logName);
      var start = params.start * 1 || 0;
      var end = params.end * 1 || log.data.length * 1;

      // check that grep is not falsy
      if (!params.grep) {
        delete params.grep;
      }

      var bytes = end - start;
      if (bytes > settings.containerLogs.CONFIRM_REQUEST_THRESHOLD_KB * 1024) {
        return confirm({
          title: 'Confirm large request',
          body: dtText.get(
            'Are you sure you want to load ' + 
            $filter('byte')(end - start) +
            ' into your browser?')
        })
        .then(function() {
          return $http.get(url, { params: params });
        });
      }

      return $http.get(url, { params: params });
      
    }

    return getLogContent;
  })

  // Controller
  .controller('ContainerLogCtrl', function(
    $scope,
    $routeParams,
    $location,
    $http,
    $timeout,
    settings,
    ContainerLogModel,
    ContainerLogCollection,
    getUri,
    byteCount,
    getLogContent,
    dtText
  ) {

    // Cache main log view window
    var $el = $('#container-log-viewer');
    $el.on('scroll', function() {
      var scrollTop = $el.scrollTop();
      if ($el.scrollTop() === 0) {
        $scope.prependToLog();
      }
      else if (scrollTop + $el.outerHeight() >= $el[0].scrollHeight) {
        $scope.appendToLog();
      }
    });

    // This holds the lines returned by the
    // API call with includeOffset turned on:
    //    { line: String, byteOffset: String offset }
    $scope.logContent = {
      lines: [],
      grep: '',
      grepMode: 'current',
      grepModes: [
        { value: 'current', description: 'loaded lines' }, 
        { value: 'range', description: 'specify byte range' }, 
        { value: 'entire', description: 'entire log' }
      ],
      grepRange: {}
    };

    // Set up resources
    $scope.logs = new ContainerLogCollection({
      appId: $routeParams.appId,
      containerId: $routeParams.containerId
    });

    $scope.log = new ContainerLogModel({
      appId: $routeParams.appId,
      containerId: $routeParams.containerId,
      name: $routeParams.logName
    });

    $scope.logs.fetch().then(function(res) {
      var container = $scope.log.transformResponse({ logs: res });
      $scope.log.set(container);
      $scope.getInitialContent();
    });

    // Set location based on select change
    $scope.onJumpToLog = function() {
      var params = _.extend({}, $routeParams, { logName: $scope.logToJumpTo.name });
      var newUrl = getUri.page('ContainerLog', params, true);
      $location.path(newUrl);
    };

    $scope.getInitialContent = function() {

      // Update log content parameters
      var logLength = 1 * $scope.log.data.length;
      $scope.logContent.start = Math.max(0, settings.containerLogs.DEFAULT_START_OFFSET + logLength);
      $scope.logContent.end = logLength;
      
      // Set up log content model
      getLogContent($scope.log, {
        includeOffset: true,
        start: $scope.logContent.start,
        end: $scope.logContent.end
      })
      .then(function(res) {
        $scope.logContent.lines = res.data.lines;
      }, function() {
        $scope.logContent.error = 'Error retrieving log content';
      });

    };

    $scope.onWheel = function($event, $delta, $deltaX, $deltaY) {
      var scrollTop = $el.scrollTop();
      if (scrollTop === 0 && $deltaY > 0) {
        $scope.prependToLog();
      }
      else {
        var bottom = scrollTop + $el.outerHeight();
        var scrollHeight = $el[0].scrollHeight;
        var scrollingDown = $deltaY < 0;
        
        if (bottom >= scrollHeight && scrollingDown) {
          $scope.appendToLog();
        }
      }
    };

    // Requests 

    /**
     * Prepend log content from currently loaded position.
     * @return {Promise} A promise that is resolved/rejected with content request.
     */
    $scope.prependToLog = function() {
      
      // Check debounce flag
      if ($scope._prependingContent_) {
        return;
      }
      $scope._prependingContent_ = true;

      // Set up param object to use with request
      var params = {
        includeOffset: true
      };

      // End at the current starting point
      params.end = $scope.logContent.start;

      // Start DEFAULT_SCROLL_REQUEST_KB kilobytes before that
      params.start = Math.max(0, params.end - settings.containerLogs.DEFAULT_SCROLL_REQUEST_KB);

      // Add the prependMessage to the scope
      $scope.prependMessage = {
        type: 'info',
        message: dtText.get('fetching log content...')
      };

      // Initiate the content request
      var promise = getLogContent($scope.log, params);
      
      promise.then(function(res) {

        // Extract the lines from the response
        var linesToPrepend = res.data.lines;

        // Ensure we have something to add
        if (angular.isArray(linesToPrepend) && linesToPrepend.length) {

          // connect that first line of the current
          // collection to the last line to prepend.
          var currentFirstLine = $scope.logContent.lines.shift();
          var lastLineToPrepend = linesToPrepend[linesToPrepend.length -1];
          lastLineToPrepend.line += currentFirstLine.line;

          // Get current scroll position
          var scrollHeight = $el[0].scrollHeight;
          var scrollTop = $el.scrollTop();

          // Defer scroll adjustment
          $timeout(function() {
            var newScrollHeight = $el[0].scrollHeight;
            var newScrollTop = newScrollHeight - scrollHeight + scrollTop;
            $el.scrollTop(newScrollTop);
          });

          // Update lines
          $scope.logContent.lines = linesToPrepend.concat($scope.logContent.lines);
          $scope.logContent.start = params.start;

        }

        // Remove prepend message
        $scope.prependMessage = false;

      });

      promise.error(function() {
        $scope.prependMessage = {
          type: 'danger',
          message: dtText.get('an error occurred! ')
        };
      });

      promise.finally(function() {
        // Unset the flag after RETRIEVE_DEBOUNCE_WAIT
        $timeout(function() {
          $scope._prependingContent_ = false;
        }, settings.containerLogs.RETRIEVE_DEBOUNCE_WAIT);
      });

      return promise;

    };

    $scope.appendToLog = function() {

      // Check appending flag
      if ($scope._appendingContent_) {
        return;
      }
      $scope._appendingContent_ = true;

      // Initialize params for request
      var params = {
        includeOffset: true
      };

      // Add the appendMessage to the scope
      $scope.appendMessage = {
        type: 'info',
        message: dtText.get('fetching log content...')
      };

      // First, get an updated picture of the log length
      var promise = $scope.log.fetch().then(function() {
        // Start at the current end
        params.start = $scope.logContent.end * 1;

        // If we aren't near the end of the log, specify 
        // an end parameter, DEFAULT_SCROLL_REQUEST_KB kilobytes
        // after the start.
        if ($scope.log.data.length - params.start > settings.containerLogs.DEFAULT_SCROLL_REQUEST_KB) {
          params.end = params.start + settings.containerLogs.DEFAULT_SCROLL_REQUEST_KB;
        }
        return getLogContent($scope.log, params);
      });

      promise.then(
        // success
        function(res) {
          var linesToAppend = res.data.lines;
          // Ensure we have something to add
          if (angular.isArray(linesToAppend) && linesToAppend.length) {
            // Join last line of current and first line of new
            var currentLastLine = $scope.logContent.lines[$scope.logContent.lines.length - 1];
            var firstLineToAppend = linesToAppend.shift();
            currentLastLine.line += firstLineToAppend.line;

            // Update lines
            $scope.logContent.lines = $scope.logContent.lines.concat(linesToAppend);
            $scope.logContent.start = params.start;
          }

          // Clear out message
          $scope.appendMessage = false;
        },

        // error
        function() {
          $scope.appendMessage = {
            type: 'danger',
            message: dtText.get('an error occurred! ')
          };
        }
      );

      promise.finally(function() {
        $timeout(function() {
          $scope._appendingContent_ = false;
        }, settings.containerLogs.RETRIEVE_DEBOUNCE_WAIT);
      });

      return promise;

    };

    $scope.performGrep = function() {
      console.log('grepping', $scope.logContent);
    };

  });