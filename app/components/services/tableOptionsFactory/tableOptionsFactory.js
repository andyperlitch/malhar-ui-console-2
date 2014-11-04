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

angular.module('app.components.services.tableOptionsFactory', [
  'app.components.services.userStorage'
])
.factory('tableStorageFactory', function() {
  function WidgetStorage(widget, scope) {
    widget.dataModelOptions = widget.dataModelOptions || {};
    this.storage = widget.dataModelOptions;
    this.scope = scope;
  }
  WidgetStorage.prototype = {
    getItem: function(key) {
      return this.storage[key];
    },
    setItem: function(key, value) {
      this.storage[key] = value;
      this.scope.$emit('widgetChanged', this.widget);
    },
    removeItem: function(key) {
      delete this.storage[key];
    }
  };
  return function(widget, scope) {
    return new WidgetStorage(widget, scope);
  };
})
.factory('tableOptionsFactory', function(tableStorageFactory, userStorage) {

  var tableOptionsFactory;

  tableOptionsFactory = function(o, widget, scope) {
    var defaults;
      if (!o) {
        o = {};
      }
      if (!scope) {
        scope = widget;
        widget = null;
      }
      defaults = {
        storage: widget ? tableStorageFactory(widget, scope) : userStorage,
        storage_key: 'table',
        loading: true,
        loadingTemplateUrl: 'components/services/tableOptionsFactory/tableLoadingTemplate.html',
        bgSizeMultiplier: 2,
        defaultRowHeight: 29
      };
      return angular.extend({}, defaults, o);
  };

  return tableOptionsFactory;

});