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
 * ContainersListWidget
 *
 * Displays list of containers for an application
 */

// Module Definition
angular.module('app.pages.ops.appInstance.widgets.ContainersList', [
  'app.components.directives.containerLogsDropdown',
  'app.components.directives.dtTableResize',
  'app.components.services.dtText',
  'app.components.resources.ContainerCollection',
  'app.components.widgets.Base',
  'app.settings',
  'app.components.services.containerManager',
  'app.components.services.tableOptionsFactory',
  'app.components.filters.relativeTimestamp',
  'app.pages.ops.appInstance.widgets.ContainersList.ContainersListPaletteCtrl'
])

// Widget Data Model
.factory('ContainersListWidgetDataModel', function(BaseDataModel, ContainerCollection, dtText, containerManager, $filter, settings, tableOptionsFactory) {

  var jvmName_rgx = /^(\d+)@(.*)/;
  function processFormatter(value) {
    value = value || '';
    return value.replace(jvmName_rgx,'$1');
  }
  function nodeSorter(row1, row2) {
    var node1 = row1.get('jvmName').replace(jvmName_rgx, '$2');
    var node2 = row2.get('jvmName').replace(jvmName_rgx, '$2');
    if (node1 === node2) {
      return 0;
    }
    else if (node1 < node2) {
      return -1;
    }
    else {
      return 1;
    }
  }
  // Remove the pid from jvmName
  function nodeFormatter(value) {
    value = value || '';
    return value.replace(jvmName_rgx, '$2');
  }

  function heartbeatFormatter(value, row) {
    if (containerManager.isAppMaster(row.id) || value + '' === '-1') {
      return '-';
    }
    return $filter('relativeTimestamp')(new Date(value*1));
  }

  var ContainersListWidgetDataModel = BaseDataModel.extend({

    init: function() {

      var scope = this.widgetScope;

      this.resource = new ContainerCollection({
        appId: scope.appId
      });

      var fetchParams = this.dataModelOptions && this.dataModelOptions.loadKilled ? {} : { states: settings.NONENDED_CONTAINER_STATES.join(',') };


      this.resource.subscribe(scope, undefined, { remove: false });
      scope.resource = this.resource;
      scope.selected = [];
      scope.table_options = tableOptionsFactory({
        row_limit: 10,
        initial_sorts: [
          { id: 'state', dir: '+' },
          { id: 'id', dir: '+' }
        ]
      }, scope.widget, scope);

      this.resource.fetch({
        params: fetchParams
      }, { remove: false }).finally(function() {
        scope.table_options.setLoading(false);
      });

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
          label: dtText.get('id_label'),
          key: 'id',
          sort: 'string',
          filter: 'like',
          template: '<a dt-page-href="Container" params="{ appId: \'' + scope.appId + '\', containerId: row.id }" dt-container-shorthand="row.id"></a>',
          title: dtText.get('Container ID. Click to view the container.')
        },
        {
          id: 'process_id',
          label: dtText.get('process_id_label'),
          key: 'jvmName',
          sort: 'string',
          filter: 'like',
          format: processFormatter,
          title: dtText.get('The process ID of the container.')
        },
        {
          id: 'node',
          label: dtText.get('host_label'),
          key: 'jvmName',
          sort: nodeSorter,
          filter: 'like',
          format: nodeFormatter,
          title: dtText.get('The node where the container is running.')
        },
        {
          id: 'lastHeartbeat',
          label: dtText.get('last_heartbeat_label'),
          key: 'lastHeartbeat',
          sort: 'number',
          filter: 'date',
          format: heartbeatFormatter,
          title: dtText.get('Time when the container last sent information to the application master.')
        },
        {
          id: 'memoryMBAllocated',
          label: dtText.get('alloc_mem_label'),
          key: 'memoryMBAllocated',
          template: '{{ row.memoryMBAllocated | byte:\'mb\' }}',
          filter: 'number',
          sort: 'number',
          title: dtText.get('Amount of memory allocated to the container.')
        },
        {
          id: 'numOperators',
          label: dtText.get('num_operators_label'),
          key: 'numOperators',
          ngFilter: 'commaGroups',
          filter: 'number',
          sort: 'number',
          title: dtText.get('Number of operators running in the container.')
        },
        {
          id: 'state',
          label: dtText.get('state_label'),
          key: 'state',
          sort: 'string',
          filter:'like',
          template: '<div dt-status="row.state"></div>',
          title: dtText.get('State of the container.')
        }
      ];
    
    },

    destroy: function() {
      this.resource.unsubscribe();
    }

  });
  return ContainersListWidgetDataModel;
})

// Widget Definition
.factory('ContainersListWidgetDef', function(BaseWidget, ContainersListWidgetDataModel) {
  var ContainersListWidgetDef = BaseWidget.extend({
    defaults: {
      dataModelType: ContainersListWidgetDataModel,
      title: 'Containers', // default display name (editable by user)
      templateUrl: 'pages/ops/appInstance/widgets/ContainersList/ContainersList.html'
    }
  });

  return ContainersListWidgetDef;
});