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

angular.module('app.pages.dev.kafka.widgets.textContent', [])
  .directive('wtTextContent', function () {
    return {
      restrict: 'A',
      replace: true,
      scope1: {
        text: '='
      },
      templateUrl: 'pages/dev/kafka/widgets/text/text.html'
    };
  })
  .filter('textContent', function() {
    return function (input) {
      var text;
      if (input && input.lines && _.isArray(input.lines)) {
        text = input.lines.join('\n');
      } else {
        text = input;
      }
      return text;
    };
  });