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
'use strict';

var config = require('../config');
var LRU = require('lru-cache');
var util = require('util');
var QueryMap = require('./queryMap');
var KafkaEndPoint = require('./kafkaEndPoint');

function DataServer(io) {
  this.io = io;
  this.lruCache = LRU(config.kafka.lruCacheMax);
  this.queries = new QueryMap();
  this.kafkaEndPoint = new KafkaEndPoint();
  this.kafkaEndPoint.addMessageListener(this.onMessage.bind(this));

  this.io.on('connection', function (socket) {
    socket.on('subscribe', function (data) {
      this.onSubscribe(socket, data);
    }.bind(this));

    socket.on('unsubscribe', function (data) {
      this.onUnSubscribe(socket, data);
    }.bind(this));

    socket.on('disconnect', function () {
      this.onDisconnect(socket);
    }.bind(this));
  }.bind(this));

  this.count = 0;
  this.topic2query = {};
  this.lastLogTime = Date.now();
  this.lastLoggedMessageCount = 0;
  this.logInterval = 5000;
  this.maxRate = 0;
  this.logDebug = config.kafka.logDebug;
}

DataServer.prototype = {
  onMessage: function (message) {
    var msg = JSON.parse(message.value);

    var parsedId = JSON.parse(msg.id);
    this.topic2query[JSON.stringify(parsedId.kafka)] = JSON.stringify(parsedId.keys);

    if (this.logDebug) {
      this.logDebugInfo(message);
    }

    //console.log(msg.id);
    //console.log('_msg ' + msg.id);
    //lruCache.set(msg.id, message);
    //console.log(msg.id);

    if (this.queries.hasQuery(msg.id)) {
      var cache = this.lruCache.get(msg.id);
      var now = Date.now();
      if (!cache || (now - cache.time > 500)) {
        //console.log('_msg ', msg.id, lastSent);
        //var activeQueries = this.queries.getQueryList();
        //console.log(activeQueries);

        this.lruCache.set(msg.id, {
          message: message,
          time: now
        });
        //console.log('emit', msg.id);
        //console.log(queries.getQueryList());
        this.io.to(msg.id).emit(msg.id, message);
      }
    }
  },

  onSubscribe: function (socket, data) {
    var query = JSON.parse(data.query);
    query.id = data.query;
    if (this.logDebug) {
      console.log('_subscribe ' + query.id);
    }
    //console.log(this.kafkaEndPoint.consumers);
    //console.log(this.io.sockets.adapter.rooms);

    socket.join(query.id); // join room with specified query
    this.queries.addQuery(socket.id, query.id);

    if (query.kafka) {
      if (query.kafka.queryTopic) {
        this.kafkaEndPoint.send(query.kafka.queryTopic, JSON.stringify(query));
      }
      if (query.kafka.resultTopic) {
        this.kafkaEndPoint.addConsumer(query.kafka.resultTopic);
      }
    }

    this.emitCachedResult(query.id);
  },

  onUnSubscribe: function (socket, data) {
    var query = data.query;

    socket.leave(query);
    this.queries.removeQuery(socket.id, query);

    //TODO clean up rooms
    /*
     var room = io.sockets.adapter.rooms[query];
     if (room && _.isEmpty(room)) {
     delete queries[query];
     }
     */
  },

  onDisconnect: function (socket) {
    console.log(socket.id + ' disconnected ' + socket.connected);
    this.queries.removeId(socket.id);
  },

  emitCachedResult: function (id) {
    var cache = this.lruCache.get(id);
    if (cache) {
      this.io.to(id).emit(id, cache.message);
    }
  },

  logDebugInfo: function (message) {
    this.count++;
    var now = Date.now();
    var timeDiff = now - this.lastLogTime;
    if (timeDiff > this.logInterval) {
      this.lastLogTime = now;
      var rate = Math.round((this.count - this.lastLoggedMessageCount) / (timeDiff/1000));
      this.maxRate = Math.max(this.maxRate, rate);
      console.log('_message rate (per sec): ', rate);
      console.log('_message total count: ', this.count, ', max rate: ', this.maxRate, ' (msg/sec)', ', last offset: ', message.offset);
      console.log(this.topic2query);
      console.log(this.kafkaEndPoint.consumers);
      console.log('===============');

      this.lastLoggedMessageCount = this.count;
    }
  }
};

module.exports = DataServer;