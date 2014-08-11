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

describe('Controller: AppInstanceCtrl', function() {

    var $scope;
    
    beforeEach(module('app.pages.ops.appInstance', function($provide) {
      $provide.value('webSocket', {
        subscribe: jasmine.createSpy(),
        unsubscribe: jasmine.createSpy()
      });
      $provide.value('breadcrumbs', {
        options: {}
      });
    }));

    beforeEach(inject(function($rootScope, $controller){
        $scope = $rootScope.$new();
        $controller('AppInstanceCtrl', {
            $scope: $scope,

            // Put other mock injections here...
            
        });
    }));

    it('should have a dashboardOptions object', function() {
      expect(typeof $scope.dashboardOptions).toEqual('object');
    });

    it('should have an appInstance', inject(function(ApplicationModel) {
      expect($scope.appInstance instanceof ApplicationModel).toEqual(true);
    }));

    it('should call unsubscribe on appInstance when the $scope is destroyed', function() {
      spyOn($scope.appInstance, 'unsubscribe');
      $scope.$destroy();
      expect($scope.appInstance.unsubscribe).toHaveBeenCalled();
    });

});