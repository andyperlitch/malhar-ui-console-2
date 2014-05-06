'use strict';

angular.module('dtConsoleApp')
  .factory('OverviewDataModel', ['WidgetDataModel', 'webSocket', 'ClusterMetrics', 'getUri', function (WidgetDataModel, ws, ClusterMetrics, getUri) {
  
      function OverviewDataModel() {}

      OverviewDataModel.prototype = Object.create(WidgetDataModel.prototype);

      OverviewDataModel.prototype.init = function() {
        // Set fields from dataModelOptions
        this.widgetScope.fields = this.dataModelOptions.fields;
        this.url = this.dataModelOptions.url;
        this.topic = this.dataModelOptions.topic;

        // Subscribe to websocket topic
        var that = this;
        ws.subscribe(getUri.topic(this.topic), function(data) {

          that.updateScope(data);
          that.widgetScope.$apply();

        }, this.widgetScope);

        // Make initial call to resource
        var metrics = ClusterMetrics.get();
        metrics.$promise.then(function() {
          that.updateScope(metrics);
        });

      }

      return OverviewDataModel;
        
    }]);
