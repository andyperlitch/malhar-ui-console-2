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

var config = require('../config');
var _ = require('lodash');
var kafka = require('kafka-node');
var LRU = require('lru-cache');

var Consumer = kafka.Consumer;
var Producer = kafka.Producer;
var Offset = kafka.Offset;
var Client = kafka.Client;
var topicOut = config.kafka.topic.out || 'test';
var connectionString = config.kafka.zookeeper;
var topicIn = config.kafka.topic.in || 'test';

var topicOutPartition = 0;

var options = {
  autoCommit: false,
  fromBeginning: false,
  fetchMaxWaitMs: 1000,
  fetchMaxBytes: 1024 * 1024,
  fromOffset: true
};

function KafkaEndPoint (messageCallback) {
  this.messageCallback = messageCallback;

  this.client = new Client(connectionString);
  this.producer = new Producer(this.client);
  //this.createConsumer(client);
  this.consumers = {};
  //this.addConsumer(topicOut);
}

KafkaEndPoint.prototype = {
  send: function (message) {
    //console.log('_send', message);
    var payload = {topic: topicIn, messages: [message], partition: 0};
    this.producer.send([payload], function (err) {
      if (err) {
        console.log(arguments);
      }
    });
  },

  sendMessage: function (topic, message) {
    //console.log('_send', message);
    var payload = {topic: topic, messages: [message], partition: 0};
    this.producer.send([payload], function (err) {
      if (err) {
        console.log(arguments);
      }
    });
  },

  subscribe: function (consumer, offset, initialOffset) {
    var count = 0;
    var done = false;

    consumer.on('message', function (message) {
      count++;
      if (!done) {
        done = true;
        console.log('_initial message offset', message.offset);
        console.log('_offset difference', initialOffset - message.offset);
      }

      if (message.offset === initialOffset) {
        console.log('_messages received before initial offset ' + count);
      }

      if (message.offset >= initialOffset) {
        this.messageCallback(message);
      }
    }.bind(this));
    consumer.on('error', function (err) {
      console.log('error', err);
    });
    consumer.on('offsetOutOfRange', function (topic) {
      console.log('__offsetOutOfRange');
      topic.maxNum = 2;
      offset.fetch([topic], function (err, offsets) {
        var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
        consumer.setOffset(topic.topic, topic.partition, min);
      });
    });
  },

  addConsumer: function (topic) {
    if (!_.has(this.consumers, topic)) {
      this.consumers[topic] = true; // TODO store consumer
      this.createConsumer(this.client, topic);
    }
  },

  createConsumer: function (client, topicOut) {
    var offset = new Offset(client);

    offset.fetch([
      { topic: topicOut, partition: topicOutPartition, time: Date.now(), maxNum: 1 }
    ], function (err, data) {
      if (data) {
        var initialOffset = data[topicOut][0][0];
        console.log('__initial offset', initialOffset);

        var topics = [
          {topic: topicOut, partition: topicOutPartition, offset: initialOffset}
        ];
        var consumer = new Consumer(client, topics, options);
        this.subscribe(consumer, offset, initialOffset);
      }
    }.bind(this));
  }
};


module.exports = KafkaEndPoint;

