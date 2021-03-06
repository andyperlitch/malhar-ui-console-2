/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Backbone = require('backbone');

var MemoryGaugeModel = Backbone.Model.extend({
    defaults: {
        value: 0
    },

    initialize: function(attributes, options) {
        if (options.model) {
            this.listenTo(options.model, 'change:memoryMBAllocated change:memoryMBFree', this.update);
        }
    },

    update: function (model) {
        var value;
        var memoryMBAllocated = model.get('memoryMBAllocated');
        if (memoryMBAllocated !== 0) {
            var memoryMBFree = model.get('memoryMBFree');
            value = Math.round((memoryMBAllocated - memoryMBFree)/memoryMBAllocated * 100);
        } else {
            value = 0;
        }
        this.set('value', value);
    }
});

exports = module.exports = MemoryGaugeModel;