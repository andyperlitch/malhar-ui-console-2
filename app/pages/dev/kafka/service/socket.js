'use strict';

angular.module('app.pages.dev.kafka.socket', [])
  .factory('io', function ($window) {
    return $window.io;
  })
  .factory('Visibility', function ($window) { //TODO
    return $window.Visibility;
  })
  .provider('socket', function () {
    var visibilityTimeout = 20000;
    var webSocketURL;

    return {
      $get: function ($q, $rootScope, $timeout, $log, io, Visibility) {
        var socket = io.connect(webSocketURL);

        var deferred = $q.defer();

        socket.on('connect', function () {
          deferred.resolve();
          $rootScope.$apply(); //TODO
        });

        var stopUpdates = false;

        if (Visibility.isSupported()) {
          var timeoutPromise;

          Visibility.change(function (e, state) {
            if (state === 'hidden') {
              timeoutPromise = $timeout(function () {
                stopUpdates = true;
                timeoutPromise = null;
              }, visibilityTimeout);
            } else {
              stopUpdates = false;

              if (timeoutPromise) {
                $timeout.cancel(timeoutPromise);
              }

              $log.debug('visible');
            }
          }.bind(this));
        }

        return {
          subscribe: function (query, callback, $scope) {
            console.log('_sub', query);
            var resultCallback = this.createResultCallbackFunction(callback, $scope);
            var unregisterFn = this.createUnregisterFunction(query, resultCallback);

            this.addQueryCallback(query, resultCallback);
            this.sendSubscribe(query);

            // listen for the destroy to automatically unsubscribe
            $scope.$on('$destroy', angular.bind(this, unregisterFn));

            return unregisterFn;
          },

          sendSubscribe: function (query) {
            deferred.promise.then(function () {
              $log.debug('emit subscribe ' + query);
              socket.emit('subscribe', { query: query });
            });
          },

          addQueryCallback: function (query, callback) {
            deferred.promise.then(function () {
              $log.debug('addQueryCallback ' + query);
              socket.on(query, callback);
            });
          },

          sendUnsubscribe: function (query) {
            socket.emit('unsubscribe', { query: query });
          },

          createResultCallbackFunction: function (callback, $scope) {
            return function () {
              if (!stopUpdates) {
                callback.apply({}, arguments);
                $scope.$digest();
              }
            };
          },

          createUnregisterFunction: function (query, resultCallback) {
            var that = this;
            return function () {
              console.log('remove', query);
              socket.removeListener(query, resultCallback);
              var callbacks = socket._callbacks[query];
              if (_.isEmpty(callbacks)) {
                that.sendUnsubscribe(query);
              }
            };
          }
        };
      },

      setVisibilityTimeout: function (timeout) {
        visibilityTimeout = timeout;
      },

      setWebSocketURL: function (wsURL) {
        webSocketURL = wsURL;
      }
    };
  });
