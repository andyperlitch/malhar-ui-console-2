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

angular.module('app.pages.ops.appInstance.operators.widgets.OpProperties', [
  'app.components.resources.OpPropertiesModel',
  'app.components.directives.dtTableResize'
])
  .factory('OpPropertiesWidgetDataModel', function (WidgetDataModel, OpPropertiesModel, tableOptionsFactory, dtText) {
    function OpPropertiesWidgetDataModel(options) {
      this.appId = options.appId;
      this.operatorName = options.operatorName;
      this.operatorFetchPromise = options.operatorFetchPromise;
    }

    OpPropertiesWidgetDataModel.prototype = Object.create(WidgetDataModel.prototype);
    OpPropertiesWidgetDataModel.prototype.constructor = OpPropertiesWidgetDataModel;

    angular.extend(OpPropertiesWidgetDataModel.prototype, {
      init: function () {
        this.widgetScope.data = [];

        this.widgetScope.columns = [
          {
            id: 'name',
            key: 'name',
            label: dtText.get('property_name_label'),
            width: '50%'
          },
          {
            id: 'value',
            key: 'value',
            label: dtText.get('property_value_label'),
            width: '50%'
          }
        ];

        this.widgetScope.options = tableOptionsFactory({
          row_limit: 10,
          initial_sorts: [
            { id: 'name', dir: '+' }
          ]
        }, this.widgetScope.widget, this.widgetScope);

        if (!this.operatorFetchPromise) {
          this.load();
        } else {
          this.operatorFetchPromise.then(function (operator) {
            this.operatorName = operator.name;
            this.load();
          }.bind(this));
        }
      },

      load: function () {
        var propertiesResource = new OpPropertiesModel({
          appId: this.appId,
          operatorName: this.operatorName
        });

        propertiesResource.fetch().then(function (properties) {
          this.widgetScope.data = _.map(_.pairs(properties), function (pair) {
            return {
              name: pair[0],
              value: pair[1]
            };
          });
        }.bind(this));
      }
    });

    return OpPropertiesWidgetDataModel;
  })
  .factory('OpPropertiesWidgetDef', function (BaseWidget, OpPropertiesWidgetDataModel) {
    var OpPropertiesWidgetDef = BaseWidget.extend({
      defaults: {
        title: 'Operator Properties',
        templateUrl: 'pages/ops/appInstance/operators/widgets/OpProperties/OpProperties.html',
        dataModelType: OpPropertiesWidgetDataModel
      }
    });

    return OpPropertiesWidgetDef;
  });