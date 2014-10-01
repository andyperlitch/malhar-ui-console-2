'use strict';

angular.module('app.pages.dev.kafka.KafkaSocketService', [
  'app.pages.dev.kafka.socket'
])
  .factory('KafkaSocketService', function ($timeout, $log, socket, clientSettings) {
    function KafkaSocketService() {
    }

    angular.extend(KafkaSocketService.prototype, {
      createResultCallback: function (callback) {
        var that = this;
        return function (data) {
          //console.log(data);
          if (data && data.value) {
            var value;
            try {
              value = JSON.parse(data.value);
            } catch (e) {
              $log.error(data.value);
              throw e;
            }

            if (that.query === value.id) { // ignore stale responses
              var valueData = value.data;
              callback(valueData, data); //TODO
            }
          } else {
            callback(null, data);
          }
        };
      },

      subscribe: function (query, callback, scope) {
        this.query = JSON.stringify(query);

        this.unsubscribe(); // unsubscribe from the last query
        var resultCallback = this.createResultCallback(callback);

        this.unregisterFn = socket.subscribe(this.query, resultCallback, scope);

        this.keepAliveTimeout = $timeout(function () {
          this.subscribe(query, callback, scope);
        }.bind(this), clientSettings.keepAliveInterval);
      },

      unsubscribe: function () {
        if (this.keepAliveTimeout) {
          $timeout.cancel(this.keepAliveTimeout);
        }
        if (this.unregisterFn) {
          this.unregisterFn();
        }
      },

      getQuery: function () {
        return this.query;
      }
    });

    return KafkaSocketService;
  });
