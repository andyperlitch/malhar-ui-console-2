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

describe('Directive: recordingBrowser', function () {

  var element, scope, q, rootScope, isoScope, compile, RecordingModel, tupleDfd, recording, timeout;

  beforeEach(function() {
    // define mock objects here
  });

  beforeEach(module('templates-main'));

  // load the directive's module
  beforeEach(module('app.components.directives.recordingBrowser', function($provide) {
    // Inject dependencies like this:
    $provide.value('webSocket', {});
    $provide.value('RecordingModel', RecordingModel = function() {
      recording = this;
      this.data = {
        ports: [
          { type: 'input', name: 'inputport' },
          { type: 'output', name: 'outputport' }
        ]
      };
    });
    RecordingModel.prototype.getTuples = jasmine.createSpy('getTuples').and.callFake(function() {
      tupleDfd = q.defer();
      return tupleDfd.promise;
    });
  }));

  beforeEach(inject(function ($compile, $rootScope, RecordingModel, $q, $timeout) {
    // Cache these for reuse    
    rootScope = $rootScope;
    compile = $compile;
    q = $q;
    timeout = $timeout;

    // Other setup, e.g. helper functions, etc.
    tupleDfd = q.defer();

    // Set up the outer scope
    scope = $rootScope.$new();
    scope.recording = new RecordingModel();

    // Define and compile the element
    element = angular.element('<div recording-browser="recording"></div>');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  it('should add a listOptions object to the isolate scope', function() {
    expect(angular.isObject(isoScope.listOptions)).toEqual(true);
  });

  it('should add a scopeAdditions object with a recording key and an onTupleClick function', function() {
    expect(angular.isObject(isoScope.scopeAdditions)).toEqual(true);
    expect(typeof isoScope.scopeAdditions.onTupleClick).toEqual('function');
    expect(isoScope.scopeAdditions.recording === scope.recording).toEqual(true);
  });

  it('should add an empty selectedTuples array', function() {
    expect(isoScope.selectedTuples).toEqual([]);
  });

  it('should call getTuples on initialization', function() {
    expect(recording.getTuples).toHaveBeenCalled();
  });

  it('should have three functions for two-way-infinte-scroll: init, prependTuples, and appendTuples', function() {
    expect(typeof isoScope.init).toEqual('function');
    expect(typeof isoScope.prependTuples).toEqual('function');
    expect(typeof isoScope.appendTuples).toEqual('function');
  });

  describe('the tuple click handler', function() {

    var $event, tuple, tuples, trigger, other;
    
    beforeEach(function() {
      $event = {
        preventDefault: jasmine.createSpy('preventDefault')
      };
      tuple = {};
      other = { selected: true };
      tuples = [{},{},other, tuple];
      trigger = function() {
        isoScope.scopeAdditions.onTupleClick($event, tuple, tuples);
      };
    });

    describe('when shift is not being pressed', function() {
      
      describe('and the tuple is not selected', function() {

        beforeEach(function() {
          trigger();
        });

        it('should prevent the default action on the event', function() {
          expect($event.preventDefault).toHaveBeenCalled();
        });

        it('should set selected to true on the tuple', function() {
          expect(tuple.selected).toEqual(true);
        });

        it('should set the selectedTuples to just the tuple clicked', function() {
          expect(isoScope.selectedTuples.length).toEqual(1);
          expect(isoScope.selectedTuples[0]).toEqual(tuple);
        });
        
      });

      describe('and the tuple is selected', function() {
        
        beforeEach(function() {
          tuple.selected = true;
          trigger();
        });

        it('should keep it selected', function() {
          expect(tuple.selected).toEqual(true);
        });

        it('should deselect other selected tuples', function() {
          expect(isoScope.selectedTuples.length).toEqual(1);
          expect(isoScope.selectedTuples[0]).toEqual(tuple);
        });

      });

    });

    describe('when shift is being pressed', function() {
      
      beforeEach(function() {
        $event.shiftKey = true;
      });

      describe('and the tuple is not selected', function() {
        
        beforeEach(function() {
          trigger();
        });

        it('should select the tuple', function() {
          expect(tuple.selected).toEqual(true);
        });

        it('should deselect other tuples', function() {
          expect(other.selected).toEqual(true);
        });

        it('should update the selectedTuples', function() {
          expect(isoScope.selectedTuples.length).toEqual(2);
          expect(isoScope.selectedTuples).toContain(tuple);
          expect(isoScope.selectedTuples).toContain(other);
        });

      });

      describe('and the tuple is selected', function() {
        
        beforeEach(function() {
          tuple.selected = true;
          trigger();
        });

        it('should deselect the tuple', function() {
          expect(tuple.selected).toBeFalsy();
        });

        it('should keep the other tuple selected', function() {
          expect(other.selected).toEqual(true);
        });

        it('should update selectedTuples', function() {
          expect(isoScope.selectedTuples).toEqual([other]);
        });

      });

    });

  });

  describe('the keydown handler', function() {
    
    var trigger, $event, items;

    beforeEach(function() {
      items = [
        {selected: true},
        {},
        {selected: true},
        {selected: true}
      ];
      $event = {
        preventDefault: jasmine.createSpy('preventDefault')
      };
      isoScope.listOptions.getItems = jasmine.createSpy('getItems').and.callFake(function() {
        return items;
      });
      trigger = function() {
        isoScope.onKeydown($event);
      };
    });

    describe('when the key is up', function() {
      
      beforeEach(function() {
        $event.which = 38;
        trigger();
      });

      it('should select the previous models', function() {
        expect(items[0].selected).toBeFalsy();
        expect(items[1].selected).toBeTruthy();
        expect(items[2].selected).toBeTruthy();
        expect(items[3].selected).toBeFalsy();
      });

      it('should update selectedTuples', function() {
        expect(isoScope.selectedTuples).toContain(items[1]);
        expect(isoScope.selectedTuples).toContain(items[2]);
      });

    });

    describe('when the key is down', function() {
      
      beforeEach(function() {
        $event.which = 40;
        trigger();
      });

      it('should select the previous models', function() {
        expect(items[0].selected).toBeFalsy();
        expect(items[1].selected).toBeTruthy();
        expect(items[2].selected).toBeFalsy();
        expect(items[3].selected).toBeTruthy();
      });

      it('should update selectedTuples', function() {
        expect(isoScope.selectedTuples).toContain(items[1]);
        expect(isoScope.selectedTuples).toContain(items[3]);
      });

    });

    describe('when the key is neither up nor down', function() {
      
      beforeEach(function() {
        trigger();
      });

      it('should do nothing', function() {
        expect(items[0].selected).toBeTruthy();
        expect(items[1].selected).toBeFalsy();
        expect(items[2].selected).toBeTruthy();
        expect(items[3].selected).toBeTruthy();
      });

    });

  });

  describe('the init function', function() {
    
    describe('when the tuples come back from getTuples', function() {
      
      beforeEach(function() {
        tupleDfd.resolve([
          {},{},{},{},{},{}
        ]);
        isoScope.$apply();
      });

      it('should add the rows to the list', function() {
        expect(element.find('.tuple-list .tuple-row').length).toEqual(6);
      });

    });

  });

  describe('the append function', function() {
    
    var appendDfd;

    beforeEach(function() {
      appendDfd = q.defer();
      spyOn(appendDfd, 'resolve').and.callThrough();
      recording.getTuples.calls.reset();
    });

    describe('before the init function has finished', function() {
      
      it('should immediately resolve the deferred with nothing', function() {
        isoScope.appendTuples(appendDfd);
        isoScope.$apply();
        expect(appendDfd.resolve).toHaveBeenCalledWith();
      });

      it('should not call getTuples', function() {
        expect(recording.getTuples).not.toHaveBeenCalled();
      });

    });

    describe('after the init function has finished', function() {

      beforeEach(function() {
        tupleDfd.resolve([
          {},{},{},{},{},{}
        ]);
        isoScope.$apply();
        isoScope.appendTuples(appendDfd);
      });

      it('should call getTuples with two number strings and an array of port names', function() {
        expect(recording.getTuples).toHaveBeenCalled();
        var args = recording.getTuples.calls.argsFor(0);
        expect(typeof args[0]).toEqual('string');
        expect(typeof args[1]).toEqual('string');
        expect(args[2]).toContain('0');
        expect(args[2]).toContain('1');
      });

      describe('when the getTuples deferred resolves', function() {
        
        var results;

        beforeEach(function() {
          tupleDfd.resolve(results = [{},{},{}]);
          isoScope.$apply();
        });

        it('should resolve the appendDfd with the results', function() {
          expect(appendDfd.resolve).toHaveBeenCalledWith(results);
        });


      });

    });

  });

});