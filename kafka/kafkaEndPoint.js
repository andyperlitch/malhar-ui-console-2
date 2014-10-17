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

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var kafka = require('kafka-node');
var config = require('../config');

var Consumer = kafka.Consumer;
var Producer = kafka.Producer;
var Offset = kafka.Offset;
var Client = kafka.Client;

var existingTopicConsumerOptions = {
  autoCommit: false,
  fromBeginning: false,
  fetchMaxWaitMs: 1000,
  fetchMaxBytes: 1024 * 1024,
  fromOffset: true
};

var MESSAGE_EVENT = 'message';

function KafkaEndPoint () {
  this.emitter = new EventEmitter();
  this.client = new Client(config.kafka.zookeeper);
  this.producer = new Producer(this.client);
  this.consumers = {};
}

KafkaEndPoint.prototype = {
  addMessageListener: function (callback) {
    this.emitter.on(MESSAGE_EVENT, callback);
  },

  removeMessageListener: function (callback) {
    this.emitter.removeListener(MESSAGE_EVENT, callback);
  },

  emitMessage: function (message) {
    this.emitter.emit(MESSAGE_EVENT, message);
  },

  send: function (topic, message) {
    var payload = {topic: topic, messages: [message], partition: 0};
    this.producer.send([payload], function (err) {
      if (err) {
        console.log(arguments);
      }
    });
  },

  subscribe: function (consumer, offset, initialOffset, topic) {
    var count = 0;
    var done = false;

    consumer.on('message', function (message) {
      count++;
      if (!done) {
        done = true;
        console.log(topic, '_initial msg offset', message.offset);
        console.log(topic, '_offset difference', initialOffset - message.offset);
      }

      if (message.offset === initialOffset) {
        console.log(topic + '_messages received before initial offset ' + count);
      }

      if (message.offset >= initialOffset) {
        this.emitMessage(message);
      }
    }.bind(this));
    consumer.on('error', function (err) {
      console.log('_consumer error', err);
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
      this.createConsumer(topic);
    }
  },

  createConsumer: function (topicOut, retryCount) {
    var client = new Client(config.kafka.zookeeper);
    var offset = new Offset(client);

    offset.fetch([
      { topic: topicOut, partition: 0, time: -1, maxNum: 1 }
    ], function (err, data) {
      if (!err) {
        if (!_.has(this.consumers, topicOut)) {
          var initialOffset = data[topicOut][0][0];
          console.log('__initial fetched offset:', initialOffset, ', topic:', topicOut);
          var topics = [
            {topic: topicOut, partition: 0, offset: initialOffset}
          ];
          this.consumers[topicOut] = true; // TODO store consumer
          var consumer = new Consumer(client, topics, existingTopicConsumerOptions);
          this.subscribe(consumer, offset, initialOffset, topicOut);
        }
      } else {
        var self = this;
        if (!retryCount) {
          retryCount = 1;
        }

        if (retryCount < 5) {
          console.log('_retry fetching offset for topic', topicOut, ', retry count', retryCount);
          setTimeout(function () {
            self.createConsumer(topicOut, retryCount + 1);
          }, 1000);
        }
      }
    }.bind(this));
  }
};

module.exports = KafkaEndPoint;

