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

angular.module('dtConsoleApp')
  .factory('TableDataModel', ['WidgetDataModel', 'webSocket', 'getUri', function (WidgetDataModel, ws, getUri) {
  
      function TableDataModel() {}

      TableDataModel.prototype = Object.create(WidgetDataModel.prototype);

      TableDataModel.prototype.init = function() {
        // Set columns from dataModelOptions
        this.widgetScope.columns = this.dataModelOptions.columns;
        this.resource = this.dataModelOptions.resource;
        this.resourceAction = this.dataModelOptions.resourceAction;
        this.topic = this.dataModelOptions.topic;

        // Subscribe to websocket topic
        var that = this;
        ws.subscribe(getUri.topic(this.topic), function(data) {

          that.updateScope(data);
          that.widgetScope.$apply();

        }, this.widgetScope);

        // Make initial call to resource
        var response = this.resource[this.resourceAction]();
        response.$promise.then(function() {
          that.updateScope(response);
        });

      };

      return TableDataModel;
        
    }]);
