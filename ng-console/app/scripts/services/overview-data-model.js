'use strict';

angular.module('dtConsoleApp')
  .factory('OverviewDataModel', ['WidgetDataModel', 'Restangular', 'webSocket', 'DtSettings', function (WidgetDataModel, rest, ws, settings) {
  
      function OverviewDataModel() {}

      OverviewDataModel.prototype = Object.create(WidgetDataModel.prototype);

      OverviewDataModel.prototype.init = function() {
        // Set fields from dataModelOptions
        this.widgetScope.fields = this.dataModelOptions.fields;
        this.url = this.dataModelOptions.url;
        this.topic = this.dataModelOptions.topic;

        // Subscribe to websocket topic
        var that = this;
        ws.subscribe(settings.topics[this.topic], function(data) {

          that.updateScope(data);
          that.widgetScope.$apply();

        }, this.widgetScope);

        // Make initial call to resource
        this.updateScope({
          averageAge: "90343421",
          cpuPercentage: "21948.800839214087",
          currentMemoryAllocatedMB: "1454080",
          maxMemoryAllocatedMB: "1897472",
          numAppsFailed: "9",
          numAppsFinished: "40",
          numAppsKilled: "355",
          numAppsPending: "0",
          numAppsRunning: "6",
          numAppsSubmitted: "410",
          numContainers: "166",
          numOperators: "398",
          tuplesEmittedPSMA: "499015097",
          tuplesProcessedPSMA: "498267203"
        });

      }

      return OverviewDataModel;
        
    }]);
