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

describe('Factory: setupBreadcrumbs', function () {

  var breadcrumbs, $routeParams;

  // load the service's module
  beforeEach(module('app.components.services.setupBreadcrumbs', function($provide) {
    $provide.constant('settings', {
      breadcrumbs: {
        crumb1: 'my crumb :crumbId',
        crumb2: 'another :crumbId :subcrumbId',
        crumb3: ':subsubcrumbId'
      }
    });
  }));

  // instantiate service
  var setupBreadcrumbs;
  beforeEach(inject(function (_setupBreadcrumbs_) {
    setupBreadcrumbs = _setupBreadcrumbs_;
    breadcrumbs = { options: {} };
    $routeParams = {
      crumbId: '1', 
      subcrumbId: '2',
      subsubcrumbId: '3'
    };
  }));

  it('should be a function', function() {
    expect(typeof setupBreadcrumbs).toEqual('function');
  });

  it('should set breadcrumbs.options to the appropriate interpolated strings', function() {
    setupBreadcrumbs(breadcrumbs, $routeParams);
    expect(breadcrumbs.options.crumb1).toEqual('my crumb 1');
    expect(breadcrumbs.options.crumb2).toEqual('another 1 2');
    expect(breadcrumbs.options.crumb3).toEqual('3');
  });

});