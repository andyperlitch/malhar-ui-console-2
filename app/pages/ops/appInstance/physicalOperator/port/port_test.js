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

describe('Controller: PortPageCtrl', function() {

    var $scope, breadcrumbs;
    
    beforeEach(module('app.pages.ops.appInstance.physicalOperator.port'));

    beforeEach(inject(function($rootScope, $controller){

        breadcrumbs = { options: {} };

        $scope = $rootScope.$new();
        $controller('PortPageCtrl', {
            $scope: $scope,
            breadcrumbs: breadcrumbs,
            $routeParams: {
              appId: 'app1',
              operatorId: 'operator1',
              portId: 'port1'
            }
        });
    }));

    it('should put a dashboardOptions object on the $scope', function() {
      expect(typeof $scope.dashboardOptions).toEqual('object');
    });

    it('should set breadcrumbs.options.Port to a string containing $routeParams.portId', function() {
      expect(typeof breadcrumbs.options.Port).toEqual('string');
      expect(breadcrumbs.options.Port.indexOf('port1')).toBeGreaterThan(-1);
    });

    it('should set breadcrumbs.options["Physical Operator"] to a string containing $routeParams.operatorId', function() {
      expect(typeof breadcrumbs.options['Physical Operator']).toEqual('string');
      expect(breadcrumbs.options['Physical Operator'].indexOf('operator1')).toBeGreaterThan(-1);
    });

    it('should set breadcrumbs.options.appInstance to a string containing $routeParams.appId', function() {
      expect(typeof breadcrumbs.options['App Instance']).toEqual('string');
      expect(breadcrumbs.options['App Instance'].indexOf('app1')).toBeGreaterThan(-1);
    });

});