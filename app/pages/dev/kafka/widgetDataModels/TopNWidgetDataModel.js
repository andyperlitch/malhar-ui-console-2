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

angular.module('app.pages.dev.kafka.widgetDataModels.TopNWidgetDataModel', [
  'ui.models',
  'app.pages.dev.kafka.KafkaRestService',
  'app.pages.dev.kafka.KafkaSocketService'
])
  .factory('TopNWidgetDataModel', function (WidgetDataModel, WebSocketDataModel) {
    function TopNWidgetDataModel() {
    }

    TopNWidgetDataModel.prototype = Object.create(WebSocketDataModel.prototype);
    TopNWidgetDataModel.prototype.constructor = WebSocketDataModel;

    angular.extend(TopNWidgetDataModel.prototype, {
      init: function () {
        WebSocketDataModel.prototype.init.call(this);

        this.widgetScope.gridOptions = {
          enableColumnResizing: true,
          columnDefs: [
            {
              name: 'key',
              width: '70%'
            },
            {
              name: 'value',
              width: '30%'
            }
          ]
        };
      },

      updateScope: function (value) {
        if (!value) {
          return;
        }

        if (!_.isArray(value)) {
          value = _.map(value, function (value, key) {
            return {
              key: key,
              value: value
            };
          });
        }

        this.widgetScope.gridOptions.data = value;
      }
    });

    return TopNWidgetDataModel;
  });