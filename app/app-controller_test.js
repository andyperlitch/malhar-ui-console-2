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

  var $scope, $q, authentication, $location, $route, notifier, getUri, currentUser, webSocket, $log, setupBreadcrumbs;

  beforeEach(module('app', function($provide) {
    $provide.value('currentUser', currentUser = {});
  }));

  beforeEach(inject(function($rootScope, $controller, _$q_, _$log_){
    $scope = $rootScope.$new();
    $q = _$q_;
    $log = _$log_;
    $controller('AppCtrl', {
      $scope: $scope,
      authentication: authentication = {},
      $location: $location = {},
      notificationService: notifier = {},
      getUri: getUri = {},
      $route: $route = {},
      webSocket: webSocket = {
        connect: jasmine.createSpy()
      },
      setupBreadcrumbs: setupBreadcrumbs = jasmine.createSpy()
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
      getUri.page = function(key, params, noHash) {
        if (key === 'Login' && noHash) {
          return '/testing/login';
        }
        return '/not/the/page';
      };
      $route.reload = jasmine.createSpy();
      notifier.notify = jasmine.createSpy();
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

            it('should not call the notify method of notificationService', function() {
              expect(notifier.notify).not.toHaveBeenCalled();   
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

        it('should call the notify method of notificationService', function() {
          expect(notifier.notify).toHaveBeenCalled();
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
          });
                    
          describe('and the current page is not the login page', function() {
            beforeEach(function() {
              obj.handler($event, url);
            });

            it('should stop the current page from loading and redirect to the login page', function() {
              expect($event.preventDefault).toHaveBeenCalled();
              expect($location.url).toHaveBeenCalledWith('/testing/login');
            });

          });

          describe('and the current page is the login page', function() {
            beforeEach(function() {
              $location.path = function() {
                return '/testing/login';
              };
              obj.handler($event, url);
            });

            it('should not stop the current page from loading', function() {
              expect($event.preventDefault).not.toHaveBeenCalled();
            });

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

  describe('the logout function', function() {

    var dfd, obj;

    beforeEach(function() {
      dfd = $q.defer();
      currentUser.logout = function() {
        return dfd.promise;
      };
      $location.path = function() {
        return '/current/path';
      };
      getUri.page = function(key, params, noHash) {
        if (key === 'Login' && noHash) {
          return '/login/page';
        }
        return '/not/login';
      };
      $location.url = jasmine.createSpy();
      $location.search = jasmine.createSpy();
      spyOn(currentUser, 'logout').and.callThrough();
    });
    
    it('should be a function', function() {
      expect(typeof $scope.logout).toEqual('function');
    });

    it('should call currentUser.logout', function() {
      $scope.logout();
      expect(currentUser.logout).toHaveBeenCalled();
    });

    it('should set loggingOut on scope to true', function() {
      $scope.logout();
      expect($scope.loggingOut).toEqual(true);
    });

    describe('when the logout promise resolves', function() {
      
      beforeEach(function() {
        $scope.logout();
        dfd.resolve();
        $scope.$digest();
      });

      it('should redirect the page to the login page, with a redirect to the original page', function() {
        expect($location.url).toHaveBeenCalledWith('/login/page');
        expect($location.search).toHaveBeenCalledWith('redirect', '/current/path');
      });

    });

    describe('when the logout promise rejects', function() {
      
      beforeEach(function() {
        spyOn($log, 'error');
        notifier.notify = jasmine.createSpy();
        $scope.logout();
        dfd.reject();
        $scope.$digest();
      });

      it('should call notificationService.notify and $log.error', function() {
        expect($log.error).toHaveBeenCalled();
        expect(notifier.notify).toHaveBeenCalled();
      });    

    });

  });

  describe('the $routeChangeSuccess handler', function() {
    
    it('should be there', function() {
      expect($scope.$$listeners.$routeChangeSuccess.length).toEqual(1);
    });

    it('should call setupBreadcrumbs', function() {
      $scope.$$listeners.$routeChangeSuccess[0]();
      expect(setupBreadcrumbs).toHaveBeenCalled();
    });

  });

});
