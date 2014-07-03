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

angular.module('dtConsole.widgets.Base', [
  'dtConsole.extendService',
  'ui.dashboard'
])
.factory('BaseDataModel', function(_, WidgetDataModel, extend) {
  var BaseDataModel = extend.call(WidgetDataModel, {}, { extend: extend });
  return BaseDataModel;
})
.factory('BaseWidget', function(_, extend) {

  function BaseWidget(attrs) {
    
    // Set defaults
    _.defaults(attrs, this.defaults);

    // Extend this object
    _.extend(this, attrs);

  }

  BaseWidget.prototype = {

    defaults: {
      style: {
        width: '100%'
      }
    }

  };

  BaseWidget.extend = function(protoProps) {
    if (protoProps.hasOwnProperty('defaults') && typeof protoProps.defaults === 'object') {
      _.defaults(protoProps.defaults, BaseWidget.prototype.defaults);
    }
    return extend.call(this, protoProps);
  };

  return BaseWidget;

});