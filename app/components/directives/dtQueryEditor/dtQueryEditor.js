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

        angular.extend(scope, {
          switchToDesignerMode: function () {
            scope.jsonMode = false;
            //scope.update(ngModel.$viewValue);
          },

          switchToJsonMode: function () {
            scope.jsonMode = true;
            scope.jsonText = JSON.stringify(ngModel.$viewValue, null, ' ');
          }
        });

        ngModel.$render = function () {
          scope.switchToDesignerMode();
        };
      }
    };
  })
  .controller('QueryEditorCtrl', function ($scope, clientSettings) {
    var ngModel = $scope.ngModel;
    var scope = $scope;

    scope.dictionary = clientSettings.kafka.dictionary; //TODO this should be directive attribute

    //scope.keyValues = null;
    scope.$watch('selOption', function () {
      if (scope.selOption) {
        scope.keyValues = scope.dictionary[scope.selOption];
      } else {
        scope.keyValues = null;
      }
      scope.selKeyValue = !_.isEmpty(scope.keyValues) ? scope.keyValues[0] : null;
    });

    scope.$watch('properties', function () {
      scope.updateModel();
    }, true);

    angular.extend(scope, {
      updateModel: function () {
        var keys = _.reduce(scope.properties, function (result, property) {
          if (property.selKeyValue) {
            result[property.key] = property.selKeyValue.value;
          } else {
            result[property.key] = property.value;
          }
          return result;
        }, {});

        var viewValue = scope.ngModel.$viewValue ? _.clone(scope.ngModel.$viewValue) : {};
        angular.extend(viewValue, {
          keys: keys
        });

        ngModel.$setViewValue(viewValue);
      },

      add: function () {
        if (!scope.selOption) {
          return;
        }

        var propertyIndex = _.findIndex(scope.properties, {key: scope.selOption});

        var newProperty;
        if (scope.keyValues && scope.selKeyValue) {
          newProperty = {
            key: scope.selOption,
            selKeyValue: scope.selKeyValue,
            keyValues: scope.keyValues
          };
        } else {
          newProperty = {
            key: scope.selOption,
            value: scope.selValue
          };
        }

        if (propertyIndex >= 0) {
          scope.properties[propertyIndex] = newProperty;
          //angular.extend(property, newProperty); //override
        } else {
          scope.properties.push(newProperty);
        }

        // reset
        scope.selOption = null;
        scope.selValue = null;
      },

      remove: function (property) {
        _.remove(scope.properties, property);
      },

      update: function (json) {
        if (!json || !json.keys) {
          return;
        }

        scope.properties = _.map(_.pairs(json.keys), function (pair) {
          var key = pair[0];
          var keyValues = scope.dictionary[key];
          if (keyValues) {
            var selKeyValue = _.findWhere(keyValues, { value: pair[1] });
            return {
              key: key,
              selKeyValue: selKeyValue,
              keyValues: keyValues
            };
          } else {
            return {
              key: key,
              value: pair[1]
            };
          }
        });
      }
    });

    scope.update(ngModel.$viewValue);
  })
  .controller('QueryEditorJsonCtrl', function ($scope) {
    $scope.valid = true;

    angular.extend($scope, {
      textChanged: function () {
        try {
          var json = JSON.parse($scope.jsonText);
          $scope.valid = true;
          $scope.ngModel.$setViewValue(json);
        } catch (e) {
          $scope.valid = false;
        }
      }
    });

  });
