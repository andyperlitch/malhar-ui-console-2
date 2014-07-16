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
 * AppInstanceOverviewWidget
 *
 * Displays high-level information about an app instance.
 */

// Module Definition
angular.module('app.pages.ops.appInstance.widgets.AppInstanceOverview', [
  'app.components.widgets.Base',
  'app.components.resources.ApplicationModel',
  'app.components.directives.appState',
  'app.settings'
])

// Widget Data Model
.factory('AppInstanceOverviewDataModel', function(BaseDataModel, ApplicationModel) {
  var AppInstanceOverviewDataModel = BaseDataModel.extend({

    init: function() {
      this.resource = new ApplicationModel({
        id: this.widgetScope.appId
      });
      this.resource.fetch();
      this.resource.subscribe(this.widgetScope);
      this.widgetScope.data = this.resource.data;
    },

    destroy: function() {
      this.resource.unsubscribe();
    }

  });
  return AppInstanceOverviewDataModel;
})

// Widget Definition
.factory('AppInstanceOverviewWidgetDef', function(BaseWidget, AppInstanceOverviewDataModel) {
  var AppInstanceOverviewWidgetDef = BaseWidget.extend({
    defaults: {
      dataModelType: AppInstanceOverviewDataModel,
      title: 'Application Overview',
      templateUrl: 'pages/ops/appInstance/widgets/AppInstanceOverview/AppInstanceOverview.html'
    }
  });

  return AppInstanceOverviewWidgetDef;
});