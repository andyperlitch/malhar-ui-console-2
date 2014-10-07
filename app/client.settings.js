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

  clientSettings.dashboard = {};
  clientSettings.dashboard.appData = {};
  clientSettings.dashboard.appData.layouts = [
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

  clientSettings.kafka.defaultQueryWithTopics = _.assign({}, clientSettings.kafka.defaultQuery, {
    kafka: {
      queryTopic: 'AdsDemoQuery',
      resultTopic: 'AdsDemoQueryResult'
    }
  });
  clientSettings.kafka.dimensionsDemoQuery = _.assign({}, clientSettings.kafka.defaultQuery, {
    kafka: {
      queryTopic: 'GenericDimensionsQuery',
      resultTopic: 'GenericDimensionsQueryResult'
    }
  });

  clientSettings.dashboard.kafka = {};
  clientSettings.dashboard.kafka.AdsDemo = {
    title: 'AdsDemo', active: false, defaultWidgets: [
      {
        name: 'Time Series Bar Chart',
        dataModelOptions: {
          metric: 'impressions',
          query: clientSettings.kafka.defaultQueryWithTopics
        }
      },
      {
        name: 'Time Series Line Chart',
        dataModelOptions: {
          query: clientSettings.kafka.defaultQueryWithTopics
        }
      }
    ]
  };
  clientSettings.dashboard.kafka.DimensionsDemo = {
    title: 'DimensionsDemo', active: false, defaultWidgets: [
      {
        name: 'Time Series Bar Chart',
        dataModelOptions: {
          metric: 'revenue',
          query: clientSettings.kafka.dimensionsDemoQuery
        }
      },
      {
        name: 'Time Series Line Chart',
        dataModelOptions: {
          query: clientSettings.kafka.dimensionsDemoQuery
        }
      }
    ]
  };

  clientSettings.dashboard.kafka.layouts = [
    {
      title: 'default', active: true, defaultWidgets: [
      _.assign({
          title: 'AdsDemo - Time Series Bar Chart'
        }, _.findWhere(clientSettings.dashboard.kafka.AdsDemo.defaultWidgets, { name: 'Time Series Bar Chart' })),
      _.assign({
        title: 'AdsDemo - Time Series Line Chart'
      }, _.findWhere(clientSettings.dashboard.kafka.AdsDemo.defaultWidgets, { name: 'Time Series Line Chart' })),
      _.assign({
        title: 'DimensionsDemo - Time Series Bar Chart'
      }, _.findWhere(clientSettings.dashboard.kafka.DimensionsDemo.defaultWidgets, { name: 'Time Series Bar Chart' })),
      _.assign({
        title: 'DimensionsDemo - Time Series Line Chart'
      }, _.findWhere(clientSettings.dashboard.kafka.DimensionsDemo.defaultWidgets, { name: 'Time Series Line Chart' }))
    ]
    },
    clientSettings.dashboard.kafka.AdsDemo,
    clientSettings.dashboard.kafka.DimensionsDemo,
    {
      title: 'debug', active: false, defaultWidgets: [
      {
        name: 'Kafka Debug'
      }
    ]
    }
  ];

})(window);
