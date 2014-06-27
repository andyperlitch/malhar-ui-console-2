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
var kt = require('knights-templar');
var BaseView = DT.lib.WidgetView;
var settings = DT.settings;
var Notifier = DT.lib.Notifier;
var text = DT.text;
var ModalView = DT.lib.ModalView;
var BaseCollection = DT.lib.BaseCollection;

/**
 * LogLevelWidget
 * 
 * Set the log level for one or more classes/packages
 *
*/

var LoggerSearch = BaseCollection.extend({
    debugName: 'logger search',
    initialize: function(models, options) {
        this.appId = options.appId;
    },
    responseTransform: function(data) {
        var loggers = data.loggers;
        return _.filter(loggers, function(d) {
            return !! d.level;
        });
    },
    url: function() {
        return this.resourceAction('loggerSearch', {
            appId: this.appId
        });
    }
});

var SearchResultModal = ModalView.extend({
    title: 'Logger Level Search Results',
    body: function() {
        var results = this.collection.map(function(result) {
            return '<tr><td>' + result.attributes.name + '</td><td>' + result.attributes.level + '</td></tr>';
        });
        return '<table class="table"><thead><tr><th>class</th><th>level</th></tr></thead>' + results.join('') + '</table>';
    },
    confirmText: text('close'),
});

var LogLevelWidget = BaseView.extend({

    initialize: function(options) {
        BaseView.prototype.initialize.apply(this, arguments);
        this.appId = options.appId;
        this.loggers = [];
        this.addLogger();
        this.loggerSearch = new LoggerSearch([], options);
    },

    events: {
        'change .logger-input': 'updateLogger',
        'keyup .logger-input': 'getLogLevels',
        'click .addLogger': 'onAddClick',
        'submit .log-level-form': 'submitLogLevels',
        'click .remove-log-level-item': 'removeLogLevel',
        'click .viewSearchResults': 'showSearchModal'
    },

    removeLogLevel: function(e) {
        e.preventDefault();
        var index = $(e.target).data('index') * 1;
        this.loggers.splice(index, 1);
        this.renderContent();
    },

    onAddClick: function(e) {
        e.preventDefault();
        this.addLogger();
        this.renderContent();
    },

    addLogger: function(e) {
        this.loggers.push({ target: '', logLevel: '' });
    },

    updateLogger: function(e) {
        var el = $(e.target);
        var index = el.data('index') * 1;
        var attr = el.data('attr');
        var value = el.val();
        this.loggers[index][attr] = value;
    },

    submitLogLevels: function(e) {
        e.preventDefault();

        var errors = false;

        this.$('.alert.alert-warning').hide();

        _.each(this.loggers, function(logger, i) {
            if (!logger.target || !logger.logLevel) {
                this.$('.log-level-error-' + i).text(text('Please specify a target and a log level')).show();
                errors = true;
            }
            else if (!/^(\w+\.?)+(\*|\w+)$/.test(logger.target)) {
                this.$('.log-level-error-' + i).text(text('Invalid target name')).show();
                errors = true;
            }
        });

        if (errors) {
            return;
        }

        var promise = $.ajax({
            type: 'POST',
            url: settings.interpolateParams(settings.actions.setLogLevel, {
                v: settings.version,
                appId: this.appId
            }),
            data: JSON.stringify({
                loggers: this.loggers
            }),
            contentType: 'application/json; charset=utf-8',
            success: function() {
                Notifier.success({
                    title: text('Log levels set'),
                    text: text('The log levels of the specified targets have been set.')
                });
            },
            error: function() {
                Notifier.error({
                    title: text('An error occurred'),
                    text: text('The log levels of the specified targets could not be set do to a server error.')
                });
            }
        });
    },

    getLogLevels: _.debounce(function(e) {
        
        var $input = $(e.target);
        var expr = $input.val();
        var search = this.loggerSearch;
        var defaultText = text('log_level_target_desc');
        this.$('p.log-level-help-text').text(defaultText);
        var helpBlock = $input.next('p.log-level-help-text');
        helpBlock.text('searching...');
        search.fetch({ data: { pattern: expr }})
        .then(function() {
            if (search.length) {
                var html;
                var results = search.map(function(result) {
                    return result.get('name') + ': ' + result.get('level');
                });
                if (results.length > settings.loggerLevel.MAX_TEASER_RESULTS) {
                    var others = results.length - settings.loggerLevel.MAX_TEASER_RESULTS;
                    results = results.slice(0, settings.loggerLevel.MAX_TEASER_RESULTS);
                    results.push('<a href="#" class="viewSearchResults">' + others + ' more results...</a>');
                }
                helpBlock.html(results.join('<br>'));
            }
            else {
                helpBlock.text(defaultText);
            }
        });

    }, settings.loggerLevel.GET_LEVEL_DEBOUNCE_WAIT),

    showSearchModal: function(e) {
        e.preventDefault();
        var modal = new SearchResultModal({
            collection: this.loggerSearch
        }).addToDOM().launch();

        modal.promise().always(function() {
            modal.destroy();
        });
    },

    html: function() {
        var json = {
            levels: this.levels,
            loggers: this.loggers
        };
        var html = this.template(json);
        return html;
    },

    levels: ['OFF', 'ERROR', 'WARNING', 'INFO', 'DEBUG'],
    
    template: kt.make(__dirname+'/LogLevelWidget.html','_')
    
});

exports = module.exports = LogLevelWidget;