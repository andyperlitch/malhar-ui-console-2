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

describe('Controller: AppCtrl', function() {

  var $scope, $q, authentication, $location, notifier, getUri;

  beforeEach(module('app'));

  beforeEach(inject(function($rootScope, $controller, _$q_){
    $scope = $rootScope.$new();
    $q = _$q_;
    $controller('AppCtrl', {
      $scope: $scope,
      authentication: authentication = {},
      $location: $location = {},
      notificationService: notifier = {},
      getUri: getUri = {}
    });
  }));

  describe('the $locationChangeStart handler', function() {
    
    var $event, url, dfd, obj;

    beforeEach(function() {
      $location.url = jasmine.createSpy();
      notifier.error = jasmine.createSpy();
      dfd = $q.defer();
      authentication.retrieveAuthStatus = function() {
        return dfd.promise;
      };
      spyOn(authentication, 'retrieveAuthStatus').and.callThrough();
      obj = {};
      obj.handler = $scope.$$listeners.$locationChangeStart[0];
      $event = {
        preventDefault: jasmine.createSpy()
      };
      url = '/ws/v1/awesomeness';
    });

    it('should exist', function() {
      expect(typeof obj.handler).toEqual('function');
    });

    describe('when auth status has yet to be checked', function() {
      
      beforeEach(function() {
        
        authentication.hasRetrievedAuthStatus = function() {
          return false;
        };
        spyOn(authentication, 'hasRetrievedAuthStatus').and.callThrough();
        
      });

      it('should call hasRetrievedAuthStatus', function() {
        obj.handler($event, url);
        expect(authentication.hasRetrievedAuthStatus).toHaveBeenCalled();
      });

      it('should call preventDefault on the event', function() {
        obj.handler($event, url);
        expect($event.preventDefault).toHaveBeenCalled();
      });

      describe('when the promise from retrieveAuthStatus resolves', function() {

        beforeEach(function() {
          obj.handler($event, url);
          dfd.resolve();
          $scope.$digest();
        });
        
        it('should call $location.url with the initial url', function() {
          expect($location.url).toHaveBeenCalledWith(url);
        });

        it('should not call the error method of notificationService', function() {
          expect(notifier.error).not.toHaveBeenCalled();   
        });

      });

      describe('when the promise from retrieveAuthStatus is rejected', function() {
        
        beforeEach(function() {
          obj.handler($event, url);
          dfd.reject();
          $scope.$digest();
        });
        
        it('should call $location.url with the initial url', function() {
          expect($location.url).toHaveBeenCalledWith(url);
        });

        it('should call the error method of notificationService', function() {
          expect(notifier.error).toHaveBeenCalled();   
        });

      });

    });

    describe('when auth status has been checked', function() {
      
      beforeEach(function() {
        authentication.hasRetrievedAuthStatus = function() {
          return true;
        };
        spyOn(authentication, 'hasRetrievedAuthStatus').and.callThrough();
      });

      it('should not call preventDefault if auth is disabled', function() {
        authentication.isEnabled = function() {
          return false;
        };
        obj.handler($event, url);
        expect($event.preventDefault).not.toHaveBeenCalled();
      });

      it('should call preventDefault and $location.url with login page if auth is enabled and the user is not logged in', function() {
        getUri.page = function(key) {
          if (key === 'Login') {
            return '/testing/login';
          }
          return '/not/the/page';
        };
        authentication.isEnabled = function() {
          return true;
        };
        authentication.isAuthenticated = function() {
          return false;
        };
        obj.handler($event, url);
        expect($event.preventDefault).toHaveBeenCalled();
        expect($location.url).toHaveBeenCalledWith('/testing/login');
      });

      it('should not call preventDefault or $location.url if auth is enabled and the user is logged', function() {
        authentication.isEnabled = function() {
          return true;
        };
        authentication.isAuthenticated = function() {
          return true;
        };
        obj.handler($event, url);
        expect($event.preventDefault).not.toHaveBeenCalled();
        expect($location.url).not.toHaveBeenCalledWith('/testing/login');
      });

    });

  });

});