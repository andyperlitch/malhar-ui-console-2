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

angular.module('app.components.resources.RecordingCollection', [
  'app.components.resources.BaseCollection',
  'app.components.resources.RecordingModel'
])
/**
 * @ngdoc service
 * @name  app.components.resources.RecordingCollection
 * @description  Represents a collection of recordings.
 * @requires  app.components.resources.BaseCollection
 * @requires  app.components.resources.RecordingModel
 */
.factory('RecordingCollection', function(BaseCollection, RecordingModel) {
  var RecordingCollection = BaseCollection.extend({
    debugName: 'Recording Collection',
    urlKey: 'Recording',
    model: RecordingModel,
    transformResponse: 'recordings'
  });
  return RecordingCollection;
});