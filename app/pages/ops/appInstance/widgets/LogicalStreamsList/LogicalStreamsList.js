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
 * LogicalStreamsListWidget
 *
 * Displays a list of streams for a given application.
 */

// Module Definition
angular.module('app.pages.ops.appInstance.widgets.LogicalStreamsList', [
  'app.components.widgets.Base',
  'app.components.resources.LogicalStreamCollection',
  'app.settings',
  'app.components.services.tableOptionsFactory',
  'app.components.services.dtText',
  'app.components.directives.dtTableResize'
])

// Widget Data Model
.factory('LogicalStreamsListWidgetDataModel', function(BaseDataModel, LogicalStreamCollection, dtText, tableOptionsFactory) {

  function sourceFilter(search, source) {
    var op = ( source.operatorName + '').toLowerCase();
    var port = ( source.portName + '').toLowerCase();
    var term = ( search + '').toLowerCase();
    return op.indexOf(term) > -1 || port.indexOf(term) > -1;
  }
  sourceFilter.placeholder = dtText.get('string search');

  var LogicalStreamsListWidgetDataModel = BaseDataModel.extend({
    init: function() {
      var scope = this.widgetScope;
      scope.resource = new LogicalStreamCollection({
        appId: scope.appId
      });
      scope.resource.fetch();
      scope.resource.subscribe(scope);
      scope.selected = [];
      scope.deselectAll = function() {
        while(scope.selected.length) {
          scope.selected.pop();
        }
      };
      scope.table_options = tableOptionsFactory({
        row_limit: 10
      }, scope.widget, scope);
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
          label: dtText.get('name_label'), 
          key: 'name', 
          filter: 'like', 
          sort: 'string'
        },
        {
          id: 'locality', 
          label: dtText.get('locality_label'), 
          key: 'locality', 
          filter: 'like', 
          sort: 'string', 
          template: '<span ng-if="row.locality">{{ row.locality }}</span><span ng-if="!row.locality" dt-text>locality_not_assigned</span>'
        },
        {
          id: 'source', 
          label: dtText.get('source_label'), 
          key: 'source', 
          filter: sourceFilter,
          template: '<a dt-page-href="LogicalOperator" params="{ appId: \'' + scope.appId + '\', operatorName: row.source.operatorName }">{{row.source.operatorName}}</a>: {{ row.source.portName }}'
        },
        {
          id: 'sinks', 
          label: dtText.get('sinks_label'), 
          key: 'sinks', 
          filter: 'likeFormatted', 
          template: '<span ng-repeat="sink in row.sinks"><a dt-page-href="LogicalOperator" params="{ appId: \'' + scope.appId + '\', operatorName: sink.operatorName }">{{sink.operatorName}}</a>: {{ sink.portName }}</span>'
        }
      ];
    }
  });
  return LogicalStreamsListWidgetDataModel;
})

// Widget Definition
.factory('LogicalStreamsListWidgetDef', function(BaseWidget, LogicalStreamsListWidgetDataModel) {
  var LogicalStreamsListWidgetDef = BaseWidget.extend({
    defaults: {
      dataModelType: LogicalStreamsListWidgetDataModel,
      title: 'Streams', // default display name (editable by user)
      templateUrl: 'pages/ops/appInstance/widgets/LogicalStreamsList/LogicalStreamsList.html'
    }
  });

  return LogicalStreamsListWidgetDef;
});