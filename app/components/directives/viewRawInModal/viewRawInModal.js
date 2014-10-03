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

angular.module('app.components.directives.viewRawInModal', [
  'app.components.directives.dtText',
  'ui.bootstrap.modal'
])
.directive('viewRawInModal', function($modal) {
  
  /**
   * @ngdoc directive
   * @name app.components.directives.directive:viewRawInModal
   * @restrict A
   * @description Opens a modal with a <pre> tag that contains the provided content.
   * @element Any element works
   * @example 
   * <button view-raw-in-modal="objectOrString" modal-title="Title for the Modal" modal-size="lg">view details</button>
  **/
      
  return {
    link: function(scope, element, attrs) {
      var clickHandler = function(e) {
        e.preventDefault();
        var options = {
          templateUrl: 'components/directives/viewRawInModal/viewRawInModal.html',
          resolve: {
            title: function() {
              return attrs.modalTitle;
            },
            raw: function() {
              return scope.$eval(attrs.viewRawInModal);
            }
          },
          controller: function($scope, title, raw) {
            $scope.title = title;
            $scope.raw = raw;
            $scope.isJSON = typeof raw === 'object';
          }
        };

        if (attrs.modalSize) {
          options.size = attrs.modalSize;
        }

        $modal.open(options);
      };

      element.on('click', clickHandler);

      scope.$on('$destroy', function() {
        element.off('click', clickHandler);
      });
    }
  };
});