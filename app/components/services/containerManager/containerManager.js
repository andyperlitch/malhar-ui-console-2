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

angular.module('app.components.services.containerManager', [
  'app.components.resources.ContainerLogCollection',
  'app.components.services.confirm',
  'app.components.services.dtText',
  'app.components.services.getUri'
])
.factory('containerManager', function(confirm, dtText, getUri, $http, ContainerLogCollection) {

  return {

    /**
     * checks if a given container id is that of the app master.
     * @param  {string}  id container id to be tested
     * @return {Boolean}    true=app master, false=not
     */
    isAppMaster: function(id) {
      return (/_0+1$/).test(id);
    },

    /**
     * kills a given container
     * @param  {object} container Object representing a container (may or may not contain appId)
     * @param  {string} appId     (optional) If not provided in container object, this will be used as appId.
     * @param  {boolean} force    If set to true, confirm will not be called for app master
     * @return {promise}          The promise returned by the original $http.post call.
     */
    kill: function(container, appId, force) {

      if (typeof appId === 'boolean') {
        force = appId;
        appId = null;
      }

      var url = getUri.action('killContainer', { containerId: container.id, appId: container.appId || appId });

      if (this.isAppMaster(container.id) && !force) {

        return confirm({
          title: dtText.get('Kill Application Master?'),
          body: dtText.get('Are you sure you want to kill the application master? This will likely kill the entire application, depending on your specific Hadoop settings (yarn.resourcemanager.am.max-attempts).'),
          confirmText: dtText.get('yes, kill the application master')
        })
        .then(function() {
          $http.post(url);
        });

      }

      else {
        $http.post(url);
      }

    },

    /**
     * Factory method that creates a ContainerLogCollection for
     the given container.
     * @param  {object}  container        The object representing the container
     * @return {ContainerLogCollection}   The collection resource of logs for given container
     */
    getLogsFor: function(container, appId) {
      var logs = new ContainerLogCollection({
        containerId: container.id,
        appId: container.appId || appId
      });
      logs.fetch();
      return logs;
    }
  };

});