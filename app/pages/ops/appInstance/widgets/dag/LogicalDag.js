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

angular.module('app.pages.ops.appinstance.widgets.dag.LogicalDag', [
  'app.components.widgets.Base',
  'app.settings',
  'app.components.widgets.dag.physical.logicalDag',
  'app.components.directives.dtSelect',
  'app.components.resources.LogicalDag'
])
  .factory('LogicalDagDataModel', function(BaseDataModel, LogicalDag, LogicalOperatorCollection) {

    var LogicalDagDataModel = BaseDataModel.extend({

      init: function() {
        this.resource = new LogicalDag({
          //appId: this.dataModelOptions.appId
          appId: this.widgetScope.appId //TODO
        });

        this.resource.fetch().then(function (data) {
          //this.widgetScope.logicalPlan = data; //TODO

          this.widgetScope.$broadcast('logicalPlan', data); //TODO

          var ops = new LogicalOperatorCollection({ appId: this.widgetScope.appId });
          ops.fetch().then(function (data) {
            this.widgetScope.$broadcast('updateMetrics', data); //TODO
          }.bind(this));
          ops.subscribe(this.widgetScope, function (data) {
            this.widgetScope.$broadcast('updateMetrics', data); //TODO
          }.bind(this));

        }.bind(this));
      },

      destroy: function() {
        this.resource.unsubscribe();
      }

    });

    return LogicalDagDataModel;
  })
  .factory('LogicalDagWidgetDefinition', function(BaseWidget, LogicalDagDataModel) {
    var LogicalDagWidgetDefinition = BaseWidget.extend({
      defaults: {
        title: 'Logical DAG',
        directive: 'dt-logical-dag',
        dataModelType: LogicalDagDataModel,
        attrs: {
          'app-id': 'appId',
          'logical-plan': 'logicalPlan'
        }
      }
    });

    return LogicalDagWidgetDefinition;
  });