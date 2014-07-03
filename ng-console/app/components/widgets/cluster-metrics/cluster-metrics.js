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

angular.module('dtConsole.widgets.ClusterMetrics', [
  'dtConsole.widgets.Base',
  'underscore',
  'ui.dashboard',
  'dtConsole.resources.ClusterMetrics'
])
.factory('ClusterMetricsDataModel', function(WidgetDataModel, ClusterMetrics) {
  function DataModel() {

  }
  DataModel.prototype = Object.create( WidgetDataModel.prototype );
  DataModel.prototype.init = function() {

    this.resource = new ClusterMetrics();
    this.resource.fetch();
    this.resource.subscribe();

    this.widgetScope.data = this.resource.data;

  };
  DataModel.prototype.destroy = function() {

    this.resource.unsubscribe();

  };
  return DataModel;
})
.factory('ClusterMetricsWidget', ['BaseWidget', '_', 'ClusterMetricsDataModel', function(Base, _, DataModel) {

  function ClusterMetricsWidget() {
    Base.apply(this, arguments);
  }

  ClusterMetricsWidget.prototype = Object.create( Base.prototype );
  
  ClusterMetricsWidget.prototype.defaults = _.defaults({

    dataModelType: DataModel

  }, Base.prototype);

  return ClusterMetricsWidget;

}]);