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

angular.module('app.pages.ops.appInstance.widgets.ContainersList.ContainersListPaletteCtrl', [
  'app.settings',
  'app.components.services.containerManager'
])
.controller('ContainersListPaletteCtrl', function($scope, containerManager, settings) {
  // Palette Methods
  $scope.selectActive = function(excludeAppMaster) {
    this.selected.length = 0;
    _.each(this.resource.data, function(c) {
      if (settings.NONENDED_CONTAINER_STATES.indexOf(c.state) >= 0) {
        if (!excludeAppMaster || !containerManager.isAppMaster(c.id)) {
          this.selected.push(c.id);
        }
      }
    }, this);
  };

  $scope.retrieveKilled = function() {
    this.resource.fetch();
  };

  $scope.deselectAll = function() {
    this.selected.length = 0;
  };

  $scope.killSelected = function() {
    _.each(this.selected, function(id) {
      containerManager.kill({ id: id }, this.appId);
    }, this);
  };

  $scope.getLogsForSelected = function() {
    var selected = this.selected[0];
    var container = _.find(this.resource.data, function(c) {
      return c.id === selected;
    });
    this.logsForSelected = containerManager.getLogsFor(container, $scope.appId);
  };
});