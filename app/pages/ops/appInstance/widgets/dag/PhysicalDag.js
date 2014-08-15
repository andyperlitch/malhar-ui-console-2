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

angular.module('app.pages.ops.appInstance.widgets.dag.PhysicalDag', [
  'app.components.widgets.Base',
  'app.components.directives.dtSelect',
  'app.components.resources.PhysicalPlanResource',
  'app.components.widgets.dag.physical.physicalDag'
])
  .factory('PhysicalDagWidgetDataModel', function(WidgetDataModel, PhysicalPlanResource, $q) {
    function PhysicalDagWidgetDataModel(options) {
      this.appId = options.appId;
      this.ctrl = null; // directive controller
      this.physicalPlan = null;
    }

    PhysicalDagWidgetDataModel.prototype = Object.create(WidgetDataModel.prototype);
    PhysicalDagWidgetDataModel.prototype.constructor = WidgetDataModel;

    angular.extend(PhysicalDagWidgetDataModel.prototype, {
      init: function() {
        this.physicalPlan = new PhysicalPlanResource({
          appId: this.appId
        });

        var deferred = $q.defer();

        this.widgetScope.$on('registerController', function (event, ctrl) {
          event.stopPropagation();
          this.ctrl = ctrl;
          deferred.resolve();
        }.bind(this));

        this.physicalPlan.fetch().then(function (data) {
          deferred.promise.then(function () {
            this.ctrl.renderDag(data);
          }.bind(this));
        }.bind(this));
      },

      destroy: function() {
        if (this.physicalPlan) {
          this.physicalPlan.unsubscribe();
        }
      }

    });

    return PhysicalDagWidgetDataModel;
  })
  .factory('PhysicalDagWidgetDefinition', function(BaseWidget, PhysicalDagWidgetDataModel) {
    var PhysicalDagWidgetDefinition = BaseWidget.extend({
      defaults: {
        title: 'Physical DAG',
        directive: 'dt-physical-dag',
        dataModelType: PhysicalDagWidgetDataModel
      }
    });

    return PhysicalDagWidgetDefinition;
  });