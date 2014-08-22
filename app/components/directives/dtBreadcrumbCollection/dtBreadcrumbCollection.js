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

angular.module('app.components.directives.dtBreadcrumbCollection', [
  'app.components.directives.dtText'
])
.directive('dtBreadcrumbCollection', function($injector, $timeout) {
  return {
    scope: {
      collection: '=dtBreadcrumbCollection',
      routeParams: '='
    },
    templateUrl: 'components/directives/dtBreadcrumbCollection/dtBreadcrumbCollection.html',
    link: function(scope, element) {
      var Resource = $injector.get(scope.collection.resource);
      var resourceParams = _.pick(scope.routeParams, scope.collection.resourceParams);
      scope.resource = new Resource(resourceParams);
      scope.search = {
        limit:10
      };

      // Set scope methods
      scope.incrementLimit = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        scope.search.limit += 10;
      };

      // Set click listener
      element.find('.btn-group').on('show.bs.dropdown', function() {
        scope.resource.fetch().then(function() {
          $timeout(function() {
            element.find('.search-form input').focus();
          }, 100);
        });
        scope.search = {
          limit:10
        };
      });
      element.find('.search-form input').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
      });
    }
  };
});