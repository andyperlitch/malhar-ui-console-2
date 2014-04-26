var _ = require('underscore');
var kt = require('knights-templar');
var BaseView = require('bassview');
var EventViewer = BaseView.extend({
    initialize: function(options) {
        this.listenTo(this.collection, 'change:selected', this.render);
    },
    render: function() {
        var selected = this.collection.where({selected: true});
        var json = {
            selected: selected
        };
        var html = this.template(json);
        this.$el.html(html);
        return this;
    },
    template: kt.make(__dirname+'/EventViewer.html')
});
exports = module.exports = EventViewer;