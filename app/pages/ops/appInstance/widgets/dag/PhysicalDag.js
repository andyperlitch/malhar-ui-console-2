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

angular.module('app.pages.ops.appinstance.widgets.dag.PhysicalDag', [
  'app.components.widgets.Base',
  'app.components.directives.dtSelect',
  'app.components.resources.PhysicalPlanResource',
  'app.components.widgets.dag.physical.physicalDag'
])
  .factory('PhysicalDagWidgetModel', function(BaseDataModel, PhysicalPlanResource) {
    var PhysicalDagWidgetModel = BaseDataModel.extend({

      init: function() {
        this.physicalPlan = new PhysicalPlanResource({
          appId: this.widgetScope.appId //TODO
        });

        this.physicalPlan.fetch().then(function (data) {
          this.widgetScope.$broadcast('physicalPlan', data); //TODO
        }.bind(this));
      },

      destroy: function() {
        this.physicalPlan.unsubscribe();
      }

    });

    return PhysicalDagWidgetModel;
  })
  .factory('PhysicalDagWidgetDefinition', function(BaseWidget, PhysicalDagWidgetModel) {
    var PhysicalDagWidgetDefinition = BaseWidget.extend({
      defaults: {
        title: 'Physical DAG',
        directive: 'dt-physical-dag',
        dataModelType: PhysicalDagWidgetModel
      }
    });

    return PhysicalDagWidgetDefinition;
  });