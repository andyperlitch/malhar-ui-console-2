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
var BaseView = require('bassview');
var InfoSubView = BaseView.extend({

    initialize: function(options) {
        this.gatewayConnectAddress = new DT.lib.ConfigPropertyModel({ name: 'dt.attr.GATEWAY_CONNECT_ADDRESS' });
        this.dfsRootDirectory = new DT.lib.ConfigPropertyModel({ name: 'dt.dfsRootDirectory' });
        this.about = new DT.lib.GatewayInfoModel();

        this.allPromise = $.when(
            this.gatewayConnectAddress.fetch(),
            this.dfsRootDirectory.fetch(),
            this.about.fetch()
        );

        this.allPromise.always(this.render.bind(this));
    },

    render: function() {
        var json = {
            fetchState: this.allPromise.state(),

            gatewayConnectAddress: this.gatewayConnectAddress.toJSON(),
            dfsRootDirectory: this.dfsRootDirectory.toJSON(),
            about: this.about.toJSON()
        };
        var html = this.template(json);
        this.$el.html(html);
        return this;
    },

    template: kt.make(__dirname+'/InfoSubView.html')

});
exports = module.exports = InfoSubView;