'use strict';

angular.module('dtConsoleApp')
  .factory('OverviewDataModel', ['WidgetDataModel', 'webSocket', 'getUri', function (WidgetDataModel, ws, getUri) {
  
      function OverviewDataModel() {}

      OverviewDataModel.prototype = Object.create(WidgetDataModel.prototype);

      OverviewDataModel.prototype.init = function() {
        // Set fields from dataModelOptions
        this.widgetScope.fields = this.dataModelOptions.fields;
        this.topic = this.dataModelOptions.topic;
        this.resource = this.dataModelOptions.resource;

        // Subscribe to websocket topic
        var that = this;
        ws.subscribe(this.topic, function(data) {
          that.updateScope(data);
          that.widgetScope.$apply();

        }, this.widgetScope);

        // Make initial call to resource
        if (this.resource) {
          var response = this.resource.get();
          response.$promise.then(function() {
            that.updateScope(response);
          });
        }
      };

      return OverviewDataModel;
        
    }]);
