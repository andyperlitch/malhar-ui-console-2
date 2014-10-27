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
 * LogicalOperatorsListWidget
 *
 * Displays a list of logical operators for a given application
 */

// Module Definition
angular.module('app.pages.ops.appInstance.widgets.LogicalOperatorsList', [
  'app.components.widgets.Base',
  'app.settings',
  'app.components.resources.LogicalOperatorCollection',
  'app.components.services.dtText',
  'app.components.filters.percent2cpu',
  'app.components.services.tableOptionsFactory',
  'app.components.directives.logicalOperatorStatus',
  'app.components.directives.dtTableResize'
])

// Widget Data Model
.factory('LogicalOperatorsListWidgetDataModel', function(BaseDataModel, LogicalOperatorCollection, dtText, tableOptionsFactory) {
  var LogicalOperatorsListWidgetDataModel = BaseDataModel.extend({

    init: function() {
      
      var scope = this.widgetScope;

      // Set up resource
      var resource = this.resource = scope.resource = new LogicalOperatorCollection({ appId: scope.appId });

      // Set the table options
      scope.table_options = tableOptionsFactory({
        row_limit: 20,
        initial_sorts: [
          { id: 'name', dir: '+' }
        ],
        appInstance: scope.appInstance
      }, scope.widget, scope);

      resource.fetch().finally(function() {
        scope.table_options.setLoading(false);
      });
      resource.subscribe(scope);

      // Set the table columns
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
          filter: 'like',
          sort: 'string',
          template: '<a dt-page-href="LogicalOperator" params="{ appId: \'' + scope.appId + '\', operatorName: row.name }">{{ row.name }}</a>',
          title: dtText.get('Name of the operator.')
        },
        {
          id: 'className',
          key: 'className',
          label: 'class',
          sort: 'string',
          filter: 'like',
          width: '300px',
          title: dtText.get('Fully-qualified Java class name of operator.')
        },
        {
          id: 'cpuPercentageMA',
          key: 'cpuPercentageMA',
          label: dtText.get('cpu_sum_label'),
          sort: 'number',
          filter: 'number',
          format: function(value) {
            return (value * 1).toFixed(2) + '%';
          },
          title: dtText.get('Aggregated CPU percentage being used by logical operator.')
        },
        {
          id: 'currentWindowId',
          key: 'currentWindowId',
          label: dtText.get('current_wid_label'),
          sort: 'string',
          filter: 'like',
          template: '<span window-id="row.currentWindowId" window-size="options.appInstance.data.attributes.STREAMING_WINDOW_SIZE_MILLIS"></span>',
          title: dtText.get('Minimum current window that all instances of this operator is processing.')
        },
        {
          id: 'recoveryWindowId',
          key: 'recoveryWindowId',
          label: dtText.get('recovery_wid_label'),
          sort: 'string',
          filter: 'like',
          template: '<span window-id="row.recoveryWindowId" window-size="options.appInstance.data.attributes.STREAMING_WINDOW_SIZE_MILLIS"></span>',
          title: dtText.get('Minimum recovery window that all instances of this operator has checkpointed to.')
        },
        {
          id: 'failureCount',
          key: 'failureCount',
          label: dtText.get('failure_count_label'),
          sort: 'string',
          filter: 'like',
          title: dtText.get('Number of failures that this logical operator has had.')
        },
        {
          id: 'lastHeartbeat',
          key: 'lastHeartbeat',
          label: 'last heartbeat',
          sort: 'number',
          filter: 'date',
          ngFilter: 'relativeTimestamp',
          title: dtText.get('The last time this operator sent information to the application master.')
        },
        {
          id: 'latencyMA',
          key: 'latencyMA',
          label: dtText.get('latency_ms_label'),
          sort: 'number',
          filter: 'number',
          title: dtText.get('Aggregate latency for all physical instances of this operator.')
        },
        {
          id: 'status',
          key: 'status',
          label: dtText.get('status_label'),
          sort: 'string',
          filter: 'like',
          template: '<span logical-operator-status="row.status"></span>',
          title: dtText.get('Statuses of the physical instances of this operator.')
        },
        {
          id: 'tuplesProcessedPSMA',
          key: 'tuplesProcessedPSMA',
          label: dtText.get('processed_per_sec'),
          sort: 'number',
          filter: 'number',
          ngFilter: 'commaGroups',
          title: dtText.get('Moving average number of tuples ingested/processed per second.')
        },
        {
          id: 'tuplesEmittedPSMA',
          key: 'tuplesEmittedPSMA',
          label: dtText.get('emitted_per_sec'),
          sort: 'number',
          filter: 'number',
          ngFilter: 'commaGroups',
          title: dtText.get('Moving average number of tuples emitted per second.')
        },
        {
          id: 'totalTuplesProcessed',
          key: 'totalTuplesProcessed',
          label: dtText.get('processed_total'),
          sort: 'number',
          filter: 'number',
          ngFilter: 'commaGroups',
          title: dtText.get('Total number of tuples ingested/processed by this logical operator.')
        },
        {
          id: 'totalTuplesEmitted',
          key: 'totalTuplesEmitted',
          label: dtText.get('emitted_total'),
          sort: 'number',
          filter: 'number',
          ngFilter: 'commaGroups',
          title: dtText.get('Total number of tuples emitted by this logical operator.')
        }
      ];

      // Set the selected array
      scope.selected = [];

    }

  });
  return LogicalOperatorsListWidgetDataModel;
})

// Widget Definition
.factory('LogicalOperatorsListWidgetDef', function(BaseWidget, LogicalOperatorsListWidgetDataModel) {
  var LogicalOperatorsListWidgetDef = BaseWidget.extend({
    defaults: {
      dataModelType: LogicalOperatorsListWidgetDataModel,
      title: 'Logical Operators', // default display name (editable by user)
      templateUrl: 'pages/ops/appInstance/widgets/LogicalOperatorsList/LogicalOperatorsList.html',
    }
  });

  return LogicalOperatorsListWidgetDef;
});