var BaseView = require('bassview');
var formatters = DT.formatters;
var EpoxyView = DT.lib.BaseEpoxyView;
var OptionView = BaseView.extend({

    tagName: 'option',

    initialize: function() {
        var name = this.model.get('name');
        this.$el.text(name + ' (' + formatters.byteFormatter(this.model.get('length') * 1) + ')' );
        this.$el.attr('value', name);
    }

});

var CtnrLogViewerSelectView = EpoxyView.extend({

    itemView: OptionView

});
exports = module.exports = CtnrLogViewerSelectView;