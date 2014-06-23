var _ = require('underscore');
var BaseModel = require('./BaseModel');
var ContainerLogModel = BaseModel.extend({

    debugName: 'container log',

    idAttribute: 'name',

    defaults: {
        name: '',
        appId: '',
        containerId: '',
        length: 0,
        parameters: {},
        content: ''
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

        var self = this;
        var url = this.url();
        var promise = $.ajax({
            type: 'GET',
            url: url,
            data: this.get('parameters')
        });

        promise.then(function(data) {
            self.set('content', data);
        });

        return promise;
    }

});
exports = module.exports = ContainerLogModel;