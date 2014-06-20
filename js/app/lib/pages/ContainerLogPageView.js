var _ = require('underscore');
var BaseView = require('bassview');
var ContainerLogModel = DT.lib.ContainerLogModel;
var ContainerLogPageView = BaseView.extend({

    initialize: function(options) {
        this.params = options.pageParams;
        this.params.name = this.params.logName;
        delete this.params.logName;
        this.params.parameters = this.parseParameters(this.params.parameters);
        this.model = new ContainerLogModel(this.params);
        this.model.getLogContent()
            .then(this.render.bind(this));
    },

    defaultParams: {
        start: -4096
    },

    parseParameters: function(string) {
        // remove question mark
        if (typeof string !== 'string') {
            return _.extend({}, this.defaultParams);
        }
        string = string.replace(/^\?/, '');
        var arr = string.split('&');
        var params = {};
        _.each(arr, function(p) {
            var a = p.split('=');
            params[a[0]] = a[1];
        });
        _.each(['start', 'end'], function(key) {
            if (params.hasOwnProperty(key)) {
                params[key] *= 1;
            }
        });
        return _.defaults(params, this.defaultParams);
    },

    render: function() {
        this.$el.html('<pre class="well">' + JSON.stringify(this.model.toJSON(), 0, 4) + '</pre>');
        return this;
    }

});
exports = module.exports = ContainerLogPageView;