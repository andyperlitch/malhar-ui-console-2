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
  'ngMessages',
  'monospaced.mousewheel',
  'app.components.resources.ContainerLogModel',
  'app.components.resources.ContainerLogCollection',
  'app.components.directives.validation.readableBytes',
  'app.components.directives.validation.greaterThan',
  'app.components.directives.uiResizable',
  'app.components.services.getUri',
  'app.components.services.confirm',
  'app.components.services.dtText',
  'app.components.services.userStorage'
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
  .factory('getLogContent', function($http, $q, $routeParams, getUri, confirm, settings) {

    function getLogContent(log, params) {

      // Holds the finalized parameters to be passed to 
      // the request
      var queryParams = { includeOffset: true };

      // URL to send the request to
      var url = getUri.url('ContainerLog', $routeParams, $routeParams.logName);

      // Starting offset in bytes to get the file from
      queryParams.start = params.hasOwnProperty('start') ? params.start * 1 : 0;
      queryParams.end = params.hasOwnProperty('end') ? params.end * 1 : log.data.length * 1;

      // check that grep is not falsy
      if (params.grep) {
        queryParams.grep = params.grep;
      }

      var bytes = queryParams.end - queryParams.start;
      if (bytes > settings.containerLogs.CONFIRM_REQUEST_THRESHOLD_KB * 1024) {

        return confirm({
          bytes: bytes,
          downloadHref: getUri.url('ContainerLog', $routeParams, $routeParams.logName),
          templateUrl: 'pages/ops/appInstance/container/containerLog/confirmLargeRequest.html'
        })
        .then(function() {
          return $http.get(url, { params: queryParams });
        });
      }
      else if (bytes === 0) {
        return false;
      }

      return $http.get(url, { params: queryParams });
      
    }

    return getLogContent;
  })

  .directive('containerLogViewer', function() {
    return {
      link: function(scope, element) {
        // Set scroll listener
        element.on('scroll', function() {
          var scrollTop = element.scrollTop();
          if (element.scrollTop() === 0) {
            scope.prependToLog();
          }
          else if (scrollTop + element.outerHeight() >= element[0].scrollHeight) {
            scope.appendToLog();
          }
        });
        // Set wheel listener
        scope.onWheel = function($event, $delta, $deltaX, $deltaY) {
          var scrollTop = element.scrollTop();
          if (scrollTop === 0 && $deltaY > 0) {
            scope.prependToLog();
          } 
          else {  
            var bottom = scrollTop + element.outerHeight();
            var scrollHeight = element[0].scrollHeight;
            var scrollingDown = $deltaY < 0;
            
            if (bottom >= scrollHeight && scrollingDown) {
              scope.appendToLog();
            }
          }
        };
      }
    };
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
    dtText,
    userStorage
  ) {

    // Set up the download link
    $scope.downloadHref = getUri.url('ContainerLog', $routeParams, $routeParams.logName);

    // Params
    $scope.displayParams = {
      limit: 1000,
      offset: 0
    };

    // Set up initial height of viewport
    $scope.initialViewportHeight = userStorage.getItem(settings.containerLogs.VIEWPORT_HEIGHT_KEY) || settings.containerLogs.DEFAULT_HEIGHT;

    // Options for resizing the viewport
    $scope.resizableOptions = {
      handles: 's',
      stop: function(event, ui) {
        // update saved height of viewport
        userStorage.setItem(settings.containerLogs.VIEWPORT_HEIGHT_KEY, ui.size.height);
      }
    };

    // This holds the lines returned by the
    // API call with includeOffset turned on:
    //    { line: String, byteOffset: String offset }
    $scope.logContent = {
      lines: [],
      grep: '',
      grepMode: 'range',
      grepModes: [
        { value: 'range', description: 'within specified range' }, 
        { value: 'entire', description: 'over entire log' }
      ],
      manualRange: {},
      manualGrep: ''
    };

    $scope.$watch('logContent.start', function(newValue) {
      $scope.logContent.manualRange.start = newValue;
    });
    $scope.$watch('logContent.end', function(newValue) {
      $scope.logContent.manualRange.end = newValue;
    });

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

    /**
     * Retrieves the initially displayed content of
     * a log. Internally calls performQuery.
     * 
     * @return {Promise} Returns the promise returned by performQuery.
     */
    $scope.getInitialContent = function() {

      // Update log content parameters
      var logLength = 1 * $scope.log.data.length;
      $scope.logContent.manualRange.start = $routeParams.start || Math.max(0, settings.containerLogs.DEFAULT_START_OFFSET + logLength);
      $scope.logContent.manualRange.end = $routeParams.end || logLength;
      $scope.logContent.manualGrep = '';
      return $scope.performQuery();
      
    };

    // Requests 

    /**
     * Prepend log content from currently loaded position.
     * 
     * @return {Promise} A promise that is resolved/rejected with content request.
     */
    $scope.prependToLog = function() {
      
      // Check debounce flag
      if ($scope._prependingContent_ || $scope.preventScroll) {
        return;
      }
      $scope._prependingContent_ = true;

      // Set up param object to use with request
      var params = {
        grep: $scope.logContent.grep
      };

      // End at the current starting point
      params.end = $scope.logContent.start;

      // Start DEFAULT_SCROLL_REQUEST_KB kilobytes before that
      params.start = Math.max(0, params.end - settings.containerLogs.DEFAULT_SCROLL_REQUEST_KB);

      // Initiate the content request
      var promise = getLogContent($scope.log, params);

      if (typeof promise.then !== 'function') {
        return;
      }

      // Add the prependMessage to the scope
      $scope.prependMessage = {
        type: 'info',
        message: dtText.get('fetching log content...')
      };
      
      promise.then(function(res) {

        // Extract the lines from the response
        var linesToPrepend = res.data.lines;

        // Ensure we have something to add
        if (angular.isArray(linesToPrepend) && linesToPrepend.length) {

          if (!params.grep) {
            // connect that first line of the current
            // collection to the last line to prepend.
            var currentFirstLine = $scope.logContent.lines.shift();
            var lastLineToPrepend = linesToPrepend[linesToPrepend.length -1];
            lastLineToPrepend.line += currentFirstLine.line;
          }

          // Get current scroll position
          var $el = $('#container-log-viewer');
          var scrollHeight = $el[0].scrollHeight;
          var scrollTop = $el.scrollTop();

          // Defer scroll adjustment
          $timeout(function() {
            var newScrollHeight = $el[0].scrollHeight;
            var newScrollTop = newScrollHeight - scrollHeight + scrollTop;
            $el.scrollTop(newScrollTop);
          });

          // Update lines
          $scope.setLines(linesToPrepend.concat($scope.logContent.lines));
          $scope.logContent.start = params.start;

        }

        // Remove prepend message
        $scope.prependMessage = false;

      }, 
      // Error Handler
      function() {
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

    /**
     * Append log content from currently loaded position.
     * 
     * @return {Promise} A promise that is resolved/rejected with content request.
     */
    $scope.appendToLog = function() {

      // Check appending flag
      if ($scope._appendingContent_ || $scope.preventScroll) {
        return;
      }
      $scope._appendingContent_ = true;

      // Initialize params for request
      var params = {
        grep: $scope.logContent.grep
      };

      // Add the appendMessage to the scope
      $scope.appendMessage = {
        type: 'info',
        message: dtText.get('fetching log content...')
      };

      // First, get an updated picture of the log length
      var promise = $scope.log.fetch().then(function() {
        // Start at the current end
        params.start = ($scope.logContent.end * 1) + 1;

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

            if (!params.grep) {
              // Join last line of current and first line of new
              var currentLastLine = $scope.logContent.lines[$scope.logContent.lines.length - 1];
              var firstLineToAppend = linesToAppend.shift();
              currentLastLine.line += firstLineToAppend.line;
            }

            // Update lines
            $scope.setLines($scope.logContent.lines.concat(linesToAppend));
            $scope.logContent.end = params.end || $scope.log.data.length * 1;
          }

          // Clear out message
          $scope.appendMessage = false;
        },

        // error
        function(response) {
          if (response.status === 404) {
            $scope.appendMessage = {
              type: 'success',
              message: dtText.get('reached end of file.')
            };
            return;
          }
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

    /**
     * Performs a new query for log content based on the 
     * values of $scope.logContent.manualRange and 
     * $scope.logContent.manualGrep. These values are
     * used by the form just above the log viewer.
     * 
     * @return {Promise} A promise that is resolved/rejected with content request.
     */
    $scope.performQuery = function() {
      
      // Set flag to prevent accidental scrolling
      $scope.preventScroll = true;

      // Clear out current lines
      $scope.logContent.lines = [];

      // Set message
      $scope.appendMessage = {
        type: 'info',
        message: dtText.get('performing query...')
      };
      
      // Set up parameters
      var params = { includeOffset: true };

      // Cache grep value
      var grep = $scope.logContent.grep = $scope.logContent.manualGrep;

      if (grep && $scope.logContent.grepMode === 'entire') {
        params.start = 0;
        params.grep = grep;
      }
      else {
        params.start = $scope.logContent.manualRange.start;
        params.end = $scope.logContent.manualRange.end;
        params.grep = grep;
      }
      // Make call to getLogContent
      var promise = getLogContent($scope.log, params);

      // Check number of lines to be rendered
      promise.then(
        function(res) {
          var lines = res.data.lines;

          // Update current offsets
          $scope.logContent.start = params.start;
          $scope.logContent.end = params.end || lines[lines.length - 1].byteOffset + byteCount(lines[lines.length - 1].line);

          $scope.setLines(lines);

          if (!lines.length) {
            $scope.appendMessage = {
              type: 'warning',
              message: dtText.get('found no results')
            };
          }
          else {
            $scope.appendMessage = false;
          }
        },
        function() {
          $scope.appendMessage = {
            type: 'danger',
            message: dtText.get('An error occurred!')
          };
        }
      );

      promise.finally(function() {
        $scope.preventScroll = false;
      });

      return promise;
    };

    /**
     * Navigates to a specific section of the log.
     * Internally, calls $scope.performQuery.
     * 
     * @param  {Object} line The line object, returned by the gateway.
     * @return {Promise}      Returns the promise returned by performQuery.
     */
    $scope.goToLogLocation = function(line) {
      var byteOffset = line.byteOffset * 1;
      $scope.logContent.manualRange.start = Math.max(0, byteOffset - settings.containerLogs.GOTO_PADDING_BYTES);
      $scope.logContent.manualRange.end = byteOffset + settings.containerLogs.GOTO_PADDING_BYTES;
      $scope.logContent.manualGrep = '';
      return $scope.performQuery();
    };

    /**
     * Wrapper function for `$scope.logContent.lines = lines`. This
     * is so that if lines.length is very large, we can stop them all
     * from all rendering, and instead show a partial list.
     * 
     * @param {Array} lines Lines to be set to the scope.
     */
    $scope.setLines = function(lines) {
      $scope.logContent.lines = lines;
    };

  }); 