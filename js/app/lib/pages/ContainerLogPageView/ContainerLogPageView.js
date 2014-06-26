var _ = require('underscore');
var kt = require('knights-templar');
var Epoxy = require('backbone.epoxy');
var BaseView = require('bassview');
var settings = DT.settings.containerLogs;
var ContainerLogModel = DT.lib.ContainerLogModel;
var ContainerLogPageView = BaseView.extend({

    initialize: function(options) {
        this.nav = options.app.nav;
        this.params = options.pageParams;
        this.params.name = this.params.logName;
        delete this.params.logName;
        var initParams = this.parseParameters(this.params.parameters);
        delete this.params.parameters;
        this.model = new ContainerLogModel(this.params);
        this.model.fetch()
            .then(_.bind(function() {
                this.model.set('parameters', initParams);
                this.model.getLogContent()
                    .then(_.bind(function() {
                        this.render();
                    }, this));
            }, this));
        this.listenTo(this.model, 'change:content', function() {
            this.updateLogContent();
        });
    },

    defaultParams: {
        start: settings.DEFAULT_START_OFFSET
    },

    parseParameters: function(string) {
        // remove question mark
        if (typeof string !== 'string') {
            return _.extend({}, this.defaultParams);
        }
        string = string.replace(/^\?/, '');
        var arr = string.split('&');
        var params = {};
        _.each(arr, function(p) {
            var a = p.split('=');
            params[a[0]] = a[1];
        });
        _.each(['start', 'end'], function(key) {
            if (params.hasOwnProperty(key)) {
                params[key] *= 1;
            }
        });
        return _.defaults(params, this.defaultParams);
    },

    render: function() {
        // this.$el.html('<pre class="well">' + JSON.stringify(this.model.toJSON(), 0, 4) + '</pre>');
        var json = {
            log: this.model.toJSON(),
            logs: this.model.allLogs
        };
        var html = this.template(json);
        this.$el.html(html);
        _.defer(this.postRender.bind(this));
        return this;
    },

    postRender: function() {
        var el = this.$('.parameter-inputs')[0];
        this.epoxyBindings = new Epoxy.View({
            el: el,
            model: this.model.get('parameters')
        });
        this.epoxyBindings.listenToOnce(this, 'clean_up', this.epoxyBindings.remove);
    },

    events: {
        'change .logName': 'jumpToLog',
        'submit .container-log-page': 'onFormSubmit',
        'mousewheel .log-content-wrapper': 'onWheel'
    },

    onFormSubmit: function(e) {
        e.preventDefault();
        this.updateLogContent('loading...');
        var self = this;
        this.model.getLogContent().then(function() {
            self.updateLogContent();
        });
    },

    onWheel: function(event) {
        var $contentWrapper = this.$('.log-content-wrapper');
        var $content = $contentWrapper.find('.log-content');
        var paddingTop = parseInt($contentWrapper.css('padding-top'));
        var scrollTop = $contentWrapper.scrollTop();
        var hitTop = scrollTop === 0;
        var borders = parseInt($contentWrapper.css('border-top-width')) + parseInt($contentWrapper.css('border-bottom-width'));
        var hitBottom = $contentWrapper[0].scrollHeight - scrollTop + borders <= $contentWrapper.outerHeight();
        var direction = event.deltaY;
        var promise;
        var selector;
        var flag;
        var method;
        var self = this;
        if ( hitBottom && direction < 0 ) {
            selector = 'append';
            method = 'appendToLogContent';
            flag = '_appendingContent';
        }
        else if (hitTop && direction > 0) {
            selector = 'prepend';
            method = 'prependToLogContent';
            flag = '_prependingContent';
        }
        else return;

        if (self[flag]) {
            return;
        }

        var curHeight = $content.height();

        self[flag] = true;
        var $msg = self.$('.loading-msg.' + selector);
        $msg.show();
        promise = this.model[method](1024 * settings.DEFAULT_SCROLL_REQUEST_KB);
        promise.always(function() {
            var newHeight = $content.height();
            
            if (hitTop) {
                $contentWrapper.scrollTop(newHeight - curHeight - $msg.height() - paddingTop);
            }

            setTimeout(function() {
                self[flag] = false;
            }, settings.UNSET_REQUEST_FLAG_WAIT);
            $msg.hide();
        });
    },

    updateLogContent: function(data) {
        this.$('.log-content').html(data || this.model.get('content'));
    },

    jumpToLog: function(e) {
        var log = this.$('.logName').val();
        this.nav.go('ops/apps/' + this.params.appId + '/containers/' + this.params.containerId + '/logs/' + log);
    },

    template: kt.make(__dirname+'/ContainerLogPageView.html')

});
exports = module.exports = ContainerLogPageView;