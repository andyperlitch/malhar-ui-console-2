'use strict';

angular.module('dtConsoleApp')
  .directive('dtOverview', ['$filter', '$sce', function ($filter, $sce) {

      function link(scope, elm, attrs) {

        /**
         * Generates proper label
         * @param  {object} field definition object
         * @return {String}       label to be displayed
         */
        scope.printLabel = function(field) {
          return field.label || field.key;
        }

        /**
         * Generates display value
         * @param  {object} field definition object
         * @param  {object} data  data to be displayed
         * @return {String}       value to put in item
         */
        scope.printValue = function(field, data) {

          // Get the raw value for this item
          var raw = data[field.key];
          var computed = raw;

          // Check for specified filter
          if (field.filter) {

            // Start building args to pass to filter function
            var args = [raw];
            if (field.filterArgs) {
              args = args.concat(field.filterArgs);
            }
            computed = $filter(field.filter).apply({}, args);

          }

          // Check if value is a formatting function
          else if (typeof field.value === 'function') {
            computed = field.value(raw, scope.data);
          }

          // Otherwise just return the raw
          return field.trustAsHtml ? $sce.trustAsHtml(computed) : computed;
        }

      }

      return {
        restrict: 'A',
        templateUrl: 'scripts/directives/dt-overview.tpl.html',
        scope: {
          'fields': '=',
          'data': '='
        },
        link: link
      };
    }]);
