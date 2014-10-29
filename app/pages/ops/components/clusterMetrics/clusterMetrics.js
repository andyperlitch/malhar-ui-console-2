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

angular.module('app.pages.ops.widgets.ClusterMetrics', [
  'app.components.widgets.Base',
  'app.components.resources.ClusterMetrics'
])
.factory('ClusterMetricsDataModel', function(BaseDataModel, ClusterMetrics) {

  var DataModel = BaseDataModel.extend({
    
    init: function() {
      this.resource = new ClusterMetrics();
      this.resource.fetch();
      this.resource.subscribe(this.widgetScope);
      this.widgetScope.data = this.resource.data;
    },

    destroy: function() {
      this.resource.unsubscribe();
    }

  });

  return DataModel;
})
.factory('ClusterMetricsWidget', ['BaseWidget', 'ClusterMetricsDataModel', function(Base, DataModel) {

  var ClusterMetricsWidget = Base.extend({

    defaults: {
      title: 'Cluster Metrics',
      dataModelType: DataModel,
      templateUrl: 'pages/ops/widgets/ClusterMetrics/ClusterMetrics.html'
    }
    
  });

  return ClusterMetricsWidget;

}]);