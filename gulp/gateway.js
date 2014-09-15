/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
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

'use strict';

var gulp = require('gulp');

var express = require('express');
var http = require('http');
var opn = require('opn');
var livereload = require('connect-livereload');
var httpProxy = require('http-proxy');
var config = require('./../config');

// Set up the proxy that goes to the gateway
var proxy = httpProxy.createProxyServer({
  target: {
    host: config.gateway.host,
    port: config.gateway.port
  }
});


// proxy Gateway REST API calls
function gatewayMiddleware(req, res, next) {
  if (req.originalUrl.indexOf('/ws/') === 0) {
    proxy.proxyRequest(req, res);
  } else {
    next();
  }
}

function startServer(baseDirs, port) {
  var app = express();

  app.use(livereload({ port: 35729 }));

  baseDirs.forEach(function (dir) {
    app.use(express.static(dir));
  });

  app.use(gatewayMiddleware);

  var server = http.createServer(app);

  server.on('upgrade', function (req, socket, head) {
    proxy.ws(req, socket, head);
  });

  var url = 'http://localhost:' + port;

  server.listen(port)
    .on('listening', function () {
      console.log('Started connect web server on ' + url);
    });

  opn(url);
}

gulp.task('connect', function () {
  startServer(['app', '.tmp'], config.web.port);
});

gulp.task('connect:dist', function () {
  startServer(['dist'], 9001);
});



