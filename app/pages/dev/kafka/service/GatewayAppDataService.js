'use strict';

angular.module('app.pages.dev.kafka.GatewayAppDataService', [
  'app.pages.dev.kafka.socket'
])
  .factory('GatewayAppDataService', function ($timeout, $log, webSocket, clientSettings) {
    function GatewayAppDataService() {
    }

    angular.extend(GatewayAppDataService.prototype, {
      createResultCallback: function (callback, topic) {
        var that = this;
        return function (result) {
          if (result && result.id && (result.id === that.queryId)) { // ignore stale responses
            var data = result.data;
            callback(data, result);
          }
        };
      },

      sendQuery: function (query, queryTopic) {
        var q = _.clone(query);
        q.id = JSON.stringify(query);
        this.queryId = q.id;
        var message = { type : 'publish', topic : queryTopic, data : JSON.stringify(q) };
        webSocket.send(message);

        this.keepAliveTimeout = $timeout(function () {
          this.sendQuery(query, query.gateway.queryTopic);
        }.bind(this), clientSettings.keepAliveInterval);
      },

      subscribe: function (query, callback, scope) {
        this.query = query;

        this.unsubscribe(); // unsubscribe from the last query

        this.topic = query.gateway.resultTopic;
        this.resultCallback = this.createResultCallback(callback, JSON.stringify(this.query.keys));

        this.unsubscribeCallback = webSocket.subscribe(this.topic, this.resultCallback, scope);

        this.sendQuery(query, query.gateway.queryTopic);
      },

      unsubscribe: function () {
        if (this.keepAliveTimeout) {
          $timeout.cancel(this.keepAliveTimeout);
        }
        if (this.unsubscribeCallback && this.topic) {
          webSocket.unsubscribe(this.topic, this.unsubscribeCallback);
        }
      },

      getQuery: function () {
        return this.query;
      }
    });

    return GatewayAppDataService;
  });
