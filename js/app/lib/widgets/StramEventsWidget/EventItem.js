var _ = require('underscore');
var kt = require('knights-templar');
var BaseView = require('bassview');
var EventItem = BaseView.extend({
    className: 'event-item',
    initialize: function(options) {
        this.parent = options.parent;
        this.listenTo(this.model, 'change:selected', this.render);
    },
    render: function() {
        var json = this.model.toJSON();

        // give timestamp a proper format
        var timestamp = new Date(json.timestamp*1);
        var nowDay = new Date().toDateString();

        json.timestamp = nowDay === timestamp.toDateString() ? timestamp.toLocaleTimeString() : timestamp.toLocaleString();

        var html = this.template(json);
        this.$el.html(html);
        if (json.type) {
            this.$el.addClass('event-' + json.type.toLowerCase());
        }
        if (json.selected) {
            this.$el.addClass('selected');
        } else {
            this.$el.removeClass('selected');
        }
        return this;
    },
    events: {
        mousedown: function(evt) {
            var makeSelected = true;
            evt.preventDefault();
            evt.originalEvent.preventDefault();
            if (!evt.shiftKey) {
                this.collection.each(function(evt){
                    evt.set('selected', false);
                });
            } else {
                makeSelected = !(!!this.model.get('selected'));
            }
            this.parent.$el.focus();
            this.model.set('selected', makeSelected);
        }
    },
    template: kt.make(__dirname+'/EventItem.html')
});
exports = module.exports = EventItem;