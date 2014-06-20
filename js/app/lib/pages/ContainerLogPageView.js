var _ = require('underscore');
var BaseView = require('bassview');
var ContainerLogPageView = BaseView.extend({

    initialize: function(options) {
        this.params = options.pageParams;
        this.params.parameters = this.parseParameters(this.params.parameters);
    },

    parseParameters: function(string) {
        // remove question mark
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
        return params;
    },

    render: function() {
        this.$el.html('<pre class="well">' + JSON.stringify(this.params, 0, 4) + '</pre>');
        return this;
    }

});
exports = module.exports = ContainerLogPageView;