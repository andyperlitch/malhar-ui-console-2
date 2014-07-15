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
angular.module('app.pages.ops.app-instance.widgets.app-instance-overview', [
  'app.widgets.Base',
  'app.settings'
])

// Widget Data Model
.factory('AppInstanceOverviewWidgetDataModel', function(BaseDataModel) {
  var AppInstanceOverviewWidgetDataModel = BaseDataModel.extend({

  });
  return AppInstanceOverviewWidgetDataModel;
})

// Widget Definition
.factory('AppInstanceOverviewWidget', function(BaseWidget, AppInstanceOverviewWidgetDataModel) {
  var AppInstanceOverviewWidget = BaseWidget.extend({
    defaults: {
      dataModelType: AppInstanceOverviewDataModel,
      title: 'Application Overview' // default display name (editable by user)

      // templateUrl: 'path/to/template',
      // directive: 'name-of-directive'
    }
  });

  return AppInstanceOverviewWidget;
});