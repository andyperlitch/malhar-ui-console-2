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

angular.module('app.components.resources.PackageApplicationModel',[
  'app.components.resources.BaseModel'
])
  .factory('PackageApplicationModel', function(BaseModel) {
    var PackageApplicationModel = BaseModel.extend({
      debugName: 'PackageApplicationModel',
      urlKey: 'PackageApplication',
      idAttribute: 'name',
      transformResponse: function(raw) {
        if (raw.fileContent && raw.fileContent.operators) {
          _.each(raw.fileContent.operators, function(o) {
            o.x *= 1;
            o.y *= 1;
          });
        }
        return raw;
      },
      save: function(errorIfExists) {
        errorIfExists = !! errorIfExists;
        return BaseModel.prototype.save.call(this, { params: { errorIfExists: errorIfExists } }, this.data.fileContent);
      },
      launch: function () {
        console.log('launch ' + this.url);
        return this.post({}, 'launch');
      }
    });
    return PackageApplicationModel;
  });
