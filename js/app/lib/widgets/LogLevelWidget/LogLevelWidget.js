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

/**
 * LogLevelWidget
 * 
 * Set the log level for one or more classes/packages
 *
*/

var LogLevelWidget = BaseView.extend({

    initialize: function(options) {
        BaseView.prototype.initialize.apply(this, arguments);
        this.appId = options.appId;
        this.loggers = [{}];
    },

    events: {
        'change .logger-input': 'updateLogger',
        'click .addLogger': 'addLogger',
        'submit .log-level-form': 'submitLogLevels',
        'click .remove-log-level-item': 'removeLogLevel'
    },

    removeLogLevel: function(e) {
        e.preventDefault();
        var index = $(e.target).data('index') * 1;
        this.loggers.splice(index, 1);
        this.renderContent();
    },

    addLogger: function(e) {
        e.preventDefault();
        this.loggers.push({ target: '', logLevel: '' });
        this.renderContent();
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