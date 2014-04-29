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
            collection: this.collection,
            parent: this
        });
        itemView.listenTo(this, 'clean_up', itemView.remove);
        if (this.parent.viewMode === 'tail') {
            itemView.$el.css('display', 'none');
            this.$el.prepend(itemView.render().el);
            itemView.$el.slideDown('fast');
        } else {
            this.$el.prepend(itemView.render().el);
        }
    },

    events: {
        'keydown': 'onKeyPress'
    },

    onKeyPress: function(e) {
        if (this.keys.hasOwnProperty(e.which)) {
            e.preventDefault();
            e.stopPropagation();
            this.keys[e.which].call(this,e);
        }
    },

    keys: {
        // up
        38: function(e) {
            var selected = this.collection.pluck('selected');
            if (this.parent.viewMode === 'tail') {
                selected.unshift(false);
                selected.pop();
            } else {
                selected.shift();
                selected.push(false);
            }
            selected.forEach(function(selected, i) {
                this.collection.at(i).set('selected', !!selected);
            }, this);
        }, 
        // down
        40: function(e) {
            var selected = this.collection.pluck('selected');
            if (this.parent.viewMode === 'tail') {
                selected.shift();
                selected.push(false);
            } else {
                selected.unshift(false);
                selected.pop();
            }
            selected.forEach(function(selected, i) {
                this.collection.at(i).set('selected', !!selected);
            }, this);
        }
    }

});
exports = module.exports = EventList;