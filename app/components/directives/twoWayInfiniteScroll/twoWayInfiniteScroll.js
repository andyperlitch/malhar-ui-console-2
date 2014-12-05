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

angular.module('app.components.directives.twoWayInfiniteScroll', [
  'app.settings',
  'app.components.directives.dtSpinner',
  'app.components.services.dtText',
  'app.components.directives.dtText',
  'monospaced.mousewheel'
])

/**
 * @ngdoc directive
 * @name  app.components.directives.twoWayInfiniteScroll
 * @restrict A
 * @description  Bidirectional infinite scroll. Takes an array plus an item template and uses ng-repeat to create a 
 *               two-way scrollable list. When the user scrolls to the top or bottom, a prepend function or append
 *               function (respectively) get called with one argument: a deferred object. Those functions are then
 *               responsible for either resolving that deferred with an array containing 0 or more items, or reject
 *               the deferred to indicate that an error has occurred. Alternatively, the client code may resolve the
 *               deferred with a string, which will result in a display message, e.g. "Reached top of log file", or
 *               resolve with an object containing a message and a timeout. See the example.
 * @param {function} init The initializer function. Similar to prepend and append, this receives one 
 *                        argument, a deferred object that should resolve with the initial items array
 *                        to be rendered.
 * @param {function} prepend The prepending function. Takes a deferred as one argument which can be resolved or rejected
 *                           as explained in the main description.
 * @param {function} append The appending function. Takes a deferred as one argument which can be resolved or rejected
 *                           as explained in the main description.
 * @param {string} itemTemplateUrl The url of a template for the rows.
 * @param {object=} addToScope  An object containing key/value pairs that get added to the inner scope. Useful when the item
 *                              template needs to access something from the outside scope. Note: it is not recommended to do
 *                              object literal notation directly in the attribute value. This can lead to some strange results.
 * @param {string=} itemClass A class to attach to each item.
 * @example
 * <example module="app">
    <file name="app.js">
      var app = angular.module('app', ['app.components.directives.twoWayInfiniteScroll']);
      app.controller('MainCtrl', function($scope, myDataService) {
        $scope.my = {
          initFn: function(dfd) {
            myDataService.get().then(function(items) {
              if (items.length) {
                dfd.resolve(items);
                return;
              }

              dfd.resolve({ message: "No items found!", timeout: 2000 }); // message will disappear after 2 seconds
              // dfd.resolve("No items found!") <-- also acceptable, but with no timeout
            }, dfd.reject );
          },
          prependFn: function(dfd) {
            myDataService.getPrevious().then(dfd.resolve, dfd.reject);
          },
          apppendFn: function(dfd) {
            myDataService.getNext().then(dfd.resolve, dfd.reject);
          }
        }
      });
    </file>
    <file name="index.html">
      <div two-way-infinite-scroll="my.options" 
        init="my.initFn"
        prepend="my.prependFn"
        append="my.appendFn"
        item-class="my-item"
        item-template-url="my.options.itemTemplateUrl">
      </div>
    </file>
   </example>
 */
     
