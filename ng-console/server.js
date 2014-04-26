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
var _ = require('underscore');
var express = require("express");
var app = express();
var fs = require('graceful-fs');
var path = require('path');
var httpProxy = require('http-proxy');
var lessm = require('less-middleware');

// Dev configuration
var config = require('./config');
// Package
var pkg = require('./package.json');

// Set up the proxy that goes to the gateway
var proxy = httpProxy.createProxyServer({
    target: {
        host: config.gateway.host,
        port: config.gateway.port
    }
});

// REST API Requests
app.get('/ws/*', function(req, res) {
    proxy.proxyRequest(req, res);
});
app.post('/ws/*', function(req, res) {
    proxy.proxyRequest(req, res);
});
app.put('/ws/*', function(req, res) {
	proxy.proxyRequest(req, res);
});
app.delete('/ws/*', function(req, res) {
	proxy.proxyRequest(req, res);
});

// Main entry page
app.get('/', function(req, res) {
    fs.createReadStream(__dirname + '/app/index.html').pipe(res);
});

// Serve static files
app.use(express.static(__dirname + '/.tmp', { maxAge: 86400000 }));
app.use(express.static(__dirname + '/app', { maxAge: 86400000 }));

// Start the server
app.listen(config.web.port);
console.log("Server listening on port " + config.web.port);