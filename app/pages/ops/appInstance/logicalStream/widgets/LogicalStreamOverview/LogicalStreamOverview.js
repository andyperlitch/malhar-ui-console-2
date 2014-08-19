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
 * LogicalStreamOverviewWidget
 *
 * Displays general information about a stream.
 */

// Module Definition
angular.module('app.pages.ops.appInstance.logicalStream.widgets.LogicalStreamOverview', [
  'app.components.widgets.Base',
  'app.components.services.dtText',
  'app.settings'
])

// Widget Data Model
.factory('LogicalStreamOverviewWidgetDataModel', function(BaseDataModel, dtText) {
  var LogicalStreamOverviewWidgetDataModel = BaseDataModel.extend({
    init: function() {
      var scope = this.widgetScope;
      scope.dtText = dtText;
    }
  });
  return LogicalStreamOverviewWidgetDataModel;
})

// Widget Definition
.factory('LogicalStreamOverviewWidgetDef', function(BaseWidget, LogicalStreamOverviewWidgetDataModel) {
  var LogicalStreamOverviewWidgetDef = BaseWidget.extend({
    defaults: {
      dataModelType: LogicalStreamOverviewWidgetDataModel,
      title: 'Stream', // default display name (editable by user)
      templateUrl: 'pages/ops/appInstance/logicalStream/widgets/LogicalStreamOverview/LogicalStreamOverview.html'
    }
  });

  return LogicalStreamOverviewWidgetDef;
});