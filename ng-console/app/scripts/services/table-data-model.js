'use strict';

angular.module('dtConsoleApp')
  .factory('TableDataModel', ['WidgetDataModel', 'webSocket', 'ClusterMetrics', 'getUri', function (WidgetDataModel, ws, ClusterMetrics, getUri) {
  
      function TableDataModel() {}

      TableDataModel.prototype = Object.create(WidgetDataModel.prototype);

      TableDataModel.prototype.init = function() {
        // Set columns from dataModelOptions
        this.widgetScope.columns = this.dataModelOptions.columns;
        this.resource = this.dataModelOptions.resource;
        this.resourceAction = this.dataModelOptions.resourceAction;
        this.topic = this.dataModelOptions.topic;

        // Subscribe to websocket topic
        var that = this;
        ws.subscribe(getUri.topic(this.topic), function(data) {

          that.updateScope(data);
          that.widgetScope.$apply();

        }, this.widgetScope);

        // Make initial call to resource
        var response = this.resource[this.resourceAction]();
        response.$promise.then(function() {
          that.updateScope(response);
        });

      };

      return TableDataModel;
        
    }]);
