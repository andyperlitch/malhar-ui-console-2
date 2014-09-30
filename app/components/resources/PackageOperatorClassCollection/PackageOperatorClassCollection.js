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

angular.module('app.components.resources.PackageOperatorClassCollection', [
  'app.components.resources.BaseCollection',
  'app.components.resources.PackageOperatorClassModel',
  'app.settings'
])
.factory('PackageOperatorClassCollection', function(BaseCollection, PackageOperatorClassModel, settings) {
  var PackageOperatorClassCollection = BaseCollection.extend({
    debugName: 'Package Operators',
    urlKey: 'PackageOperatorClass',
    transformResponse: function(raw) {
      _.each(raw.operatorClasses, function(op) {
        // Add packageName and className to operator object
        op.packageName = op.name.replace(/\.[^\.]+$/, '');
        op.simpleName = op.name.replace(/.*(?=\.)\./, '');
        // remove this once the server starts sending attributes per operator
        op.attributes = _(settings.OPERATOR_ATTRIBUTES).clone();
      });
      // do not include operators with no displayName
      raw.operatorClasses = _.filter(raw.operatorClasses, function(op) { return op.displayName; });
      return raw.operatorClasses;
    },
    model: PackageOperatorClassModel
  });
  return PackageOperatorClassCollection;
});
