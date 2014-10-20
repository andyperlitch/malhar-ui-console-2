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
  'app.components.services.tableOptionsFactory',
  'app.components.filters.percent2cpu',
  'app.components.directives.dtTableResize'
])

// Widget Data Model
.factory('PhysicalOperatorsListWidgetDataModel', function(BaseDataModel, PhysicalOperatorCollection, dtText, tableOptionsFactory) {
  var PhysicalOperatorsListWidgetDataModel = BaseDataModel.extend({

    init: function() {
      
      var scope = this.widgetScope;

      // Set the table options
      scope.table_options = tableOptionsFactory({
        initial_sorts: [
          { id: 'id', dir: '+' }
        ],
        appInstance: scope.appInstance
      }, scope.widget, scope);

      // Set up resource
      var resource = this.resource = scope.resource = new PhysicalOperatorCollection({
        // Will always be available
        appId: scope.appId,
        // May be defined if on container page
        containerId: scope.containerId,
        // May be defined if on logical operator page
        operatorName: scope.operatorName
      });

      var latest;
      resource.set = function(updates) {
        if (scope.table_options.scrollingPromise) {
          var self = this;
          latest = updates;
          scope.table_options.scrollingPromise.then(function() {
            if (latest === updates) {
              self.data = updates;
            }
          });
        }
        else {
          this.data = updates;
        }
      };

      resource.fetch();
      resource.subscribe(scope);

      // Set the table columns
      scope.columns = [
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
          template: '<a dt-page-href="PhysicalOperator" params="{ appId: \'' + scope.appId + '\', operatorId: row.id }">{{ row.id }}</a>',
          width: '4em'
        },
        {
          id: 'name',
          key: 'name',
          filter: 'like',
          sort: 'string',
          template: '<a dt-page-href="LogicalOperator" params="{ appId: \'' + scope.appId + '\', operatorName: row.name }">{{ row.name }}</a>'
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
          template: '<span window-id="row.currentWindowId" title-only window-size="options.appInstance.data.attributes.STREAMING_WINDOW_SIZE_MILLIS"></span>'
        },
        {
          id: 'recoveryWindowId',
          key: 'recoveryWindowId',
          label: dtText.get('recovery_wid_label'),
          sort: 'string',
          filter: 'like',
          template: '<span window-id="row.recoveryWindowId" title-only window-size="options.appInstance.data.attributes.STREAMING_WINDOW_SIZE_MILLIS"></span>'
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
          template: '<a dt-page-href="Container" params="{ appId: \'' + scope.appId + '\', containerId: row.container }" dt-container-shorthand="row.container"></a>'
        },
        {
          id: 'latencyMA',
          key: 'latencyMA',
          label: dtText.get('latency_ms_label'),
          sort: 'number',
          filter: 'number'
        }
        // {
        //   id: 'totalTuplesProcessed',
        //   key: 'totalTuplesProcessed',
        //   label: dtText.get('processed_total'),
        //   sort: 'number',
        //   filter: 'number',
        //   ngFilter: 'commaGroups'
        // },
        // {
        //   id: 'totalTuplesEmitted',
        //   key: 'totalTuplesEmitted',
        //   label: dtText.get('emitted_total'),
        //   sort: 'number',
        //   filter: 'number',
        //   ngFilter: 'commaGroups'
        // }
      ];

      // Splice out name column if this is a partitions table
      if (resource.operatorName) {
        scope.columns.splice(2, 1);
      }

      // Set the selected array
      scope.selected = [];

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