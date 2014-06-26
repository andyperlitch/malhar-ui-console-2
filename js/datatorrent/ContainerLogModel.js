var _ = require('underscore');
var Backbone = require('backbone');
var BaseModel = require('./BaseModel');

var ContainerLogParameters = Backbone.Model.extend({
    
    defaults: {
        start: '',
        end: '',
        grep: ''
    },

    toQueryParams: function(logLength) {
        var json = _.clone(this.toJSON());
        _.each(json, function(val, key, list) {
            if (val === '') {
                delete list[key];
            }
        });
        if (json.hasOwnProperty('start') && json.start*1 < 0) {
            json.start = Math.max(0, logLength*1 + json.start*1);
            // this.set({start: json.start});
            this.set({start: json.start});
        }
        return json;
    }

});

var ContainerLogModel = BaseModel.extend({

    debugName: 'container log',

    idAttribute: 'name',

    defaults: function() {
        return {
            name: '',
            appId: '',
            containerId: '',
            length: false,
            parameters: {},
            content: ''
        };
    },

    fetch: function(options) {
        options || (options = {});
        options.url = this.resourceURL('ContainerLog', {
            appId: this.get('appId'),
            containerId: this.get('containerId')
        });
        return BaseModel.prototype.fetch.call(this, options);
    },

    url: function() {
        return this.resourceURL('ContainerLog', {
            appId: this.get('appId'),
            containerId: this.get('containerId')
        }) + '/' + this.get('name');
    },

    responseTransform: function(data) {
        var name = this.get('name');
        this.allLogs = data.logs;
        return _.find(data.logs, function(log) {
            return log.name === name;
        });
    },

    getLogContent: function(params) {
        if (params) {
            this.set('parameters', params);
        }
        var parameters = this.get('parameters');
        if (parameters.get('start') < 0 && this.get('length') === false) {
            throw new Error('Cannot get negative log offset if the log length has not been determined!');
        }

        var self = this;
        var url = this.url();

        var promise = $.ajax({
            type: 'GET',
            url: url,
            data: parameters.toQueryParams(this.get('length'))
        });

        promise.then(function(data, responseText, xhr) {
            var responseLength = xhr.getResponseHeader('content-length') - 2;
            parameters.set('end', parameters.get('start')*1 + responseLength);
            self.set('content', data);
        });

        return promise;
    },

    prependToLogContent: function(max_bytes) {
        // Get current offset
        var parameters = this.get('parameters');
        var curStartOffset = parameters.get('start');
        
        var newStart = Math.max(0, curStartOffset - max_bytes);

        var self = this;
        var url = this.url();        

        var promise = $.ajax({
            type: 'GET',
            url: url,
            data: {
                start: newStart,
                end: curStartOffset - 1
            }
        });

        promise.then(function(data, responseText, xhr) {
            var responseLength = xhr.getResponseHeader('content-length');
            parameters.set('start', newStart);
            self.set('content', data + self.get('content'));
        });

        return promise;
    },

    appendToLogContent: function(max_bytes) {
        // Get current offset
        var parameters = this.get('parameters');
        var curEndOffset = parameters.get('end');

        var queryParams = {
            start: curEndOffset + 2
        };
        var curLength = this.get('length');
        var recalculateLength = false;
        var correction;

        if (curLength > curEndOffset + max_bytes) {
            queryParams.end = curEndOffset + 1 + max_bytes;
        } else {
            recalculateLength = true;
            correction = curLength - curEndOffset;
        }

        var self = this;
        var url = this.url();        

        var promise = $.ajax({
            type: 'GET',
            url: url,
            data: queryParams
        });

        promise.then(function(data, responseText, xhr) {
            var responseLength = xhr.getResponseHeader('content-length');
            parameters.set('end', curEndOffset*1 + responseLength*1);
            if (recalculateLength) {
                self.set('length', curLength + responseLength - correction);
            }
            self.set('content', self.get('content') + data);
        });

        return promise;
    },

    toJSON: function() {
        var json = BaseModel.prototype.toJSON.call(this);
        json.parameters = json.parameters.toJSON();
        return json;
    },

    set: function(attrs, options) {
        if (typeof attrs !== 'object') {
            var tmp = attrs;
            attrs = {};
            attrs[tmp] = options;
            options = {};
        }
        if (attrs.hasOwnProperty('parameters')) {
            var current = this.get('parameters');
            if (current) {
                current.set(attrs.parameters);
                delete attrs.parameters;
            } else {
                attrs.parameters = new ContainerLogParameters(attrs.parameters);
            }
        }
        return BaseModel.prototype.set.call(this, attrs, options);
    }

});
exports = module.exports = ContainerLogModel;