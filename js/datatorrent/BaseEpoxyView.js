var _ = require('underscore');
var Backbone = require('backbone');
var Epoxy = require('backbone.epoxy');
var bassview = require('bassview');
var epoxyViewOptions = [
    'viewModel',
    'bindings',
    'bindingFilters',
    'bindingHandlers',
    'bindingSources',
    'computeds'
];
var BaseEpoxyView = bassview.extend({

    initialize: function(options) {
        _.extend(this, _.pick(options, epoxyViewOptions));
        this.applyBindings();
    },

    setElement: function() {
        bassview.prototype.setElement.apply(this, arguments);        
        this.applyBindings();
        return this;
    }

});
Backbone.Epoxy.View.mixin( BaseEpoxyView.prototype );
exports = module.exports = BaseEpoxyView;