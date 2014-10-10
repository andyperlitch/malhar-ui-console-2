# App Data Framework

## App Data Framework Architecture

![App Data Framework Architecture](AppDataFrameworkArchitecture.png "App Data Framework Architecture")

## How To

- Example Query

 ``` json
    {
     "keys": {
      "publisherId": "1",
      "advertiserId": "0",
      "adUnit": "0"
     },
     "kafka": {
      "queryTopic": "GenericDimensionsQuery",
      "resultTopic": "GenericDimensionsQueryResult"
     }
    }
 ```

- Changing Dashboard Configuration in Runtime

See `dist/client.settings.js`


## App Data Kafka Node.js Server Architecture
![Class Diagram of App Data server](AppDataKafkaServerArchitecture.png "App Data Kafka Node.js Server Architecture")