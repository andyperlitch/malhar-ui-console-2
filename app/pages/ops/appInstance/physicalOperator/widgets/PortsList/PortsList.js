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
  'app.components.services.dtText',
  'app.components.services.tableOptionsFactory',
  'app.components.directives.dtTableResize'
])

// Widget Data Model
.factory('PortsListWidgetDataModel', function(BaseDataModel, dtText, tableOptionsFactory) {

  var PortsListWidgetDataModel = BaseDataModel.extend({

    constructor: function(options) {
      this.fetchPromise = options.operatorFetchPromise;
      BaseDataModel.apply(this, arguments);
    },

    init: function() {

      var scope = this.widgetScope;

      if (!scope.physicalOperator.data.ports) {
        scope.physicalOperator.data.ports = [];
      }

      scope.table_options = tableOptionsFactory({
        initial_sorts: [
          { id: 'name', dir: '+' }
        ]
      }, scope.widget, scope);

      scope.fetchPromise.finally(function() {
        scope.table_options.setLoading(false);
      });

      scope.selected = [];
      scope.columns = [
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
          template: '<a dt-page-href="Port" params="{ appId: \'' + scope.appId + '\', operatorId: \'' + scope.operatorId + '\', portName: row.name }">{{row.name}}</a>',
          title: dtText.get('Name of the port.')
        },
        {
          id: 'type',
          key: 'type',
          label: dtText.get('type_label'),
          filter: 'like',
          sort: 'string',
          template: '<span ng-class="\'port-type-\' + row.type">{{ row.type }}</span>',
          title: dtText.get('Port type, e.g. input or output.')
        },
        {
          id: 'tuplesPSMA',
          key: 'tuplesPSMA',
          label: dtText.get('tuples_per_sec'),
          filter: 'number',
          sort: 'number',
          ngFilter: 'commaGroups',
          title: dtText.get('Moving average number of tuples emitted or ingested by this port per second.')
        },
        {
          id: 'totalTuples',
          key: 'totalTuples',
          label: dtText.get('tuples_total'),
          filter: 'number',
          sort: 'number',
          ngFilter: 'commaGroups',
          title: dtText.get('Total number of tuples emitted or ingested by this port')
        },
        {
          id: 'bufferServerBytesPSMA',
          key: 'bufferServerBytesPSMA',
          label: dtText.get('buffer_server_bps_label'),
          filter: 'number',
          sort: 'number',
          template: '{{ row.bufferServerBytesPSMA | byte }}',
          title: dtText.get('Memory taken up in the buffer server.')
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