.directive('twoWayInfiniteScroll', function(settings, $q, $log, $timeout) {

  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'components/directives/twoWayInfiniteScroll/twoWayInfiniteScroll.html',
    scope: {
      options: '=?',
      init: '=',
      prepend: '=',
      append: '=',
      itemClass: '@',
      resetOn: '@?',
      addToScope: '=?',
      itemTemplateUrl: '='
    },
    link: function(scope, element) {

      $log.debug('Initializing twoWayInfiniteScroll', element);

      // Holds pending request flags
      scope.isPending = {};

      // Holds $timeout promises when a message is going to close
      var closePromise = {};

      // Will hold positive messages (e.g. "Reached end of file")
      scope.okMessage = {};
      scope.errMessage = {};

      // The inner div
      var innerScroller = window.innerScroller = element.find('.twi-scroll-inner');

      // Holds pre-result height of inner div
      var initInnerHeight;

      // Success Handlers
      var successHandler = {
        prepend: function (items) {
          scope.items = items.concat(scope.items);
          $timeout(function() {
            var newScrollPosition = innerScroller.height() - initInnerHeight;
            element.scrollTop(newScrollPosition);
          });
        },
        append: function (items) {
          scope.items = scope.items.concat(items);
        }
      };


      // Called when user scrolls to top of list
      function schedule(type) {
        
        // Cancel if there is a pending call
        if (scope.isPending[type] || scope.isPending.reset) {
          return;
        }

        // Calculate inner height
        initInnerHeight = innerScroller.height();

        // Clear a timeout if present, set the no results flag
        // back to nothing.
        if (closePromise[type]) {
          $timeout.cancel(closePromise[type]);
          delete closePromise[type];
        }
        delete scope.okMessage[type];
        delete scope.errMessage[type];

        // Deferred to pass to the (client code) prepend/append function.
        // Client code is responsible for resolving or rejecting.
        var dfd = $q.defer();

        // Set the pending request flag
        scope.isPending[type] = true;

        // Set the resolve/reject handlers
        dfd.promise.then(

          // SUCCESS HANDLER, triggered with dfd.resolve in client code
          function(items) {

            $log.debug('twoWayInfiniteScroll: ' + type + ' promise resolved with ', items);

            // Main case: we get an array back.
            if (_.isArray(items)) {
              // Call the type-specific successHandler
              successHandler[type](items);
              return;
            }
            
            // Otherwise, we assume an error did not occur in the request,
            // just that no results were found.
            
            // message: This will get displayed at the top of the scroller
            // timeout: (optional) an optional time after which to hide the message
            var message, timeout;

            // If result is object, we assume this structure:
            // { message: 'custom message', timeout: 10000 }
            if (_.isObject(items)) {
              if (items.hasOwnProperty('message')) {
                message = items.message;
                timeout = items.timeout; // will be undefined if not present, which is OK.
              }
            }
            // If anything else, just set message to this.
            else {
              message = items;
            }

            // Check for a message
            if (message) {

              // Holds message to be displayed
              scope.okMessage[type] = message;

              // Check for a specified timeout
              if (timeout) {
                closePromise[type] = $timeout(function() {
                  // Unset the message
                  delete scope.okMessage[type];
                }, timeout);
              }
            }
          },

          // ERROR HANDLER, triggered with dfd.reject in client code
          function(reason) {

            // message: This will get displayed at the top of the scroller
            // timeout: (optional) an optional time after which to hide the message
            var message, timeout;

            // Same assumptions as success handler with no array of results.
            if (_.isObject(reason)) {
              if (reason.hasOwnProperty('message')) {
                message = reason.message;
                timeout = reason.timeout;
              }
            }
            else {
              message = reason;
            }

            $log.debug('twoWayInfiniteScroll: ' + type + ' promise rejected because: ', reason);
            scope.errMessage[type] = message;

            if (timeout) {
              closePromise[type] = $timeout(function() {
                delete scope.errMessage[type];
              }, timeout);
            }

          }
        ).then(function() {

          // unset the pending flag
          scope.isPending[type] = false;

        });

        $log.debug('twoWayInfiniteScroll: Calling ' + type + ' function');

        // CALL CLIENT CODE
        scope[type](dfd);

      }

      function reset(promise) {

        // Set flag for initializing state
        scope.isPending.reset = true;

        promise.then(
          function(items) {
            scope.items = items;
            if (!items.length) {
              scope.okMessage.reset = 'No results.';
            }
          },
          function(reason) {
            scope.errMessage.reset = reason;
          }
        ).then(function() {
          scope.isPending.reset = false;
        });

      }

      // Call the init function
      scope.$watch('init', function(fn) {
        if (typeof fn === 'function') {
          var initDfd = $q.defer();
          reset(initDfd.promise);
          fn(initDfd);
        }
      });

      // Add things to inner scope
      scope.$watch('addToScope', function() {
        if (angular.isObject(scope.addToScope)) {
          for (var k in scope.addToScope) {
            scope[k] = scope.addToScope[k];
          }
        }
      }, true); 

      // Set the scroll events
      element.on('scroll', function() {
        var scrollTop = element.scrollTop();
        var outerHeight = element.outerHeight();
        if (scrollTop === 0) {
          schedule('prepend');
        }
        else if (scrollTop + outerHeight >= element[0].scrollHeight) {
          schedule('append');
        }
      });

      // Set wheel listener
      scope.onWheel = function($event, $delta, $deltaX, $deltaY) {
        var scrollTop = element.scrollTop();
        if (scrollTop === 0 && $deltaY > 0) {
          schedule('prepend');
        } 
        else {  
          var bottom = scrollTop + element.outerHeight();
          var scrollHeight = element[0].scrollHeight;
          var scrollingDown = $deltaY < 0;
          
          if (bottom >= scrollHeight && scrollingDown) {
            schedule('append');
          }
        }
      };

      // Reset on this event
      if (scope.resetOn) {
        scope.$on(scope.resetOn, function(event, promise) {
          reset(promise);
        });
      }

      // Decorate the options
      if (scope.options) {
        scope.options.getItems = function() {
          return scope.items;
        };
      }
    }
  };

});