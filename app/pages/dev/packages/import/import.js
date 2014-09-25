/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('app.pages.dev.packages.import', [
  'ui.grid',
  'ui.grid.selection',
  'ui.grid.resizeColumns',
  'app.components.resources.PackageImportCollection'
])

// Routing
  .config(function($routeProvider, settings) {

    $routeProvider.when(settings.pages.PackageImport, {
      controller: 'PackageImportCtrl',
      templateUrl: 'pages/dev/packages/import/import.html',
      label: 'Import'
    });

  })

// Controller
  .controller('PackageImportCtrl', function($scope, $rootScope, $location, PackageImportCollection, settings) {
    function fetchPackages() {
      var packages = new PackageImportCollection();
      packages.fetch().then(function (data) {
        $scope.gridOptions.data = data;
      });
    }

    $scope.gridOptions = {
      data: [],
      enableColumnResizing: true,
      enableRowSelection: true,
      multiSelect: true,
      columnDefs: [
        {
          name: 'file',
          width: '50%'
        },
        {
          name: 'displayName',
          width: '30%'
        },
        {
          name: 'version',
          width: '20%'
        }
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      }
    };

    fetchPackages();

    angular.extend($scope, {
      alerts: [],

      importPackage: function () {
        var selected = $scope.gridApi.selection.getSelectedRows();
        if (selected && (selected.length > 0)) {
          var files = _.map(selected, function (appPackage) {
            return appPackage.file;
          });
          var packages = new PackageImportCollection();
          packages.post({
            files: files
          }).then(function () {
            $rootScope.message = {
              type: 'success',
              msg: 'Package(s) successfully imported'
            };
            $location.path(settings.pages.Packages);
          }, function () {
            $scope.alerts.push({
              type: 'danger',
              msg: 'Failed to import'
            });
          });
        }
      },

      closeAlert: function (index) {
        $scope.alerts.splice(index, 1);
      }
    });
  });