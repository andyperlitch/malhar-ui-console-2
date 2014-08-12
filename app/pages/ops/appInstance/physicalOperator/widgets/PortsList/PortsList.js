/*
* Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
* awesome
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
'use strict';

/**
 * PortsListWidget
 *
 * Shows the ports on a physical operator.
 */

// Module Definition
angular.module('app.pages.ops.appInstance.physicalOperator.widgets.PortsList', [
  'app.components.widgets.Base',
  'app.settings',
  'app.components.services.dtText'
])

// Widget Data Model
.factory('PortsListWidgetDataModel', function(BaseDataModel, dtText) {

  var PortsListWidgetDataModel = BaseDataModel.extend({

    init: function() {

      if (!this.widgetScope.physicalOperator.data.ports) {
        this.widgetScope.physicalOperator.data.ports = [];
      }

      this.widgetScope.table_options = {
        initial_sorts: [
          { id: 'name', dir: '+' }
        ]
      };
      this.widgetScope.selected = [];
      this.widgetScope.columns = [
        {
          id: 'selector',
          selector: true,
          key: 'name',
          label: '',
          width: '40px',
          lock_width: true
        },
        {
          id: 'name',
          key: 'name',
          label: dtText.get('name_label'),
          filter: 'like',
          sort: 'string',
          template: '<a dt-page-href="Port" params="{ appId: \'' + this.widgetScope.appId + '\', operatorId: \'' + this.widgetScope.operatorId + '\', portId: row.name }">{{row.name}}</a>'
        },
        {
          id: 'type',
          key: 'type',
          label: dtText.get('type_label'),
          filter: 'like',
          sort: 'string',
          template: '<span ng-class="\'port-type-\' + row.type">{{ row.type }}</span>'
        },
        {
          id: 'tuplesPSMA',
          key: 'tuplesPSMA',
          label: dtText.get('tuples_per_sec'),
          filter: 'number',
          sort: 'number',
          ngFilter: 'commaGroups'
        },
        {
          id: 'totalTuples',
          key: 'totalTuples',
          label: dtText.get('tuples_total'),
          filter: 'number',
          sort: 'number',
          ngFilter: 'commaGroups'
        },
        {
          id: 'bufferServerBytesPSMA',
          key: 'bufferServerBytesPSMA',
          label: dtText.get('buffer_server_bps_label'),
          filter: 'number',
          sort: 'number',
          ngFilter: 'commaGroups'
        }
      ];

    }

  });
  return PortsListWidgetDataModel;
})

// Widget Definition
.factory('PortsListWidgetDef', function(BaseWidget, PortsListWidgetDataModel) {
  var PortsListWidgetDef = BaseWidget.extend({
    defaults: {
      dataModelType: PortsListWidgetDataModel,
      title: 'Ports',
      templateUrl: 'pages/ops/appInstance/physicalOperator/widgets/PortsList/PortsList.html'
    }
  });

  return PortsListWidgetDef;
});