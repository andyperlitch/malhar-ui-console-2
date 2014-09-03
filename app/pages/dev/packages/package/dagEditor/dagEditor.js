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

angular.module('app.pages.dev.packages.package.dagEditor', [

  // MOCK DATA: FOR TESTING ONLY
  'app.pages.dev.packages.package.dagEditor.mockOperatorsData'

])

// Routing
.config(function($routeProvider, settings) {

  $routeProvider.when(settings.pages.DagEditor, {
    controller: 'DagEditorCtrl',
    templateUrl: 'pages/dev/packages/package/dagEditor/dagEditor.html',
    label: 'edit DAG'
  });

})

// Controller
.controller('DagEditorCtrl', function($scope, mockOperatorsData) {

  // Search object
  $scope.operatorClassSearch = { term: '' };
  
  // Operator Classes:
  $scope.operatorClasses = mockOperatorsData;
  
  // Chosen Operators
  $scope.operators = [];
  
});