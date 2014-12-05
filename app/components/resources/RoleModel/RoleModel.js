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

angular.module('app.components.resources.RoleModel', [
  'app.components.resources.BaseModel',
  'app.components.services.getUri',
  'app.components.services.confirm',
  'app.components.services.dtText'
])
/**
 * @ngdoc service
 * @name  app.components.resources.RoleModel
 * @description  Represents a Role
 * @requires  app.settings
 * @requires  app.components.services.getUri
 * @requires  app.components.resources.BaseModel
 */
.factory('RoleModel', function(BaseModel, $http, getUri, confirm, dtText, $q) {

  function convertPermissionsToObject (arr) {
    var result = {};
    _.each(arr, function(p) {
      result[p] = true;
    });
    return result;
  }

  function convertPermissionsToArray(object) {
    var results = [];
    for (var k in object) {
      if (object.hasOwnProperty(k)) {
        if (object[k] === true) {
          results.push(k);
        }
      }
    }
    return results;
  }

  var RoleModel = BaseModel.extend({
    debugName: 'Role',
    urlKey: 'Role',
    idAttribute: 'name',
    transformResponse: function(obj) {
      obj.permissions = convertPermissionsToObject(obj.permissions);
      return obj;
    },
    save: function() {

      if (this.data.name === 'admin') {
        var dfd = $q.defer();
        dfd.resolve();
        return dfd.promise;
      }

      var saveUrl = getUri.url('Role', null, this.data.name);
      var data = angular.copy(this.data);
      data.permissions = convertPermissionsToArray(data.permissions);
      return $http.put(saveUrl, data);
    },
    delete: function(force) {
      var deleteUrl = getUri.url('Role', null, this.data.name);

      if (force) {
        return $http.delete(deleteUrl);
      }

      return confirm({
        title: dtText.sprintf('Delete role "%s"?', this.data.name),
        body: dtText.get('This action cannot be undone.')
      }).then(function() {
        return $http.delete(deleteUrl); 
      });
    }
  });
  return RoleModel;
});