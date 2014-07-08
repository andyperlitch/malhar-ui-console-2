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

angular.module('dtConsole.widgets.AppsList', [
  'dtConsole.widgets.Base',
  // 'datatorrent.mlhrTable',
  'dtConsole.resources.ApplicationCollection'
])

.factory('AppsListWidget', function(BaseWidget, AppsListDataModel) {
  var AppsListWidget = BaseWidget.extend({
    defaults: {
      dataModelType: AppsListDataModel,
      templateUrl: 'components/widgets/apps-list/apps-list.html'
    }
  });

  return AppsListWidget;
})

.factory('AppsListDataModel', function(BaseDataModel, ApplicationCollection) {

  var AppsListDataModel = BaseDataModel.extend({

    init: function() {
      this.resource = new ApplicationCollection();
      this.resource.fetch();
      this.resource.subscribe(this.widgetScope);
      this.widgetScope.data = this.resource.data;
    },

    destroy: function() {
      this.resource.unsubscribe();
    }

  });

  return AppsListDataModel;

});