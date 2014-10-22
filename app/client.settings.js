/**
 * Changing dashboard configuration in runtime:
 * - Create new `clientSettings.dashboard.storageMasterKey` (to force the app to use new configuration, not the old one from browser local storage)
 * - Refresh the page (make sure it's not cached)
 */

'use strict';
(function (window) {
  var clientSettings = window.clientSettings = {};

  clientSettings.dataServerHost = 'http://localhost:3003';
  clientSettings.keepAliveInterval = 5000;

  clientSettings.kafka = {};

  function createKeyValues(list) {
    return _.map(_.sortBy(list), function (name, index) {
      return { name: name, value: (index + 1) };
    });
  }

  var productCategories = ['Smart Phones', 'Tablets', 'Laptops', 'Printers', 'Routers'];
  var channelIds = ['Online', 'Mobile', 'Store'];
  var regionIds = ['Boston', 'New York', 'Philadelphia', 'Cleveland', 'Atlanta', 'Chicago', 'St. Louis', 'Minneapolis', 'Dallas', 'San Francisco'];

  clientSettings.kafka.dictionary = {
    productCategory: createKeyValues(productCategories),
    channelId: createKeyValues(channelIds),
    regionId: createKeyValues(regionIds)
  };

  clientSettings.kafka.discovery = {};
  clientSettings.kafka.discovery.inputOperatorFilter = {className: 'com.datatorrent.contrib.kafka.KafkaSinglePortStringInputOperator'};
  clientSettings.kafka.discovery.outputOperatorFilter = {className: 'com.datatorrent.contrib.kafka.KafkaSinglePortOutputOperator'};
  clientSettings.kafka.discovery.dimensionsOperatorFilter = function (operator) {
    var className = operator.className;
    return _.contains(['com.datatorrent.lib.statistics.DimensionsComputation',
        'com.datatorrent.demos.dimensions.generic.GenericDimensionComputation'],
      className
    );
  };
  clientSettings.kafka.defaultQuery = {
    keys: {
    }
  };

  clientSettings.dashboard = {};
  clientSettings.dashboard.storageMasterKey = 'ErZ8mC2Jek15';
  clientSettings.dashboard.storageKey = 'dashboard.{masterKey}.appdata.'
    .replace('{masterKey}', clientSettings.dashboard.storageMasterKey);
  clientSettings.dashboard.timeAxisFormat = 'MMM dd HH:mm';
  clientSettings.dashboard.appData = {};
  clientSettings.dashboard.appData.storageKey = clientSettings.dashboard.storageKey + 'InstanceAppData';
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

  clientSettings.kafka.databaseDemoQuery = {
    kafka: {
      queryTopic: 'GoldenGateQueryPi',
      resultTopic: 'GoldenGateQueryResultsPi'
    }
  };

  clientSettings.dashboard.kafka = {};
  clientSettings.dashboard.kafka.storageKey = clientSettings.dashboard.storageKey + 'AppData';

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
      },
      {
        name: 'Kafka Debug',
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
      },
      {
        name: 'Table',
        dataModelOptions: {
          query: clientSettings.kafka.dimensionsDemoQuery
        }
      },
      {
        name: 'Kafka Debug',
        dataModelOptions: {
          query: clientSettings.kafka.dimensionsDemoQuery
        }
      }
    ]
  };

  clientSettings.dashboard.kafka.DatabaseDemo = {
    title: 'DatabaseDemo', active: false, defaultWidgets: [
      {
        name: 'Table',
        title: 'Original Table',
        dataModelOptions: {
          query: {
            selector: 'GET_RECENT_TABLE_ENTRIES',
            tableName: 'processedemployee',
            numberEntries: 10,
            keys: {},
            kafka: clientSettings.kafka.databaseDemoQuery.kafka
          }
        },
        size: {
          width: '50%'
        }
      },
      {
        name: 'Text',
        title: 'File Content',
        dataModelOptions: {
          query: {
            selector: 'GET_LATEST_FILE_CONTENTS',
            filePath: null,
            numberLines: 10,
            keys: {},
            kafka: clientSettings.kafka.databaseDemoQuery.kafka
          }        },
        size: {
          width: '50%',
          height: '664px'
        },
        style: {
          float: 'right'
        }
      },
      {
        name: 'Table',
        title: 'Replicated Table',
        dataModelOptions: {
          query: {
            selector: 'GET_RECENT_TABLE_ENTRIES',
            tableName: 'employee',
            numberEntries: 10,
            keys: {},
            kafka: clientSettings.kafka.databaseDemoQuery.kafka
          }
        },
        size: {
          width: '50%'
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
    clientSettings.dashboard.kafka.DatabaseDemo,
    clientSettings.dashboard.kafka.AdsDemo,
    clientSettings.dashboard.kafka.DimensionsDemo,
    {
      title: 'WebSocketDemo', active: false, defaultWidgets: [
      {
        name: 'Top N'
      },
      {
        name: 'Web Socket Debug'
      }
    ]
    },
    {
      title: 'debug', active: false, defaultWidgets: [
      {
        name: 'Kafka Debug',
        dataModelOptions: {
          query: clientSettings.kafka.defaultQueryWithTopics
          //query: clientSettings.kafka.dimensionsDemoQuery
        }
      }
    ]
    }
  ];

})(window);
