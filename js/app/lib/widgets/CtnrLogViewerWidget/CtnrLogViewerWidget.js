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

var _ = require('underscore');
var Backbone = require('backbone');
var kt = require('knights-templar');
var BaseView = DT.lib.WidgetView;
var ContainerLogCollection = DT.lib.ContainerLogCollection;

/**
 * CtnrLogViewerWidget
 * 
 * Description of widget.
 *
*/
var CtnrLogViewerWidget = BaseView.extend({
    
    initialize: function(options) {
        
        BaseView.prototype.initialize.call(this, options);
        
        this.collection = new ContainerLogCollection([], {
            appId: this.model.get('appId'),
            containerId: this.model.get('id')
        });
        this.listenTo(this.collection, 'sync', function() {
            if (!this.widgetDef.get('logName')) {
                this.render();
            }
        });
        this.collection.fetch();
    },
    
    html: function() {
        var html = this.template({
            state: this.widgetDef.toJSON(),
            logs: this.collection.toJSON()
        });
        return html;
    },
    
    events: {
        'change .ctnr-log-select': 'onChangeLog'
    },

    onChangeLog: function(e) {
        var logName = this.$('.ctnr-log-select').val();
        var log = this.collection.get(logName);
        if (!log) {
            return;
        }
    },
    
    template: kt.make(__dirname+'/CtnrLogViewerWidget.html','_')
    
});

exports = module.exports = CtnrLogViewerWidget;