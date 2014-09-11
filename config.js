var config = {};
config.web = {};
config.gateway = {};

config.web.host = 'localhost';
config.web.port = process.env.PORT || 9000;
config.web.useDist = process.env.USE_DIST || false;
config.gateway.host = process.env.GATEWAY_HOST || 'localhost';
config.gateway.port = process.env.GATEWAY_PORT || 3390;

config.kafka = {};
config.kafka.zookeeper = process.env.ZOOKEEPER || 'localhost:2181';
config.kafka.lruCacheMax = 1000;
config.kafka.enableMockData = process.env.MOCK_DATA || false;
config.kafka.topic = {};
config.kafka.topic.in = process.env.KAFKA_TOPIC_IN || 'test';
config.kafka.topic.out = process.env.KAFKA_TOPIC_OUT || 'test';

config.kafka.devserver = {};
config.kafka.devserver.host = 'localhost';
config.kafka.devserver.port = 3003;

module.exports = config;
