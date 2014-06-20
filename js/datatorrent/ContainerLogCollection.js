var BaseCollection = require('./BaseCollection');
var ContainerLogModel = require('./ContainerLogModel');


var ContainerLogCollection = BaseCollection.extend({

    debugName: 'container logs',

    initialize: function(models, options) {

        this.appId = options.appId;
        this.containerId = options.containerId;

    },

    model: ContainerLogModel,

    url: function() {
        return this.resourceURL('ContainerLog', {
            appId: this.appId,
            containerId: this.containerId
        });
    },

    responseTransform: 'logs'

});

exports = module.exports = ContainerLogCollection;