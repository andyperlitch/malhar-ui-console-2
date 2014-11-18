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

angular.module('app.components.resources.RoleCollection', [
  'app.components.resources.BaseCollection',
  'app.components.resources.RoleModel'
])
/**
 * @ngdoc service
 * @name  app.components.resources.RoleCollection
 * @description  Represents a collection of RoleModels
 * @requires  app.settings
 * @requires  app.components.services.getUri
 * @requires  app.components.resources.BaseCollection
 * @requires  app.components.resources.RoleModel
 */
.factory('RoleCollection', function(BaseCollection, RoleModel, $q) {
  var RoleCollection = BaseCollection.extend({
    debugName: 'Role Collection',
    urlKey: 'Role',
    model: RoleModel,
    transformResponse: function(raw) {
      var roles = raw.roles;
      _.map(roles, RoleModel.prototype.transformResponse);
      return roles;
    },
    defaultSetOptions: {
      alwaysReset: true
    },

    save: function() {
      var saves = _.map(this.data, function(r) {
        // HACK
        return RoleModel.prototype.save.call({ data:r }, true);
        // return r.save();
      });
      return $q.all(saves);
    }
  });
  return RoleCollection;
});