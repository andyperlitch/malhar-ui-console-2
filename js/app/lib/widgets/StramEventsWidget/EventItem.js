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
var BaseView = require('bassview');
var EventItem = BaseView.extend({
    className: 'event-item',
    initialize: function(options) {
        this.parent = options.parent;
        this.listenTo(this.model, 'change:selected', this.render);
    },
    render: function() {
        var json = this.model.toJSON();
        json.appId = this.parent.appId;

        // give timestamp a proper format
        var timestamp = new Date(json.timestamp*1);
        var nowDay = new Date().toDateString();

        json.timestamp = nowDay === timestamp.toDateString() ? timestamp.toLocaleTimeString() : timestamp.toLocaleString();

        var html = this.template(json);
        this.$el.html(html);
        if (json.type) {
            this.$el.addClass('event-' + json.type.toLowerCase());
        }
        if (json.selected) {
            this.$el.addClass('selected');
        } else {
            this.$el.removeClass('selected');
        }
        return this;
    },
    events: {
        mousedown: function(evt) {
            var makeSelected = true;
            evt.preventDefault();
            evt.originalEvent.preventDefault();
            if (!evt.shiftKey) {
                this.collection.each(function(evt){
                    evt.set('selected', false);
                });
            } else {
                makeSelected = !(!!this.model.get('selected'));
            }
            this.parent.$el.focus();
            this.model.set('selected', makeSelected);
        },
        'mousedown a': function(e) {
            e.stopPropagation();
        }
    },
    template: kt.make(__dirname+'/EventItem.html')
});
exports = module.exports = EventItem;