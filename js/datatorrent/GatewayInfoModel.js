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

var BaseModel = require('./BaseModel');

var GatewayInfoModel = BaseModel.extend({

	defaults: {
		buildDate: 'Unknown',
    buildRevision: 'Unknown',
    buildUser: 'andy',
    buildVersion: '1.0.5-SNAPSHOT from Unknown by andy on Unknown',
    configDirectory: '/home/andy/.dt',
    hadoopIsSecurityEnabled: false,
    hadoopLocation: '/opt/cloudera/parcels/CDH-5.0.0-1.cdh5.0.0.p0.47',
    hostname: 'node0.morado.com',
    javaVersion: '1.6.0_45',
    jvmName: '10851@node0.morado.com',
    version: '1.0.5-SNAPSHOT'
	},

	url: function() {
		return this.resourceURL('GatewayInfo');
	},

    debugName: 'Gateway Info'
});

exports = module.exports = GatewayInfoModel;