var BaseCollection = require('./BaseCollection');
var StramEventModel = require('./StramEventModel');
var StramEventCollection = BaseCollection.extend({
    initialize:function(models,options) {
        this.appId = options.appId;
        this.dataSource = options.dataSource;
    },
    subscribe: function() {
        var topic = this.resourceTopic('StramEvents', {
            appId: this.appId
        });
        this.listenTo(this.dataSource, topic, function(evt) {
            this.add(evt);
        });
        this.dataSource.subscribe(topic);
    },
    model: StramEventModel,
    responseTransform: 'events',
    url: function() {
        return this.resourceURL('StramEvent', {
            appId: this.appId
        });
    }
});
exports = module.exports = StramEventCollection;