var BaseModel = require('./BaseModel');
var ContainerLogModel = BaseModel.extend({

    idAttribute: 'name',

    defaults: {
        length: 0,
        name: ''
    }

});
exports = module.exports = ContainerLogModel;