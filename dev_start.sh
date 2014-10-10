#!/bin/sh
export PORT=3003
export GATEWAY_HOST=localhost
export GATEWAY_PORT=9090

export ZOOKEEPER=localhost:2181
export KAFKA_LOG_DEBUG=true
export KAFKA_TOPIC_IN=AdsDemoQuery
export KAFKA_TOPIC_OUT=AdsDemoQueryResult
#export KAFKA_TOPIC_IN=GenericDimensionsQuery
#export KAFKA_TOPIC_OUT=GenericDimensionsQueryResult

node kafkaserver.js