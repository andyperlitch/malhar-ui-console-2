#!/bin/sh
export PORT=3004
export GATEWAY_HOST=localhost
export GATEWAY_PORT=9090

export ZOOKEEPER=localhost:2181
export KAFKA_TOPIC_IN=AdsDemoQuery
export KAFKA_TOPIC_OUT=AdsDemoQueryResult

node kafkaserver.js