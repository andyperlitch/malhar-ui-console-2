var BaseModel = require('./BaseModel');
var StramEventModel = BaseModel.extend({
    defaults: {
        type: '',
        data: {},
        timestamp: 0
    }
});
exports = module.exports = StramEventModel;