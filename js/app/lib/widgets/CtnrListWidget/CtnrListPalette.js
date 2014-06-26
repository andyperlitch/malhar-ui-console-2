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

/**
 * Palette view for Container List
*/
var BaseView = DT.lib.ListPalette;
var _ = require('underscore');
var kt = require('knights-templar');
var Palette = BaseView.extend({
    
    initialize: function(options) {
        this.listenTo(this.collection, 'change_selected', function() {
            var selected = this.getSelected();
            if (selected.length === 1) {
                _.each(selected, function(ctnr) {
                    ctnr.logs.appId = this.model.get('id');
                    ctnr.logs.fetch().then(this.render.bind(this));
                }, this);
            }
        });
        BaseView.prototype.initialize.call(this, options);

    },

    getTemplateData: function() {
        return {
            selected: this.getSelected(true),
            appId: this.model.get('id')
        }
    },

    events: {
        'click .inspectItem' : 'inspectContainer',
        'click .killCtnrs': 'killContainers',
        'click .selectAllButMaster': 'selectAllButMaster',
        'click .selectAll': 'selectAll',
        'click .deselectAll': 'deselectAll',
        'click .getEndedCtnrs': 'getEndedCtnrs'
    },
    
    inspectContainer: function() {
        var ctnrId = this.getSelected()[0].get('id');
        this.nav.go('ops/apps/' + this.model.get('id') + '/containers/' + ctnrId, { trigger:true } );
    },

    killContainers: function(evt) {
        this.$('.killCtnrs').prop('disabled', true);
        var selected = this.getSelected();
        var self = this;
        _.each(selected, function(ctnr) {
            var promise = ctnr.kill();
            promise.always(self.render.bind(self));
        });
    },

    selectAll: function() {
        this.collection.each(function(c) {
            if (c.get('state') === 'ACTIVE') {
                c.selected = true;
            }
        });
        this.collection.trigger('change_selected');
        this.collection.trigger('tabled:update');
    },

    selectAllButMaster: function() {
        this.collection.each(function(c) {
            if ( c.get('state') === 'ACTIVE' && !(/_[0]+1$/.test(c.get('id'))) ) {
                c.selected = true;
            }
        });
        this.collection.trigger('change_selected');
        this.collection.trigger('tabled:update');
    },

    deselectAll: function() {
        this.collection.each(function(c) {
            c.selected = false;
        });
        this.collection.trigger('change_selected');
        this.collection.trigger('tabled:update');  
    },

    getEndedCtnrs: function() {
        return this.collection.fetch({
            data: {}
        });
    },

    template: kt.make(__dirname+'/CtnrListPalette.html')
    
});

exports = module.exports = Palette