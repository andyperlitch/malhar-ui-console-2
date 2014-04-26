/*
 * Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
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
var kt = require('knights-templar');
var BaseView = DT.lib.WidgetView;
var StramEventCollection = DT.lib.StramEventCollection;

var EventList = require('./EventList');
var EventViewer = require('./EventViewer');

/**
 * StramEventsWidget
 * 
 * Displays StrAM decision events.
 *
*/
var StramEventsWidget = BaseView.extend({
    
    initialize: function(options) {
        
        BaseView.prototype.initialize.call(this, options);
        this.collection = new StramEventCollection([],{
            dataSource: options.dataSource,
            appId: options.appId
        });
        this.collection.subscribe();

        this.subview('list', new EventList({
            collection: this.collection,
            parent: this
        }));
        this.subview('viewer', new EventViewer({
            collection: this.collection
        }));
        
        // TODO: load from state
        this.viewMode = 'tail';

        this.collection.fetch({
            data: {
                from: Date.now() - 600000,
                to: Date.now()
            }
        });

    },
    
    html: function() {
        var json = {
            viewMode: this.viewMode
        };
        var html = this.template(json);
        return html;
    },
    
    assignments: {
        '.event-list': 'list',
        '.event-viewer': 'viewer'
    },

    events: {
        'change [name="viewMode"]': 'onViewModeChange'
    },

    onViewModeChange: function(evt) {
        var newMode = this.$('form [name="viewMode"]:checked').val();
        if (newMode !== this.viewMode) {
            this.viewMode = newMode;
            this.renderContent();
        }
    },
    
    template: kt.make(__dirname+'/StramEventsWidget.html','_')
    
});

exports = module.exports = StramEventsWidget;