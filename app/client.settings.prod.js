'use strict';
(function (window) {
  var clientSettings = window.clientSettings = {};

  clientSettings.dataServerHost = 'http://localhost:3003';
  clientSettings.keepAliveInterval = 5000;

  clientSettings.kafka = {};
  clientSettings.kafka.discovery = {};
  clientSettings.kafka.discovery.inputOperatorFilter = {className: 'com.datatorrent.contrib.kafka.KafkaSinglePortStringInputOperator'};
  clientSettings.kafka.discovery.outputOperatorFilter = {className: 'com.datatorrent.contrib.kafka.KafkaSinglePortOutputOperator'};
  clientSettings.kafka.discovery.dimensionsOperatorFilter = function (operator) {
    var className = operator.className;
    return _.contains(['com.datatorrent.lib.statistics.DimensionsComputation',
      'com.datatorrent.demos.adsdimension.generic.GenericDimensionComputation'],
      className
    );
  };
  clientSettings.kafka.defaultQuery = {
    keys: {
      publisherId: '1',
      advertiserId: '0',
      adUnit: '0'
    }
  };

  var dashboard = clientSettings.dashboard = {};

  dashboard.appData = {}; // clientSettings.dashboard.appData
  dashboard.appData.layouts = [ // clientSettings.dashboard.appData.layouts
    {
      title: 'default', active: true, defaultWidgets: [
      {
        name: 'Time Series Bar Chart',
        dataModelOptions: {
          metric: 'impressions',
          query: clientSettings.kafka.defaultQuery
        }
      },
      {
        name: 'Time Series Line Chart',
        dataModelOptions: {
          query: clientSettings.kafka.defaultQuery
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
