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
 * LogicalOperatorOverviewWidget
 *
 * Displays overview for a logical operator
 */

// Module Definition
angular.module('app.pages.ops.appInstance.logicalOperator.widgets.LogicalOperatorOverview', [
  'app.components.widgets.Base',
  'app.components.resources.LogicalOperatorModel',
  'app.components.directives.logicalOperatorStatus',
  'app.settings'
])

// Widget Data Model
.factory('LogicalOperatorOverviewWidgetDataModel', function(BaseDataModel, LogicalOperatorModel) {
  var LogicalOperatorOverviewWidgetDataModel = BaseDataModel.extend({
    init: function() {

      var resource;

      // logicalOperator resource
      if (this.widgetScope.logicalOperator && this.widgetScope.logicalOperator instanceof LogicalOperatorModel) {
        resource = this.resource = this.widgetScope.logicalOperator;
      }
      else {
        this.unsubscribeOnDestroy = true;
        resource = this.resource = new LogicalOperatorModel({
          id: this.widgetScope.appId,
          name: this.widgetScope.operatorName
        });
        resource.fetch();
        resource.subscribe(this.widgetScope);
      }

      this.widgetScope.data = resource.data;
    },

    destroy: function() {
      if (this.unsubscribeOnDestroy) {
        this.resource.unsubscribe();
      }
    }
  });
  return LogicalOperatorOverviewWidgetDataModel;
})

// Widget Definition
.factory('LogicalOperatorOverviewWidgetDef', function(BaseWidget, LogicalOperatorOverviewWidgetDataModel) {
  var LogicalOperatorOverviewWidgetDef = BaseWidget.extend({
    defaults: {
      dataModelType: LogicalOperatorOverviewWidgetDataModel,
      title: 'Logical Operator',
      templateUrl: 'pages/ops/appInstance/logicalOperator/widgets/LogicalOperatorOverview/LogicalOperatorOverview.html'
    }
  });

  return LogicalOperatorOverviewWidgetDef;
});