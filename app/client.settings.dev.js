'use strict';
(function (window) {
  var clientSettings = window.clientSettings = {};

  clientSettings.dataServerHost = 'http://localhost:3003';
  clientSettings.keepAliveInterval = 5000;

  clientSettings.kafka = {};
  clientSettings.kafka.discovery = {};
  clientSettings.kafka.discovery.inputOperatorFilter = {className: 'com.datatorrent.contrib.kafka.KafkaSinglePortStringInputOperator'};
  clientSettings.kafka.discovery.outputOperatorFilter = {className: 'com.datatorrent.contrib.kafka.KafkaSinglePortOutputOperator'};
  clientSettings.kafka.discovery.dimensionsOperatorFilter = {className: 'com.datatorrent.lib.statistics.DimensionsComputation'}; // {className: 'com.datatorrent.demos.adsdimension.generic.GenericDimensionComputation'}

  var dashboard = clientSettings.dashboard = {};

  var defaultQuery = {
    keys: {
      publisherId: 1,
      advertiserId: 0,
      adUnit: 0
    }
  };

  dashboard.appData = {}; // clientSettings.dashboard.appData
  dashboard.appData.layouts = [ // clientSettings.dashboard.appData.layouts
    {
      title: 'default', active: true, defaultWidgets: [
      {
        name: 'Time Series Bar Chart',
        dataModelOptions: {
          metric: 'impressions',
          query: defaultQuery
        }
      },
      {
        name: 'Time Series Line Chart',
        dataModelOptions: {
          query: defaultQuery
        }
      },
      {
        name: 'Kafka Debug'
      }
    ]
    },
    {
      title: 'demo', active: false, defaultWidgets: [
      {
        name: 'Time Series Bar Chart',
        dataModelOptions: {
          metric: 'impressions',
          query: defaultQuery
        }
      },
      {
        name: 'Time Series Line Chart',
        dataModelOptions: {
          query: defaultQuery
        }
      }
    ]
    },
    {
      title: 'debug', active: false, defaultWidgets: [
      {
        name: 'Kafka Discovery'
      },
      {
        name: 'Kafka Debug'
      }
    ]
    }
  ];

})(window);
