var BaseView = require('bassview');
var EventItem = require('./EventItem');
var EventList = BaseView.extend({

    initialize: function(options) {
        this.parent = options.parent;
        this.listenTo(this.collection, 'add', this.addOne);
    },

    render: function() {
        this.trigger('clean_up');
        this.collection.each(this.addOne);
    },

    addOne: function(model) {
        var itemView = new EventItem({
            model: model,
            collection: this.collection
        });
        itemView.listenTo(this, 'clean_up', itemView.remove);
        if (this.parent.viewMode === 'tail') {
            itemView.$el.css('display', 'none');
            this.$el.prepend(itemView.render().el);
            itemView.$el.slideDown('fast');
        } else {
            this.$el.prepend(itemView.render().el);
        }
    }

});
exports = module.exports = EventList;