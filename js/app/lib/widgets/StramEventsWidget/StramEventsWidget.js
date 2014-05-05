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
var StramEventCollection = DT.lib.StramEventCollection;

var EventList = require('./EventList');
var EventViewer = require('./EventViewer');

var bbind = DT.lib.Bbindings;

/**
 * StramEventsWidget
 * 
 * Displays StrAM decision events.
 *
*/

var StramEventRange = Backbone.Model.extend({
    validate: function(attrs) {
        var errors = {};



        if (!_.isEmpty(errors)) {
            return errors;
        }
    }
});
var StramEventsWidget = BaseView.extend({
    
    initialize: function(options) {
        
        BaseView.prototype.initialize.call(this, options);

        var rangeParams = new StramEventRange({
            from: '',
            to: ''
        });

        this.appId = options.appId;
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
        this.showRaw = false;

    },
    
    html: function() {
        var json = {
            viewMode: this.viewMode,
            showRaw: this.showRaw
        };
        var html = this.template(json);
        return html;
    },
    
    assignments: {
        '.event-list': 'list',
        '.event-viewer': 'viewer'
    },

    events: {
        'change [name="viewMode"]': 'onViewModeChange',
        'change .show-raw-event-data': 'onShowRawChange'
    },

    onViewModeChange: function(evt) {
        var newMode = this.$('form [name="viewMode"]:checked').val();
        if (newMode !== this.viewMode) {
            this.viewMode = newMode;
            this.renderContent();
        }
    },

    onShowRawChange: function(evt) {
        var showRaw = this.$('form .show-raw-event-data:checked');
        this.showRaw = !! showRaw.length;
        var method = this.showRaw ? 'show' : 'hide';
        this.$('.event-viewer-container')[method]();
    },
    
    template: kt.make(__dirname+'/StramEventsWidget.html','_')
    
});

exports = module.exports = StramEventsWidget;