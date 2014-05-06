'use strict';

angular.module('dtConsoleApp')
  .factory('OverviewDataModel', ['WidgetDataModel', 'Restangular', 'webSocket', 'getUri', function (WidgetDataModel, rest, ws, getUri) {
  
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
        
      }

      return OverviewDataModel;
        
    }]);
