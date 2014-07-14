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

describe('Factory: confirm', function () {

  var deferred, $modal = {};

  // load the service's module
  beforeEach(module('app.components.services.confirm', function($provide) {
    $provide.value('$modal', $modal);
  }));

  // instantiate service
  var confirm;
  beforeEach(inject(function (_confirm_, $q) {
    confirm = _confirm_;

    $modal.open = function(options) {
      deferred = $q.defer();
      return { result: deferred.promise };
    };

  }));

  it('should be a function', function() {
    expect(typeof confirm).toEqual('function');
  });

  it('should return the result of the $modal it opens', function() {
    var res = confirm({
      title: 'Test'
    });
    expect(res === deferred.promise).toEqual(true);
  });


});

'use strict';

describe('Controller: ConfirmServiceController', function() {

    var $scope, params;
    
    beforeEach(module('app.components.services.confirm'));

    beforeEach(inject(function($rootScope, $controller){
        params = {};
        $scope = $rootScope.$new();
        $controller('ConfirmServiceController', {
            $scope: $scope,
            params: params
        });
    }));

    it('should put params on the scope', function() {
      expect($scope.params === params).toEqual(true);
    });

});