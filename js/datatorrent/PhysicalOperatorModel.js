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
 * Operator model
*/

var _ = require('underscore'), Backbone = require('backbone');
var bormat = require('bormat');
var WindowId = require('./WindowId');
var formatters = require('./formatters');
var BaseModel = require('./BaseModel');
var PortCollection = require('./PortCollection');
var PhysicalOperatorModel = BaseModel.extend({
    
    debugName: 'operator',
    
    defaults: {
        'appId': '',
        'className': '',
        'container': '',
        'cpuPercentageMA': '',
        'recoveryWindowId': new WindowId('0'),
        'currentWindowId': new WindowId('0'),
        'failureCount': '',
        'host': '',
        'id': '',
        'ports': [],
        'lastHeartbeat': '',
        'latencyMA': '',
        'name': '',
        'recordingStartTime': '-1',
        'status': '',
        'totalTuplesEmitted': '',
        'totalTuplesProcessed': '',
        'tuplesEmittedPSMA': '',
        'tuplesProcessedPSMA': ''
    },

    initialize: function(attrs, options) {
        options = options || {};
        BaseModel.prototype.initialize.call(this, attrs, options);
        this.ports = new PortCollection(attrs.ports, {
            dataSource: options.dataSource,
            appId: attrs.appId,
            operatorId: attrs.id
        });
        this.on('change:ports', function(model, value) {
            this.ports.set(value);
        });
        this.on('change:appId change:id', function(model, value) {
            this.ports.appId = this.get('appId');
            this.ports.operatorId = this.get('id');
        });
    },
    
    serialize: function(noFormat) {
        var obj = this.toJSON();
        
        if ( !noFormat ) {
            
            // Make comma group formatting
            _.each(['totalTuplesEmitted','tuplesEmittedPSMA','totalTuplesProcessed','tuplesProcessedPSMA'], function(key){
                obj[key + '_f'] = bormat.commaGroups(obj[key]);
            });
            
        }
        return obj;
    },
    
    urlRoot: function() {
        var urlRoot = this.resourceURL('PhysicalOperator', {
            appId: this.get('appId')
        });
        return urlRoot;
    },
    
    subscribe: function() {
        var topic = this.resourceTopic('PhysicalOperators', {
            appId: this.get('appId')
        });
        this.checkForDataSource();
        this.listenTo(this.dataSource, topic, function(data) {
            var operatorId = this.get('id');
            var obj = _.find(data.operators, function(op) {
                return op.id == operatorId;
            });
            obj.appId = this.get('appId');
            this.set(obj);
            this.trigger('update');
        });
        this.dataSource.subscribe(topic);
    },

    isRecording: function() {
        var startTimeRE = /^\d+$/;
        if (startTimeRE.test(this.get('recordingStartTime'))) {
            return true;
        }
        return this.ports.some(function(port) {
            return startTimeRE.test(port.get('recordingStartTime'));
        });
    },

    toJSON: function() {
        var json = BaseModel.prototype.toJSON.call(this);
        json.isRecording = this.isRecording();
        return json;
    }
    
});
exports = module.exports = PhysicalOperatorModel;