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
'use strict';

/**
 * PhysicalOperatorsListWidget
 *
 * Displays a list of physical operators for a given application
 */

// Module Definition
angular.module('app.components.widgets.PhysicalOperatorsList', [
  'app.components.widgets.Base',
  'app.settings',
  'app.components.resources.PhysicalOperatorCollection',
  'app.components.services.dtText',
  'app.components.filters.percent2cpu'
])

// Widget Data Model
.factory('PhysicalOperatorsListWidgetDataModel', function(BaseDataModel, PhysicalOperatorCollection, dtText) {
  var PhysicalOperatorsListWidgetDataModel = BaseDataModel.extend({

    init: function() {
      
      // Set up resource
      var resource = this.resource = this.widgetScope.resource = new PhysicalOperatorCollection({
        // Will always be available
        appId: this.widgetScope.appId,
        // May be defined if on container page
        containerId: this.widgetScope.containerId,
        // May be defined if on logical operator page
        operatorName: this.widgetScope.operatorName
      });
      resource.fetch();
      resource.subscribe(this.widgetScope);

      // Set the table options
      this.widgetScope.table_options = {
        row_limit: 10,
        initial_sorts: [
          { id: 'id', dir: '+' }
        ],
        appInstance: this.widgetScope.appInstance
      };

      // Set the table columns
      this.widgetScope.columns = [
        {
          id: 'selector',
          selector: true,
          key: 'id',
          label: '',
          width: '40px',
          lock_width: true
        },
        {
          id: 'id',
          key: 'id',
          filter: 'number',
          sort: 'number',
          template: '<a dt-page-href="PhysicalOperator" params="{ appId: \'' + this.widgetScope.appId + '\', operatorId: row.id }">{{ row.id }}</a>',
          width: '4em'
        },
        {
          id: 'name',
          key: 'name',
          filter: 'like',
          sort: 'string',
          template: '<a dt-page-href="LogicalOperator" params="{ appId: \'' + this.widgetScope.appId + '\', operatorName: row.name }">{{ row.name }}</a>'
        },
        {
          id: 'status',
          key: 'status',
          label: dtText.get('status_label'),
          sort: 'string',
          filter: 'like',
          template: '<span dt-status="row.status"></span>'
        },
        {
          id: 'tuplesProcessedPSMA',
          key: 'tuplesProcessedPSMA',
          label: dtText.get('processed_per_sec'),
          sort: 'number',
          filter: 'number',
          ngFilter: 'commaGroups'
        },
        {
          id: 'tuplesEmittedPSMA',
          key: 'tuplesEmittedPSMA',
          label: dtText.get('emitted_per_sec'),
          sort: 'number',
          filter: 'number',
          ngFilter: 'commaGroups'
        },
        {
          id: 'cpuPercentageMA',
          key: 'cpuPercentageMA',
          label: dtText.get('cpu_percentage_label'),
          sort: 'number',
          filter: 'number',
          format: function(value) {
            return (value * 1).toFixed(2) + '%';
          }
        },
        {
          id: 'currentWindowId',
          key: 'currentWindowId',
          label: dtText.get('current_wid_label'),
          sort: 'string',
          filter: 'like',
          template: '<span window-id="row.currentWindowId" window-size="options.appInstance.data.attributes.STREAMING_WINDOW_SIZE_MILLIS"></span>'
        },
        {
          id: 'recoveryWindowId',
          key: 'recoveryWindowId',
          label: dtText.get('recovery_wid_label'),
          sort: 'string',
          filter: 'like',
          template: '<span window-id="row.recoveryWindowId" window-size="options.appInstance.data.attributes.STREAMING_WINDOW_SIZE_MILLIS"></span>'
        },
        {
          id: 'failureCount',
          key: 'failureCount',
          label: dtText.get('failure_count_label'),
          sort: 'string',
          filter: 'like',
          width: '4em',
        },
        {
          id: 'lastHeartbeat',
          key: 'lastHeartbeat',
          label: 'last heartbeat',
          sort: 'number',
          filter: 'date',
          ngFilter: 'relativeTimestamp'
        },
        // host
        {
          id: 'host',
          key: 'host',
          label: dtText.get('host_label'),
          sort: 'string',
          filter: 'like',
          width: '20em'
        },
        // container
        {
          id: 'container',
          key: 'container',
          label: dtText.get('container_label'),
          sort: 'string',
          template: '<a dt-page-href="Container" params="{ appId: \'' + this.widgetScope.appId + '\', containerId: row.container }" dt-container-shorthand="row.container"></a>'
        },
        {
          id: 'latencyMA',
          key: 'latencyMA',
          label: dtText.get('latency_ms_label'),
          sort: 'number',
          filter: 'number'
        },
        {
          id: 'totalTuplesProcessed',
          key: 'totalTuplesProcessed',
          label: dtText.get('processed_total'),
          sort: 'number',
          filter: 'number',
          ngFilter: 'commaGroups'
        },
        {
          id: 'totalTuplesEmitted',
          key: 'totalTuplesEmitted',
          label: dtText.get('emitted_total'),
          sort: 'number',
          filter: 'number',
          ngFilter: 'commaGroups'
        }
      ];

      // Set the selected array
      this.widgetScope.selected = [];

    }

  });
  return PhysicalOperatorsListWidgetDataModel;
})

// Widget Definition
.factory('PhysicalOperatorsListWidgetDef', function(BaseWidget, PhysicalOperatorsListWidgetDataModel) {
  var PhysicalOperatorsListWidgetDef = BaseWidget.extend({
    defaults: {
      dataModelType: PhysicalOperatorsListWidgetDataModel,
      title: 'Physical Operators', // default display name (editable by user)
      templateUrl: 'components/widgets/PhysicalOperatorsList/PhysicalOperatorsList.html',
    }
  });

  return PhysicalOperatorsListWidgetDef;
});