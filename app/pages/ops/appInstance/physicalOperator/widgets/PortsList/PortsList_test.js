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

describe('Factory: PortsListWidgetDef', function () {

  // load the service's module
  beforeEach(module('app.pages.ops.appInstance.physicalOperator.widgets.PortsList'));

  // instantiate service
  var PortsListWidgetDef;
  beforeEach(inject(function (_PortsListWidgetDef_) {
    PortsListWidgetDef = _PortsListWidgetDef_;
  }));

  it('should be a function', function() {
    expect(typeof PortsListWidgetDef).toEqual('function');
  });

});

describe('Factory: PortsListWidgetDataModel', function () {

  // load the service's module
  beforeEach(module('app.pages.ops.appInstance.physicalOperator.widgets.PortsList', function($provide) {
    $provide.value('BaseDataModel', {
      extend: function(proto) {
        function Mock() {}
        Mock.prototype = proto;
        return Mock;
      }
    });
  }));

  // instantiate service
  var PortsListWidgetDataModel;
  beforeEach(inject(function (_PortsListWidgetDataModel_) {
    PortsListWidgetDataModel = _PortsListWidgetDataModel_;
  }));

  it('should be a function', function() {
    expect(typeof PortsListWidgetDataModel).toEqual('function');
  });

  it('should attach an init function', function() {
    var m = new PortsListWidgetDataModel();
    expect(typeof m.init).toEqual('function');
  });

  describe('the init function', function() {
    
    var m, scope;

    beforeEach(function() {
      m = new PortsListWidgetDataModel();
      m.widgetScope = scope = {
        physicalOperator: {
          data: {}
        }
      };
    });

    it('should set scope.physicalOperator.data.ports to an empty array if it is undefined', function() {
      m.init();
      expect(scope.physicalOperator.data.ports).toEqual([]);
    });

    it('should not change ports if it is already set', function() {
      var orig = scope.physicalOperator.data.ports = [{}, {}];
      m.init();
      expect(scope.physicalOperator.data.ports === orig).toEqual(true);
    });

    it('should add table_options, selected, and columns to the scope', function() {
      m.init();
      expect(typeof scope.table_options).toEqual('object');
      expect(scope.selected instanceof Array).toEqual(true);
      expect(scope.columns instanceof Array).toEqual(true);
    });

  });


});