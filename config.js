var config = {};
config.web = {};
config.gateway = {};

config.web.host = 'localhost';
config.web.port = process.env.PORT || 9000;
config.gateway.host = 'localhost';
config.gateway.port = process.env.GATEWAY_PORT || 3390;

module.exports = config
