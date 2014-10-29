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

'use strict';

angular.module('app.pages.ops.components.appList', [
  'app.settings',
  'app.components.filters.byte',
  'app.components.filters.timeSince',
  'app.components.services.dtText',
  'app.components.services.tableOptionsFactory',
  'app.components.services.appManager',
  'app.components.directives.appIdLink',
  'app.components.directives.dtStatus',
  'app.components.directives.dtPageHref',
  'datatorrent.mlhrTable'
])

.factory('appListColumns', function(settings, dtText, $filter) {

  function idSorter(row1, row2) {
    var id1 = row1.id.split('_').pop() * 1;
    var id2 = row2.id.split('_').pop() * 1;
    return id1 - id2;
  }

  function stateSorter(row1,row2) {
    var state1 = settings.statusOrder.indexOf(row1.state);
    var state2 = settings.statusOrder.indexOf(row2.state);
    return state1 - state2;
  }

  function startedTimeFormatter(value) {
    return $filter('timeSince')(value) + ' ago';
  }

  function lifetimeFormatter(value, row) {
    var finishedTime = row.finishedTime * 1 || +new Date() ;
    var startedTime = row.startedTime * 1 ;
    return $filter('timeSince')({
      timeChunk: finishedTime - startedTime,
      unixUptime: true,
      max_levels: 3
    });
  }

  function memorySorter(row1, row2) {
    var v1 = row1.allocatedMB;
    var v2 = row2.allocatedMB;
    if (!v1 && !v2) {
      return 0;
    }
    if (!v1) {
      return -1;
    }
    if (!v2) {
      return 1;
    }
    return v1 - v2;
  }

  var columns = [
    {
      id: 'selector',
      key: 'id',
      label: '',
      selector: true,
      width: '40px',
      lock_width: true
    },
    {
      id: 'id',
      label: dtText.get('id_label'),
      key: 'id',
      sort: idSorter,
      filter: 'like',
      template: '<a href="#" app-id-link="row.id" short="true"></a>',
      trustFormat: true,
      title: dtText.get('Shortened YARN application id. Click a link to view an instance.')
    },
    {
      id: 'name',
      key: 'name',
      label: dtText.get('name_label'),
      sort: 'string',
      filter: 'like',
      template: '<a href="#" dt-page-href="AppInstance" params="{ appId: row.id }">{{row.name}}</a>',
      title: dtText.get('Name of application. Click a link to view an instance.')
    },
    {
      id: 'state',
      label: dtText.get('state_label'),
      key: 'state',
      template: '<span dt-status="row.state" final-status="row.finalStatus"></span>',
      sort: stateSorter,
      filter:'like',
      title: dtText.get('State of an application, e.g. ACCEPTED, RUNNING, KILLED.')
    },
    {
      id: 'user',
      key: 'user',
      label: dtText.get('user_label'),
      sort: 'string',
      filter:'like',
      title: dtText.get('The user who started the application.')
    },
    {
      id: 'startedTime',
      label: dtText.get('started_label'),
      key: 'startedTime',
      sort: 'number',
      filter: 'date',
      format: startedTimeFormatter,
      title: dtText.get('The time the application was started.')
    },
    {
      id: 'lifetime',
      label: dtText.get('lifetime_label'),
      key: 'startedTime',
      filter: 'date',
      format: lifetimeFormatter,
      title: dtText.get('The lifetime of the application.')
    },
    {
      id: 'allocatedMB',
      label: dtText.get('memory_label'),
      key: 'allocatedMB',
      sort: memorySorter,
      filter: 'number',
      template: '{{ row[column.key] | byte:"mb"}}',
      title: dtText.get('Amount of allocated memory that this application is consuming.')
    }
  ];

  return columns;

});