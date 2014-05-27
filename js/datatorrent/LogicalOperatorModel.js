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

var _ = require('underscore');
var BigInteger = require('jsbn');
var WindowId = require('./WindowId');
var OperatorModel = require('./PhysicalOperatorModel');
var PhysicalOperatorCollection = require('./PhysicalOperatorCollection');

/**
 * Logical Operator model
 * 
 * Represents a group of physical operators
 * with the same Logical operator.
**/
var LogicalOperatorModel = OperatorModel.extend({

    idAttribute: 'name',

    defaults: {
        appId: '',
        name: '',
        className: '',
        containerIds: [],
        cpuPercentageMA: 0,
        cpuMin: 0,
        cpuMax: 0,
        cpuAvg: 0,
        currentWindowId: 0,     // new WindowId('0')
        recoveryWindowId: 0,    // new WindowId('75')
        failureCount: 1,
        hosts: [],
        partitions: [],
        ports: [],
        lastHeartbeat: 0,
        latencyMA: 0,
        status: {},
        totalTuplesEmitted: BigInteger.ZERO,
        totalTuplesProcessed: BigInteger.ZERO,
        tuplesEmittedPSMA: BigInteger.ZERO,
        tuplesProcessedPSMA: BigInteger.ZERO,
        partitionCount: 0,
        containerCount: 0
    },

    initialize: function(attrs, options) {
        OperatorModel.prototype.initialize.call(this, attrs, options);

        if (options.keepPhysicalCollection) {
            this.physicalOperators = new PhysicalOperatorCollection([], {
                dataSource: this.dataSource,
                logicalName: this.get('name')
            });
            this.physicalOperators.appId = this.get('appId');
        }
    },

    urlRoot: function() {
        return this.resourceURL('LogicalOperator', {
            appId: this.get('appId')
        });
    },

    subscribe: function() {
        this.checkForDataSource();
        var topic = this.resourceTopic('LogicalOperators', {
            appId: this.get('appId')
        });
        var name = this.get('name');
        this.listenTo(this.dataSource, topic, function(data) {
            var op = _.find(data.operators, function(o) {
                return o.name === name;
            });
            this.set(op);
            this.trigger('update');
        });
        this.dataSource.subscribe(topic);
    }

});

exports = module.exports = LogicalOperatorModel;