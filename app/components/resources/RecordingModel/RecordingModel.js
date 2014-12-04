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

angular.module('app.components.resources.RecordingModel', [
  'app.components.resources.BaseModel',
  'jsbn.BigInteger'
])
/**
 * @ngdoc service
 * @name  app.components.resources.RecordingModel
 * @description Represents a recording on a physical operator.
 * @requires app.components.resources.BaseModel
 * @requires jsbn.BigInteger
 */
.factory('RecordingModel', function(BaseModel, $http, $q, BigInteger) {
  var RecordingModel = BaseModel.extend({
    debugName: 'Recording',
    urlKey: 'Recording',
    updateParams: function(params) {
      BaseModel.prototype.updateParams.call(this, params);
      this.tupleUrl = this.url + '/tuples';
    },
    /**
     * @ngdoc method
     * @name app.components.resources.RecordingModel#delete
     * @methodOf app.components.resources.RecordingModel
     * @description Deletes the recording.
     * @returns {Promise}  Returns the promise from the HTTP DELETE call.
    **/
    delete: function() {
      return $http.delete(this.url);
    },

    /**
     * @ngdoc method
     * @name app.components.resources.RecordingModel#getTuples
     * @methodOf app.components.resources.RecordingModel
     * @description   Retrieves tuples of this recording given an offset, limit, and 
     *                selection of ports to include tuples from.
     * @param  {number|string} offset The offset of the tuples to get.
     * @param  {number|string} limit  The maximum number of tuples to retrieve.
     * @param  {Array=} ports  The ids of the ports to include
     * @return {Promise}       A promise which resolves with the tuples, or rejects with the original server response.
     */
    getTuples: function(offset, limit, ports) {

      if (typeof offset === 'undefined') {
        throw new TypeError('An offset must be supplied to the getTuples method');
      }

      if (typeof limit === 'undefined') {
        throw new TypeError('A limit must be supplied to the getTuples method');
      }

      if (!(/^\d+$/.test(offset + ''))) {
        throw new TypeError('The offset must be a number. Actual passed value: ', offset);
      }

      if (!(/^\d+$/.test(limit + ''))) {
        throw new TypeError('The limit must be a number. Actual passed value: ', limit);
      }

      var dfd = $q.defer();
      var requestParams = {
        offset: offset,
        limit: limit
      };
      if (ports) {
        requestParams.ports = ports.join(',');
      }
      $http.get(this.tupleUrl, { params: requestParams }).then(function(res) {
        var data = res.data;
        var result = [];
        var indexBI = new BigInteger(data.startOffset+'');
        for (var i=0; i < data.tuples.length; i++) {
          var tupleGroup = data.tuples[i];
          var windowId = tupleGroup.windowId;
          var tuples = tupleGroup.tuples;
          for (var k = 0; k < tuples.length; k++) {
            var tuple = tuples[k];
            tuple.index = indexBI.toString();
            tuple.windowId = windowId;
            result.push(tuple);
            indexBI = indexBI.add(BigInteger.ONE);
          }
        }
        dfd.resolve(result);
      }, dfd.reject);

      return dfd.promise;
    }
  });
  return RecordingModel;
});