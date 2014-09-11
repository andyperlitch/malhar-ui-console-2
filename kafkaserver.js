/*
 * Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var http = require('http');
var httpProxy = require('http-proxy');
var config = require('./config');

var kafka = require('./kafka');

var app = express();

var proxy = httpProxy.createServer({
  target: {
    host: config.gateway.host,
    port: config.gateway.port
  }
});

// all environments
//app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(express.methodOverride());
//app.use(app.router);

console.log('environment: ' + app.get('env'));

console.log(config.web.useDist);
if (config.web.useDist) {
  app.use(express.static(path.join(__dirname, 'dist')));
} else {
  app.use(express.static(path.join(__dirname, 'app')));
  app.use(express.static(path.join(__dirname, '.tmp'))); //TODO
}

if ('development' == app.get('env')) {
  //app.use(express.errorHandler());
}

app.get('/ws/*', function(req, res) {
  proxy.web(req, res);
});
app.get('/data', kafka.data);
app.post('/data', kafka.publish);

app.get('/settings.js', function(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', 0);

  res.send('window.settings = ' + JSON.stringify(config.settings) + ';');
});

var server = http.createServer(app);
server.listen(config.web.port, function(){
  console.log('Express server listening on port ' + config.web.port);
});

server.on('upgrade', function (req, socket, head) {
  proxy.ws(req, socket, head);
})