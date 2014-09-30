'use strict';

angular.module('app.pages.dev.kafka.KafkaSocketService', [
  'app.pages.dev.kafka.socket'
])
  .factory('KafkaSocketService', function (socket) {
    function KafkaSocketService() {
    }

    angular.extend(KafkaSocketService.prototype, {
      createResultCallback: function (callback) {
        var that = this;
        return function (data) {
          //console.log(data);
          if (data && data.value) {
            var value = JSON.parse(data.value);

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
      },

      unsubscribe: function () {
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
