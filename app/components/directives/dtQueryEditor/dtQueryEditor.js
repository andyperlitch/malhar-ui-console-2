/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
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

angular.module('app.components.directives.dtQueryEditor', [])
  .directive('dtQueryEditor', function () {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'components/directives/dtQueryEditor/dtQueryEditor.html',
      require: 'ngModel',
      scope: {
        options: '='
      },
      link: function (scope, element, attrs, ngModel) {
        scope.ngModel = ngModel;
        scope.jsonMode = false;
        console.log('_link');
        console.log(attrs);

        //scope.selOption = null;
        //scope.options = ['op1', 'op2', 'op3'];
        //scope.selOption = scope.options[0];
        scope.selOption = null;
        scope.selValue = null;


        scope.$watch('properties', function () {
          scope.updateModel();
        }, true);

        angular.extend(scope, {
          switchToDesignerMode: function () {
            scope.update(ngModel.$viewValue);
          },

          switchToJsonMode: function () {
            scope.jsonText = JSON.stringify(ngModel.$viewValue, null, ' ');
          },

          updateModel: function () {
            var json = {
              keys: _.reduce(scope.properties, function (result, property) {
                result[property.key] = property.value;
                return result;
              }, {})
            };
            ngModel.$setViewValue(json);
          },

          add: function (value) {
            if (!scope.selOption) {
              return;
            }

            var property = _.findWhere(scope.properties, {key: scope.selOption});

            var newProperty = {
              key: scope.selOption,
              value: value
            };

            if (property) {
              angular.extend(property, newProperty); //override
            } else {
              scope.properties.push(newProperty);
            }
          },

          onChange: function (value) {
            scope.selOption = value; //TODO
          },

          apply: function () {
            console.log(scope.properties);
          },

          remove: function (property) {
            _.remove(scope.properties, property);
          },

          update: function (json) {
            scope.properties = _.map(_.pairs(json.keys), function (pair) {
              return {
                key: pair[0],
                value: pair[1]
              };
            });
          }
        });

        ngModel.$render = function() {
          scope.switchToDesignerMode();
        };
      }
    };
  });
