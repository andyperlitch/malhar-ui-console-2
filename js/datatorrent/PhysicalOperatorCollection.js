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

/**
 * Physical Operator Collection
*/
var _ = require('underscore');
var Base = require('./ApplicationSubCollection');
var PhysicalOperator = require('./PhysicalOperatorModel');
var PhysicalOperatorCollection = Base.extend({
    
    debugName: 'operators',
    
    model: PhysicalOperator,
    
    initialize: function(models, options) {
        Base.prototype.initialize.call(this, models, options);
        this.containerId = options.containerId || false;
        this.logicalName = options.logicalName || false;
    },
    
    toJSON: function(aggregates) {
        var result = [];
        this.each(function(op) {
            result.push(op.serialize(true, aggregates));
        });
        return result;
    },
    
    serialize: function(aggregates) {
        var result = [];
        this.each(function(op) {
            result.push(op.serialize(false, aggregates));
        });
        return result;
    },
    
    url: function() {
        return this.resourceURL('PhysicalOperator', {
            appId: this.appId
        });
    },
    
    subscribe: function() {
        var topic = this.resourceTopic('PhysicalOperators', {
            appId: this.appId
        });
        this.listenTo(this.dataSource, topic, function(data) {
            var ops = this.responseTransform(data);
            this.set(ops);
        });
        this.dataSource.subscribe(topic);
    },

    unsubscribe: function() {
        var topic = this.resourceTopic('PhysicalOperators', {
            appId: this.appId
        });
        this.stopListening(this.dataSource, topic);
    },
    
    responseTransform: function(data) {

        var ops = data.operators;

        if (this.logicalName) {
            var name = this.logicalName;
            ops = _.filter(ops, function(op) {
                return op.name === name;
            });
        }

        if ( this.containerId ) {
            var containerId = this.containerId;
            ops = _.filter(ops, function(op) {
                return op.container === containerId;
            });
        }

        return ops;
        
    }
    
});
exports = module.exports = PhysicalOperatorCollection;