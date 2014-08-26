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

/* global describe, before, beforeEach, after, afterEach, inject, it, expect, module, spyOn */

'use strict';

describe('Service: defaultSettingsModalOptions', function () {

  // load the service's module
  beforeEach(module('app.components.services.defaultWidgetSettings'));

  // instantiate service
  var defaultSettingsModalOptions;
  beforeEach(inject(function (_defaultSettingsModalOptions_) {
    defaultSettingsModalOptions = _defaultSettingsModalOptions_;
  }));

  it('should be an object containing a templateUrl', function() {
    expect(typeof defaultSettingsModalOptions.templateUrl).toEqual('string');
  });

});

describe('Factory: defaultOnSettingsClose', function () {

  // load the service's module
  beforeEach(module('app.components.services.defaultWidgetSettings'));

  // instantiate service
  var defaultOnSettingsClose;
  beforeEach(inject(function (_defaultOnSettingsClose_) {
    defaultOnSettingsClose = _defaultOnSettingsClose_;
  }));

  it('should be a function', function() {
    expect(typeof defaultOnSettingsClose).toEqual('function');
  });

  it('should call widget.setWidth with result.width', function() {
    var result = { size: { width: '40em' } };
    var widget = {
      setWidth: function() {},
      setHeight: function() {},
      setStyle: function() {}
    };
    spyOn(widget, 'setWidth');
    defaultOnSettingsClose(result, widget);
    expect(widget.setWidth).toHaveBeenCalledWith('40em');
  });

  /*
  it('should update other properties of widget as expected', function() {
    var result = {
      title: 'my new name',
      size: { width: '40em' },
      dataModelOptions: {
        a: true
      }
    };
    var widget = {
      title: 'my old name',
      size: { width: '100px' },
      dataModelOptions: {
        a: false
      },
      setWidth: function() {}
    };
    defaultOnSettingsClose(result, widget);
    expect(widget.title).toEqual('my new name');
    expect(widget.dataModelOptions.a).toEqual(true);
  });
  */

  it('should delete style.width and widthUnits from result before extending widget', function() {
    var result = {
      title: 'my new name',
      size: { width: '40em' },
      dataModelOptions: {
        a: true
      },
      widthUnits: '%'
    };
    var widget = {
      title: 'my old name',
      size: { width: '100px' },
      dataModelOptions: {
        a: false
      },
      setWidth: function () {
        this.widthUnits = 'px';
      },
      setHeight: function () {
      },
      setStyle: function () {
      }
    };
    defaultOnSettingsClose(result, widget);
    expect(widget.widthUnits).toEqual('px');
  });

});

// describe('Controller: DefaultWidgetSettingsCtrl', function() {

//     var $scope, widget;
    
//     beforeEach(module('app.components.services.defaultWidgetSettings'));

//     beforeEach(inject(function($rootScope, $controller){
//         $scope = $rootScope.$new();
//         widget = {};
//         $controller('DefaultWidgetSettingsCtrl', {
//           $scope: $scope,
//           widget: widget
//         });
//     }));

// });