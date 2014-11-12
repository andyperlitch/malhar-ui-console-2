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

  var $scope, $q, authentication, $location, $route, notifier, getUri, userSession, webSocket;

  beforeEach(module('app', function($provide) {
    $provide.value('userSession', userSession = {});
  }));

  beforeEach(inject(function($rootScope, $controller, _$q_){
    $scope = $rootScope.$new();
    $q = _$q_;
    $controller('AppCtrl', {
      $scope: $scope,
      authentication: authentication = {},
      $location: $location = {},
      notificationService: notifier = {},
      getUri: getUri = {},
      $route: $route = {},
      webSocket: webSocket = {
        connect: jasmine.createSpy()
      }
    });
  }));

  describe('the $locationChangeStart handler', function() {
    
    var $event, url, dfd, obj;

    beforeEach(function() {
      $location.url = jasmine.createSpy();
      $location.search = jasmine.createSpy();
      $location.path = function() {
        return '/testing/path';
      };
      getUri.page = function(key) {
        if (key === 'Login') {
          return '/testing/login';
        }
        return '/not/the/page';
      };
      $route.reload = jasmine.createSpy();
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

      describe('and the promise from retrieveAuthStatus resolves', function() {

        describe('and auth is enabled', function() {
          
          beforeEach(function() {
            authentication.isEnabled = function() {
              return true;
            };
          });

          describe('and the user is logged in', function() {
            beforeEach(function() {
              authentication.isAuthenticated = function() {
                return true;
              };
              obj.handler($event, url);
              dfd.resolve();
              $scope.$digest();
            });
            
            it('should reload the current page', function() {
              expect($route.reload).toHaveBeenCalled();
            });

            it('should not call the error method of notificationService', function() {
              expect(notifier.error).not.toHaveBeenCalled();   
            });

            it('should call connect on the websocket', function() {
              expect(webSocket.connect).toHaveBeenCalled();
            });
          });

          describe('and the user is not logged in', function() {
            beforeEach(function() {
              authentication.isAuthenticated = function() {
                return false;
              };
            });

            describe('and the initial route is not the login page', function() {
              beforeEach(function() {
                obj.handler($event, url);
                dfd.resolve();
                $scope.$digest();
              });

              it('should redirect to login', function() {
                expect($location.url).toHaveBeenCalledWith('/testing/login');
              });
            });

            describe('and the initial route is the login page', function() {
              beforeEach(function() {
                $location.path = function() {
                  return '/testing/login';
                };
                obj.handler($event, '/testing/login');
                dfd.resolve();
                $scope.$digest();
              });

              it('should reload the page', function() {
                expect($route.reload).toHaveBeenCalled();
              });
            });

          });

        });

        describe('and auth is disabled', function() {
          
          beforeEach(function() {
            authentication.isEnabled = function() {
              return false;
            };
            obj.handler($event, url);
            dfd.resolve();
            $scope.$digest();
          });

          it('should reload the current page', function() {
            expect($route.reload).toHaveBeenCalled();
          });

          it('should call connect on the websocket', function() {
            expect(webSocket.connect).toHaveBeenCalled();
          });

        });

      });

      describe('when the promise from retrieveAuthStatus is rejected', function() {
        
        beforeEach(function() {
          obj.handler($event, url);
          dfd.reject();
          $scope.$digest();
        });
        
        it('should try and just reload the current page', function() {
          expect($route.reload).toHaveBeenCalled();
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

      describe('and auth is disabled', function() {
        
        beforeEach(function() {
          authentication.isEnabled = function() {
            return false;
          };
          obj.handler($event, url);  
        });

        it('should not call preventDefault', function() {
          expect($event.preventDefault).not.toHaveBeenCalled();
        });

      });

      describe('and auth is enabled', function() {
        
        beforeEach(function() {
          authentication.isEnabled = function() {
            return true;
          };  
        });

        describe('and the user is not logged in', function() {
          
          beforeEach(function() {
            authentication.isAuthenticated = function() {
              return false;
            };
            obj.handler($event, url);
          });

          it('should stop the current page from loading and redirect to the login page', function() {
            expect($event.preventDefault).toHaveBeenCalled();
            expect($location.url).toHaveBeenCalledWith('/testing/login');
          });

        });

        describe('and the user is logged in', function() {
          
          beforeEach(function() {
            authentication.isAuthenticated = function() {
              return true;
            };
          });

          it('should not call preventDefault or $location.url if auth is enabled and the user is logged', function() {
            obj.handler($event, url);
            expect($event.preventDefault).not.toHaveBeenCalled();
            expect($location.url).not.toHaveBeenCalledWith('/testing/login');
          });

        });

      });

    });

  });

});