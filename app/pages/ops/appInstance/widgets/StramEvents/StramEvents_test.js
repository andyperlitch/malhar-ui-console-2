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

describe('Module: StramEvents', function() {
  
  var settings, MockStramEventCollection;

  beforeEach(function() {
    function Mock() {}
    Mock.prototype.fetch = function() {

    };
    Mock.prototype.subscribe = function() {

    };
    MockStramEventCollection = Mock;
  });

  // load the service's module
  beforeEach(module('app.pages.ops.appInstance.widgets.StramEvents', function($provide) {
    $provide.constant('settings', settings = {
      stramEvents: { INITIAL_LIMIT: 30 }
    });
    $provide.value('webSocket', {});
    $provide.value('StramEventCollection', MockStramEventCollection);
  }));


  describe('Factory: StramEventsWidgetDataModel', function () {

    // instantiate service
    var StramEventsWidgetDataModel;
    beforeEach(inject(function (_StramEventsWidgetDataModel_) {
      StramEventsWidgetDataModel = _StramEventsWidgetDataModel_;
    }));

    var dm, scope;

    beforeEach(inject(function($rootScope) {
      dm = new StramEventsWidgetDataModel();
      dm.widgetScope = scope = $rootScope.$new();
    }));

    it('should be a function', function() {
      expect(typeof StramEventsWidgetDataModel).toEqual('function');
    });

    describe('the init method', function() {

      it('should create a new StramEventCollection', function() {
        dm.init();
        expect(dm.resource instanceof MockStramEventCollection).toEqual(true);
      });

      it('should call fetch on the resource', function() {
        spyOn(MockStramEventCollection.prototype, 'fetch');
        dm.init();
        expect(dm.resource.fetch).toHaveBeenCalled();
      });

      it('should call resource.fetch with the default limit', function() {
        spyOn(MockStramEventCollection.prototype, 'fetch');
        dm.init();
        expect(dm.resource.fetch).toHaveBeenCalledWith({
          params: {
            limit: settings.stramEvents.INITIAL_LIMIT
          }
        });
      });

      it('should call subscribe with the widget scope', function() {
        spyOn(MockStramEventCollection.prototype, 'subscribe');
        dm.init();
        expect(dm.resource.subscribe).toHaveBeenCalledWith(scope);
      });

      it('should set scope.data to resource.data', function() {
        dm.init();
        expect(scope.data).toEqual(dm.resource.data);
      });

    });

  });

  describe('Controller: StramEventListCtrl', function() {

    var $scope;

    beforeEach(inject(function($rootScope, $controller){
      $scope = $rootScope.$new();
      $controller('StramEventListCtrl', {
        $scope: $scope,
        $element: []
      });
    }));

    describe('the getEventClasses method', function() {

      var result;

      beforeEach(function() {
        result = $scope.getEventClasses({ type: 'ExampleEvent' });
      });

      it('should return an array', function() {
        expect(result instanceof Array).toEqual(true);
      });

      it('should contain "event-item" as a class', function() {
        expect(result).toContain('event-item');
      });

      it('should contain event-exampleevent (in this case)', function() {
        expect(result).toContain('event-exampleevent');
      });

      it('should not have the class "selected" unless evt.selected == true', function() {
        expect(result).not.toContain('selected');
        result = $scope.getEventClasses({ type: 'ExampleEvent', selected: true });
        expect(result).toContain('selected');
      });

    });

    describe('the onEventClick method', function() {
      
      beforeEach(function() {

      });

      describe('when shift is off', function() {
        
        it('should deselect all other rows of resource.data', function() {
          
        });

        it('should clear rows where row.selected_anchor == true', function() {
          
        });

        it('should make event.selected = true', function() {
          
        });

        it('should make event.selected_anchor = true', function() {
            
        });

        it('should stay selected even if it is already selected', function() {
          
        });

      });

      describe('when shift is on', function() {
        
        it('should select all rows between the one selected and the selected_anchor, if it is there', function() {
          
        });

        it('should select just the one event if there is no selected_anchor', function() {
          
        });

      });

    });

  });

});