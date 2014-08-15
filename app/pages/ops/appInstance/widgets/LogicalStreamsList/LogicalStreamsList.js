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
  'app.settings'
])

// Widget Data Model
.factory('LogicalStreamsListWidgetDataModel', function(BaseDataModel, LogicalStreamCollection) {
  var LogicalStreamsListWidgetDataModel = BaseDataModel.extend({
    init: function() {
      var scope = this.widgetScope;
      scope.resource = new LogicalStreamCollection({
        appId: scope.appId
      });
      scope.resource.fetch();
      scope.resource.subscribe(scope);
      scope.selected = [];
      scope.columns = [
        
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