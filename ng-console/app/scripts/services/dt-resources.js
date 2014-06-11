'use strict';

angular.module('dtConsoleApp')
.factory('AbstractPubSub', function(webSocket) {
  function AbstractPubSub() {
    this.handlers = [];
  }
  
  AbstractPubSub.prototype = {
    subscribe: function(fn) {
      webSocket.subscribe(this.topic, fn);
      this.handlers.push(fn);
    },
    unsubscribe: function(fn) {
      var topic = this.topic;
      if (typeof fn === 'function') {
        var index = this.handlers.indexOf(fn);
        if (index >= 0) {
          webSocket.unsubscribe(topic, fn);
          this.handlers.splice(index, 1);
        }
        return;
      }
      
      angular.forEach(this.handlers, function(fn) {
        webSocket.unsubscribe(topic, fn);
      });
      this.handlers = [];
    }
  }

  return AbstractPubSub;

})
.factory('ClusterMetrics', function($resource, DtSettings) {
  var ClusterMetrics = $resource(DtSettings.urls.ClusterMetrics, { v: DtSettings.GATEWAY_API_VERSION });
  return ClusterMetrics;
})
.factory('ApplicationsRest', function($resource, DtSettings) {

  var Applications;

  function transform(data) {
    return data.apps;
  }

  Applications = $resource(
    DtSettings.urls.Application,
    { v: DtSettings.GATEWAY_API_VERSION },
    {
      getActive: {
        method: 'GET',
        params: {
          states: 'RUNNING,ACCEPTED,SUBMITTED'
        },
        responseType: 'json',
        transformResponse: transform,
        isArray: true
      },
      getAll: {
        method: 'GET',
        responseType: 'json',
        transformResponse: transform,
        isArray: true
      },
      kill: {
        method: 'POST',
        responseType: 'json',
        url: DtSettings.actions.killApp
      },
      shutdown: {
        method: 'POST',
        responseType: 'json',
        url: DtSettings.actions.shutdownApp
      }
    }
  );
  return Applications;
})
.factory('ApplicationsPubSub', function(AbstractPubSub, getUri) {

  function ApplicationsPubSub() {
    AbstractPubSub.apply(this, arguments);
    this.topic = getUri.topic('Applications');
  }

  ApplicationsPubSub.prototype = Object.create(AbstractPubSub.prototype);

  return ApplicationsPubSub;
  
});