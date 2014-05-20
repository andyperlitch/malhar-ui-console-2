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
    },
    toOptions: function() {
        var json = this.toJSON();
        json.from = json.from.valueOf();
        json.to = json.to.valueOf();
        return json;
    }
});
var StramEventsWidget = BaseView.extend({
    
    initialize: function(options) {
        
        BaseView.prototype.initialize.call(this, options);

        if (this.widgetDef.get('height') === 'auto') {
            // Requires explicit height
            this.widgetDef.set('height', this.defaultHeight);
        }

        this.rangeParams = new StramEventRange({
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

        // Cached events per mode
        this.cache = {
            tail: [],
            range: []
        }
        
        // TODO: load from state
        this.viewMode = 'tail';
        this.showRaw = false;
        this.setInterceptFunction();

        // Clean up datepickers
        this.on('clean_up', this.removeDateTimePickers);

    },

    defaultHeight: 300,
    
    updateHeight: function() {
        BaseView.prototype.updateHeight.call(this);
        this.$el.css('height', 'auto');
    },

    heightResizeElement: '.event-list',

    html: function() {
        var json = {
            viewMode: this.viewMode,
            showRaw: this.showRaw,
            widgetId: this.compId().replace('.','-'),
            range: this.rangeParams.toJSON(),
            eventListHeight: this.widgetDef.get('height') + 'px'
        };
        var html = this.template(json);
        return html;
    },

    postRender: function() {
        this.setupDateTimePickers();
    },

    setupDateTimePickers: function() {
        var $dates = this.$('.form_datetime');
        if ($dates.length) {
            $dates.datetimepicker({
                weekStart: 0,
                todayBtn:  1,
                autoclose: 1,
                todayHighlight: 1,
                startView: 2,
                forceParse: 0,
                minuteStep: 1,
                showMeridian: 1
            });
        }
    },

    removeDateTimePickers: function() {
        var $dates = this.$('.form_datetime');
        if ($dates.length) {
            $dates.datetimepicker('remove');
            $('.datetimepicker').remove();
        }
    },
    
    assignments: {
        '.event-list': 'list',
        '.event-viewer': 'viewer'
    },

    events: {
        'change [name="viewMode"]': 'onViewModeChange',
        'change .show-raw-event-data': 'onShowRawChange',
        'submit .stram-event-options': 'onRangeSubmit',
        'blur .form_datetime input': 'updateDateFields'
    },

    onViewModeChange: function(evt) {
        var newMode = this.$('form [name="viewMode"]:checked').val();
        if (newMode !== this.viewMode) {
            this.cache[this.viewMode] = this.collection.toJSON();
            this.collection.reset(this.cache[newMode]);
            this.viewMode = newMode;
            this.setInterceptFunction();
            this.renderContent();
            if (newMode === 'range') {
                this.setupDateTimePickers();
            }
        }
    },

    onShowRawChange: function(evt) {
        var showRaw = this.$('form .show-raw-event-data:checked');
        this.showRaw = !! showRaw.length;
        var method = this.showRaw ? 'show' : 'hide';
        this.$('.event-viewer-container')[method]();
    },

    onRangeSubmit: function(evt) {
        evt.preventDefault();
        var fromVal, toVal, from, to;

        fromVal = this.$('[name="range-from"]').val();
        from = new Date(fromVal);
        toVal = this.$('[name="range-to"]').val();
        to = new Date(toVal);

        if (from.toString() === 'Invalid Date') {
            console.log('from date is invalid: ', fromVal);
            return;
        } else if (to.toString() === 'Invalid Date') {
            console.log('to date is invalid: ', toVal);
            return;
        }

        this.rangeParams.set({
            from: from,
            to: to,
            limit: 100,
            offset: 0
        });
        this.collection.reset([]);
        var promise = this.collection.fetch({
            data: this.rangeParams.toOptions()
        });
        var self = this;
        promise.always(function() {
            self.subview('list').removeLoading();
        });
        this.subview('list').showLoading();
    },

    updateDateFields: function() {
        var $dates, fromInput, fromVal, from, fromTarget, toInput, toVal, to, toTarget;
        $dates = this.$('.form_datetime');
        if ($dates.length) {

            fromInput = this.$('[name="range-from"]');
            fromVal = fromInput.val();
            from = new Date(fromVal);
            if (from.toString() !== 'Invalid Date') {
                fromTarget = fromInput.parent();
                fromTarget.datetimepicker('update', from);    
            }

            toInput = this.$('[name="range-to"]');
            toVal = toInput.val();
            to = new Date(toVal);
            if (to.toString() !== 'Invalid Date') {
                toTarget = toInput.parent();
                toTarget.datetimepicker('update', to);
            }

        }
    },

    setInterceptFunction: function() {
        if (this.viewMode === 'range') {
            var self = this;
            this.collection.interceptEvent = function(evt) {
                self.cache.tail.unshift(evt);
            }
        } else {
            this.collection.interceptEvent = StramEventCollection.prototype.interceptEvent;
        }
    },
    
    template: kt.make(__dirname+'/StramEventsWidget.html','_')
    
});

exports = module.exports = StramEventsWidget;