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

angular.module('app.pages.config.installWizard.summary.InstallWizardSummaryCtrl', [
  'app.components.resources.ConfigIssueCollection',
  'app.components.resources.ConfigPropertyModel'
])
.controller('InstallWizardSummaryCtrl', function($scope, $element, $q, ConfigIssueCollection, ConfigPropertyModel) {

  $element.find('.nextButton').focus();  

  // Update the dt.configStatus property
  $scope.completeProperty = new ConfigPropertyModel('dt.configStatus');
  $scope.completeProperty.set({ value: 'complete' });
  $scope.completeProperty.save();

  // Check for any severe issues
  $scope.issues = new ConfigIssueCollection();
  $scope.issues.fetch().then(function() {
    $scope.severeIssues = _.filter($scope.issues.data, function(issue) {
      return issue.severity === 'error';
    });
  });
});