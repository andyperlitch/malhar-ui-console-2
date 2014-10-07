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

angular.module('app.components.directives.licenseMemoryUsage', [
  'ui.bootstrap.progressbar'
])
.directive('licenseMemoryUsage', function() {
  return {
    restrict: 'EA',
    scope: {
      license: '='
    },
    templateUrl: 'components/directives/licenseMemoryUsage/licenseMemoryUsage.html',
    link: function(scope) {
      scope.$watch('license.agent.data', function(newValue) {
        if (newValue.hasOwnProperty('remainingLicensedMB')) {
          scope.totalLicensedMB = newValue.totalLicensedMB * 1;
          scope.remainingLicensedMB = newValue.remainingLicensedMB * 1;
          scope.usedLicensedMB = scope.totalLicensedMB - scope.remainingLicensedMB;
          scope.percentageMemoryUsed = (scope.usedLicensedMB / scope.totalLicensedMB).toFixed(4) * 100;

          var type;
          if (scope.percentageMemoryUsed <= 30) {
            type = 'success';
          }
          else if (scope.percentageMemoryUsed <= 50) {
            type = '';
          }
          else if (scope.percentageMemoryUsed <= 75) {
            type = 'warning';
          }
          else {
            type = 'danger';
          }
          scope.type = type;
        }
      }, true);
    }
  };
});