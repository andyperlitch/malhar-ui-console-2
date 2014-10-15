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
      templateUrl: 'components/directives/queryEditor/queryEditor.html',
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

    scope.$watch('properties', function () {
      scope.updateModel();
    }, true);

    angular.extend(scope, {
      updateModel: function () {
        var keys = _.reduce(scope.properties, function (result, property) {
          var value;
          if (property.selKeyValue) {
            value = property.selKeyValue.value;
          } else {
            value = property.value;
          }
          if (!_.isNull(value) && !_.isUndefined(value) && !(_.isString(value) && _.isEmpty(value))) {
            result[property.key] = value;
          }
          return result;
        }, {});
        console.log(keys);

        var viewValue = scope.ngModel.$viewValue ? _.clone(scope.ngModel.$viewValue) : {};
        angular.extend(viewValue, {
          keys: keys
        });

        ngModel.$setViewValue(viewValue);
      },

      createProperty: function (key, value) {
        var keyValues = scope.dictionary[key];

        if (keyValues) {
          var selKeyValue = _.findWhere(keyValues, { value: value });
          return {
            key: key,
            selKeyValue: selKeyValue,
            keyValues: keyValues
          };
        } else {
          return {
            key: key,
            value: value
          };
        }
      },

      update: function (json) {
        if (!scope.options) {
          scope.properties = [];
          return;
        }

        var keys = {};
        if (json && json.keys) {
          keys = json.keys;
        } else {
          keys = {};
        }

        scope.properties = _.map(scope.options, function (key) {
          var value = _.has(keys, key) ? keys[key] : null;
          return this.createProperty(key, value);
        }.bind(this));
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
