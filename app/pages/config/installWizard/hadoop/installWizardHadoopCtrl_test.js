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

describe('Controller: InstallWizardHadoopCtrl', function() {

  var $scope,
      $q,
      $log,
      ConfigPropertyModel,
      HadoopLocation,
      ConfigIssueCollection,
      gatewayManager,
      $modal,
      $timeout,
      authentication,
      delayedBroadcast;
  
  beforeEach(module('app.pages.config.installWizard.hadoop.InstallWizardHadoopCtrl'));

  beforeEach(inject(function($rootScope, $controller, _$q_, _$timeout_){
    $q = _$q_;
    
    $scope = $rootScope.$new();
    $scope.goToStep = jasmine.createSpy('goToStep');

    $log = {
      error: jasmine.createSpy('error'),
      debug: jasmine.createSpy('debug'),
      info: jasmine.createSpy('info'),
      warn: jasmine.createSpy('warn')
    };

    ConfigPropertyModel = function() {
      this.data = {};
      this.fetch = jasmine.createSpy('fetch').and.callFake(function() {
        return ConfigPropertyModel.fetchDfd.promise;
      });
      this.save = jasmine.createSpy('save').and.callFake(function() {
        return ConfigPropertyModel.saveDfd.promise;
      });
    };
    ConfigPropertyModel.fetchDfd = $q.defer();
    ConfigPropertyModel.saveDfd = $q.defer();

    HadoopLocation = function() {
      this.data = {};
      this.fetch = jasmine.createSpy('fetch').and.callFake(function() {
        return HadoopLocation.fetchDfd.promise;
      });
      this.save = jasmine.createSpy('save').and.callFake(function() {
        return HadoopLocation.saveDfd.promise;
      });
    };
    HadoopLocation.fetchDfd = $q.defer();
    HadoopLocation.saveDfd = $q.defer();

    ConfigIssueCollection = function() {
      this.data = [];
      this.fetch = jasmine.createSpy('fetch').and.callFake(function() {
        return ConfigIssueCollection.fetchDfd.promise;
      });
    };
    ConfigIssueCollection.fetchDfd = $q.defer();


    gatewayManager = {};
    gatewayManager.restart = jasmine.createSpy('restart').and.callFake(function() {
      return gatewayManager.restartDfd.promise;
    });
    gatewayManager.restartDfd = $q.defer();

    $modal = {
      open: jasmine.createSpy('open').and.callFake(function() {
        return {
          opened: $modal.openedDfd.promise,
          close: $modal.close
        };
      }),
      openedDfd: $q.defer(),
      close: jasmine.createSpy('close')
    };
    $timeout = _$timeout_;
    delayedBroadcast = jasmine.createSpy('delayedBroadcast').and.callFake(function() {

    });

    authentication = {
      retrieveAuthStatus: jasmine.createSpy('retrieveAuthStatus').and.callFake(function() {
        return authentication.retrieveDfd.promise;
      })
    };
    authentication.retrieveDfd = $q.defer();

    $controller('InstallWizardHadoopCtrl', {
      $scope: $scope,
      $log: $log,
      ConfigPropertyModel: ConfigPropertyModel,
      HadoopLocation: HadoopLocation,
      ConfigIssueCollection: ConfigIssueCollection,
      gatewayManager: gatewayManager,
      $modal: $modal,
      $timeout: $timeout,
      delayedBroadcast: delayedBroadcast,
      authentication: authentication
    });
  }));

  it('should add issues, dfsLocation, and hadoopLocation to the scope', function() {
    expect($scope.dfsLocation instanceof ConfigPropertyModel).toEqual(true);
    expect($scope.issues instanceof ConfigIssueCollection).toEqual(true);
    expect($scope.hadoopLocation instanceof HadoopLocation).toEqual(true);
  });

  it('should set loading flag to true', function() {
    expect($scope.loading).toEqual(true);
  });

  it('should set initialValues of hadoopLocation and dfsLocation to empty strings', function() {
    expect(typeof $scope.initialValues).toEqual('object');
    expect($scope.initialValues.hadoopLocation).toEqual('');
    expect($scope.initialValues.dfsLocation).toEqual('');
  });

  it('should call fetch on dfsLocation and hadoopLocation', function() {
    expect($scope.dfsLocation.fetch).toHaveBeenCalled();
    expect($scope.hadoopLocation.fetch).toHaveBeenCalled();
  });

  describe('when the fetch promises resolve for hadoopLocation and dfsLocation', function() {
    
    beforeEach(function() {
      $scope.dfsLocation.data = { value: '/dfs/location' };
      $scope.hadoopLocation.data = { value: '/usr/bin/hadoop' };
      HadoopLocation.fetchDfd.resolve();
      ConfigPropertyModel.fetchDfd.resolve();
      $scope.$apply();
    });

    it('should set the initialValues to data.value of each', function() {
      expect($scope.initialValues.dfsLocation).toEqual('/dfs/location');
      expect($scope.initialValues.hadoopLocation).toEqual('/usr/bin/hadoop');
    });

    it('should call delayedBroadcast with the event hadoopPropertiesFound', function() {
      expect(delayedBroadcast).toHaveBeenCalledWith('hadoopPropertiesFound');
    });

    it('should set the loading flag to false', function() {
      expect($scope.loading).toBeFalsy();
    });

  });

  describe('when the fetch promises reject (404) for hadoopLocation and dfsLocation', function() {
    
    beforeEach(function() {
      HadoopLocation.fetchDfd.reject({ status: 404 });
      ConfigPropertyModel.fetchDfd.reject({ status: 404 });
      $scope.$apply();
    });

    it('should keep the initialValues to empty strings', function() {
      expect(typeof $scope.initialValues).toEqual('object');
      expect($scope.initialValues.hadoopLocation).toEqual('');
      expect($scope.initialValues.dfsLocation).toEqual('');
    });

    it('should set the loading flag to false', function() {
      expect($scope.loading).toBeFalsy();
    });

    it('should not set $scope.loadError to true', function() {
      expect($scope.loadError).toBeFalsy();
    });

    it('should call delayedBroadcast with the event hadoopPropertiesNotFound', function() {
      expect(delayedBroadcast).toHaveBeenCalledWith('hadoopPropertiesNotFound');
    });

  });

  describe('when the fetch promises reject (500) for hadoopLocation or dfsLocation', function() {
    
    beforeEach(function() {
      HadoopLocation.fetchDfd.reject({ status: 500 });
      ConfigPropertyModel.fetchDfd.reject({ status: 500 });
      $scope.$apply();
    });

    it('should keep the initialValues to empty strings', function() {
      expect(typeof $scope.initialValues).toEqual('object');
      expect($scope.initialValues.hadoopLocation).toEqual('');
      expect($scope.initialValues.dfsLocation).toEqual('');
    });

    it('should set the loading flag to false', function() {
      expect($scope.loading).toBeFalsy();
    });

    it('should set $scope.loadError to true', function() {
      expect($scope.loadError).toBeTruthy();
    });

    it('should log the error', function() {
      expect($log.error).toHaveBeenCalled();
    });

    it('should call delayedBroadcast with the event hadoopPropertiesNotFound', function() {
      expect(delayedBroadcast).toHaveBeenCalledWith('hadoopPropertiesNotFound');
    });

  });

  describe('the next method', function() {


    
    it('should be a function', function() {
      expect(typeof $scope.next).toEqual('function');
    });

    it('should open a modal', function() {
      $scope.next();
      expect($modal.open).toHaveBeenCalled();
    });

    describe('the opened modal', function() {

      var opts;

      beforeEach(function() {
        $scope.next();
        opts = $modal.open.calls.argsFor(0)[0];
      });
      
      it('should be a static modal with keyboard controls disabled', function() {
        expect(opts.backdrop).toEqual('static');
        expect(opts.keyboard).toEqual(false);
      });

      it('should resolve a variable called currentAction (an object)', function() {
        expect(typeof opts.resolve.currentAction()).toEqual('object');
      });

      describe('the modal controller', function() {

        var scope, currentAction;

        beforeEach(function() {
          scope = {};
          currentAction = {
            onLoginSuccess: jasmine.createSpy('onLoginSuccess')
          };
          opts.controller(scope, currentAction);
        });
        
        it('should set the second arg as currentAction on the first arg', function() {
          expect(scope.currentAction).toEqual(currentAction);
        });

        it('should set onLoginSuccess', function() {
          expect(typeof scope.onLoginSuccess).toEqual('function');
        });

        describe('the onLoginSuccess method', function() {
          
          it('should call the same-named method on currentAction', function() {
            scope.onLoginSuccess();
            expect(currentAction.onLoginSuccess).toHaveBeenCalled();
          });

        });

      });

    });

    it('should set the $scope.submittingChanges flag to true', function() {
      $scope.next();
      expect($scope.submittingChanges).toBeTruthy();
    });

    describe('step 1: saving the hadoopLocation', function() {
      describe('when the hadoopLocation has changed', function() {
        
        beforeEach(function() {
          $scope.dfsLocation.data = { value: '/dfs/location' };
          $scope.hadoopLocation.data = { value: '/usr/bin/hadoop' };
          HadoopLocation.fetchDfd.resolve();
          ConfigPropertyModel.fetchDfd.resolve();
          $scope.$apply();
          $scope.hadoopLocation.data.value = '/usr/bin/hadoop2';
        });

        it('should save the hadoopLocation if the value has changed', function() {
          $scope.next();
          expect($scope.hadoopLocation.save).toHaveBeenCalled();
        });

        describe('when the hadoopLocation successfully saves', function() {
          
          beforeEach(function() {
            $scope.next();
            HadoopLocation.saveDfd.resolve();
          });

          it('should clear out any hadoopLocationServerError object on the scope', function() {
            $scope.hadoopLocationServerError = {};
            $scope.$apply();
            expect($scope.hadoopLocationServerError).toEqual(null);
          });

        });

        describe('when the hadoopLocation fails to save', function() {
          
          var err;

          beforeEach(function() {
            err = {
              data: {}
            };
            $scope.next();
            HadoopLocation.saveDfd.reject(err);
          });

          it('should log the error and set hadoopLocationServerError to the response data', function() {
            $scope.hadoopLocationServerError = null;
            $scope.$apply();
            expect($log.error).toHaveBeenCalled();
            expect($scope.hadoopLocationServerError).toEqual(err.data);
          });

        });

      });

      describe('when the hadoopLocation has not changed', function() {
        
        beforeEach(function() {
          $scope.dfsLocation.data = { value: '/dfs/location' };
          $scope.hadoopLocation.data = { value: '/usr/bin/hadoop' };
          HadoopLocation.fetchDfd.resolve();
          ConfigPropertyModel.fetchDfd.resolve();
          $scope.$apply();
        });

        it('should save the hadoopLocation if the value has changed', function() {
          $scope.next();
          expect($scope.hadoopLocation.save).not.toHaveBeenCalled();
        });

      });
    });

    describe('step 2: restarting the gateway', function() {

      var opts, modalScope, currentAction;
      
      beforeEach(function() {
        $scope.dfsLocation.data = { value: '/dfs/location' };
        $scope.hadoopLocation.data = { value: '/usr/bin/hadoop' };
        HadoopLocation.fetchDfd.resolve();
        ConfigPropertyModel.fetchDfd.resolve();
        $scope.$apply();
        $scope.next();
        opts = $modal.open.calls.argsFor(0)[0];
        modalScope = {};
        currentAction = opts.resolve.currentAction();
        opts.controller(modalScope, currentAction);
      });

      describe('when a restart is required', function() {

        beforeEach(function() {
          ConfigIssueCollection.fetchDfd.resolve([{key:'RESTART_NEEDED'}]);
          $scope.$apply();
        });

        it('should restart the gateway', function() {
          expect(gatewayManager.restart).toHaveBeenCalled();
        });

        describe('when the gateway successfully restarts', function() {
          
          beforeEach(function() {
            gatewayManager.restartDfd.resolve();
          });

          describe('and auth is enabled', function() {

            beforeEach(function() {
              // change dfs location to make it easy to test if step 3 executes
              $scope.dfsLocation.data.value = '/another/dfs/location';
              authentication.retrieveDfd.resolve(true);
              
            });

            it('should show the login fields and set focus on the userName field', function() {
              $scope.$apply();
              expect(delayedBroadcast).toHaveBeenCalledWith('putFocusOnLoginUsername');
            });

            it('should not continue to step 3', function() {
              expect($scope.dfsLocation.save).not.toHaveBeenCalled();
            });

            describe('when the user successfully logs in', function() {

              beforeEach(function() {
                $scope.$apply();
                modalScope.onLoginSuccess();
                $scope.$apply();
              });

              it('should continue to step 3', function() {
                expect($scope.dfsLocation.save).toHaveBeenCalled();
              });

              it('should move on to the license step if step 3 goes well', function() {
                ConfigPropertyModel.saveDfd.resolve();
                $modal.openedDfd.resolve();
                $scope.$apply();
                $timeout.flush(1000);
                expect($scope.goToStep).toHaveBeenCalledWith('license');
              });

            });

          });

          describe('and auth is disabled', function() {
            
            var opts, modalScope, currentAction;

            beforeEach(function() {
              // change dfs location to make it easy to test if step 3 executes
              $scope.dfsLocation.data.value = '/another/dfs/location';
              authentication.retrieveDfd.resolve(false);
              opts = $modal.open.calls.argsFor(0)[0];
              modalScope = {};
              currentAction = opts.resolve.currentAction();
              opts.controller(modalScope, currentAction);
              $scope.$apply();
            });

            it('should not show the login fields or set focus on the userName field', function() {
              expect(delayedBroadcast).not.toHaveBeenCalledWith('putFocusOnLoginUsername');
            });

            it('should continue to step 3', function() {
              expect($scope.dfsLocation.save).toHaveBeenCalled();
            });

          });

        });

        describe('when the gateway fails to restart', function() {
          
          beforeEach(function() {
            // change dfs location to make it easy to test if step 3 executes
            $scope.dfsLocation.data.value = '/another/dfs/location';
            gatewayManager.restartDfd.reject();
          });

          it('should log the error and set hadoopLocationServerError to a new object', function() {
            $scope.$apply();
            expect($log.error).toHaveBeenCalled();
            expect($scope.hadoopLocationServerError).toEqual({
              message: 'The gateway could not be restarted.'
            });
          });

          it('should not trigger step 3', function() {
            $scope.$apply();
            expect($scope.dfsLocation.save).not.toHaveBeenCalled();
          });

        });

      });

      describe('when a restart is not required', function() {
        
        beforeEach(function() {
          $scope.dfsLocation.data.value = '/another/dfs/location';
          ConfigIssueCollection.fetchDfd.resolve([]);
          $scope.$apply();
        });

        it('should go to step 3', function() {
          expect($scope.dfsLocation.save).toHaveBeenCalled();
        });

      });

      describe('when the issues fail to load', function() {
        
        beforeEach(function() {
          $scope.dfsLocation.data.value = '/another/dfs/location';
          ConfigIssueCollection.fetchDfd.reject();
          $scope.$apply();
        });

        it('should not call step 3', function() {
          expect($scope.dfsLocation.save).not.toHaveBeenCalled();
        });

        it('should log the error and set the hadoopLocationServerError', function() {
          expect($log.error).toHaveBeenCalledWith('Issues failed to load from the gateway!');
          expect($scope.hadoopLocationServerError).toEqual({
            message: 'Issues could not be loaded from the gateway.'
          });
        });

        it('should close the modal instance', function() {
          $timeout.flush(500);
          expect($modal.close).toHaveBeenCalled();
        });

      });

    });

    describe('step 3: saving the DFS location', function() {
      
      beforeEach(function() {
        ConfigPropertyModel.fetchDfd.resolve();
        HadoopLocation.fetchDfd.resolve();
        $scope.dfsLocation.data.value = '/init/dfs/location';
        $scope.hadoopLocation.data.value = '/my/hadoop/location';
        $scope.$apply();
        $scope.next();
        ConfigIssueCollection.fetchDfd.resolve([]);
      });

      describe('when the dfs location has been changed', function() {
        
        beforeEach(function() {
          $scope.dfsLocation.data.value = '/some/other/dfs/location';
          $scope.$apply();
        });

        it('should try to save the new location', function() {
          expect($scope.dfsLocation.save).toHaveBeenCalled();
        });

        describe('and the save succeeds', function() {
          
          beforeEach(function() {
            $scope.dfsLocationServerError = {};
            ConfigPropertyModel.saveDfd.resolve();
          });

          it('should clear any dfsLocationServerError', function() {
            $scope.$apply();
            expect($scope.dfsLocationServerError).toEqual(null);
          });

          it('should move on to the license step after the modal.opened promise resolves and a one second timeout lapses', function() {
            $modal.openedDfd.resolve();
            $scope.$apply();
            $timeout.flush(1000);
            expect($scope.goToStep).toHaveBeenCalledWith('license');
          });

        });

        describe('and the save fails due to permissions', function() {
          
          beforeEach(function() {
            ConfigPropertyModel.saveDfd.reject({
              data: {
                message: 'permission denied something something something'
              }
            });
            $scope.$apply();
          });

          it('should set permissions key to true on dfsLocationServerError', function() {
            expect($scope.dfsLocationServerError.permissions).toEqual(true);
          });

          it('should close the modal instance', function() {
            $timeout.flush(500);
            expect($modal.close).toHaveBeenCalled();
          });

        });

        describe('and the save fails due to something other than permissions', function() {
          
          var serverResponse;

          beforeEach(function() {
            ConfigPropertyModel.saveDfd.reject(serverResponse = {
              data: {
                message: 'Something other than a permission issue'
              }
            });
            $scope.$apply();
          });

          it('should set dfsLocationServerError to the response data', function() {
            expect($scope.dfsLocationServerError).toEqual(serverResponse.data);
          });

          it('should not set the permissions key to true on dfsLocationServerError', function() {
            expect($scope.dfsLocationServerError.permissions).toBeUndefined();
          });

        });

      });

      describe('when the dfs location has not been changed', function() {
        
        beforeEach(function() {
          $scope.$apply();
        });

        it('should proceed to the next step', function() {
          $modal.openedDfd.resolve();
          $scope.$apply();
          $timeout.flush(1000);
          expect($scope.goToStep).toHaveBeenCalledWith('license');
        });

      });

    });

  });

});