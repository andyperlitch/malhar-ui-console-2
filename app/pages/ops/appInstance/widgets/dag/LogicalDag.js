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
  'app.settings',
  'app.components.widgets.dag.physical.logicalDag',
  'app.components.directives.dtSelect',
  'app.components.resources.LogicalPlanResource'
])
  .factory('LogicalDagWidgetDataModel', function(WidgetDataModel, LogicalPlanResource, LogicalOperatorCollection, $q) {
    function LogicalDagWidgetDataModel(options) {
      this.appId = options.appId;
    }

    LogicalDagWidgetDataModel.prototype = Object.create(WidgetDataModel.prototype);
    LogicalDagWidgetDataModel.prototype.constructor = WidgetDataModel;

    angular.extend(LogicalDagWidgetDataModel.prototype, {
      ctrl: null, // directive controller
      logicalPlan: null,
      operators: null,

      init: function() {
        this.logicalPlan = new LogicalPlanResource({
          appId: this.appId
        });

        var deferred = $q.defer();

        this.widgetScope.$on('registerController', function (event, ctrl) {
          event.stopPropagation();
          this.ctrl = ctrl;
          deferred.resolve();
        }.bind(this));

        this.logicalPlan.fetch().then(function (data) {
          deferred.promise.then(function () {
            this.ctrl.renderDag(data);

            this.operators = new LogicalOperatorCollection({ appId: this.appId });

            this.operators.fetchAndSubscribe(this.widgetScope, function (data) {
              this.ctrl.updateMetrics(data);
            }.bind(this));
          }.bind(this));
        }.bind(this));
      },

      destroy: function() {
        if (this.logicalPlan) {
          this.logicalPlan.unsubscribe();
        }
        if (this.operators) {
          this.operators.unsubscribe();
        }
      }
    });

    return LogicalDagWidgetDataModel;
  })
  .factory('LogicalDagWidgetDefinition', function(BaseWidget, LogicalDagWidgetDataModel) {
    var LogicalDagWidgetDefinition = BaseWidget.extend({
      defaults: {
        title: 'Logical DAG',
        directive: 'dt-logical-dag',
        dataModelType: LogicalDagWidgetDataModel
      }
    });

    return LogicalDagWidgetDefinition;
  });