/*
* Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
* awesome
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

/**
 * StramEventsWidget
 *
 * Shows stram events from application 
 */

// Module Definition
angular.module('app.pages.ops.appInstance.widgets.StramEvents', [
  'app.components.services.dtText',
  'app.components.filters.relativeTimestamp',
  'app.components.resources.StramEventCollection',
  'app.components.directives.dtContainerShorthand',
  'app.components.directives.uiResizable',
  'app.components.widgets.Base',
  'app.settings',
  'ui.bootstrap'
])
.controller('StramEventListCtrl', function($scope, dtText) {

  $scope.getEventClasses = function(evt) {
    var classes = ['event-item'];
    classes.push('event-' + evt.type.toLowerCase());
    if (evt.selected) {
      classes.push('selected');
    }
    return classes;
  };

  $scope.onEventClick = function($event, event) {
    var shift = $event.shiftKey;
    
    if (!shift) {
      var wasSelected = event.selected;
      _.each($scope.resource.data, function(e) {
        e.selected = false;
        e.selected_anchor = false;
      });

      event.selected = true;
      event.selected_anchor = true;

      if (!wasSelected) {
        
      }
      else {
        event.selected = false;
      }
    }

    else {

      var selecting = false;

      for (var i = 0; i < $scope.resource.data.length; i++) {
        var e = $scope.resource.data[i];

        // Selecting in the loop
        if (selecting) {
          e.selected = true;
          if (e === event || e.selected_anchor) {
            selecting = false;
          }
        }

        // Have not found start selection
        else {
          if (e.selected_anchor || e === event) {
            selecting = true;
            e.selected = true;
          } else {
            e.selected = false;
          }
        }

      }

    }
  };

  $scope.onEventListKey = function($event) {

    var which = $event.which;

    if (which !== 38 && which !== 40) {
      return;
    }

    var curIndices = _.map($scope.resource.data, function(evt, i) {
      if (evt.selected) {
        return i;
      }
      return false;
    });
    curIndices = _.filter(curIndices, function(i) {
      return i !== false;
    });

    // Up
    if (which === 38) {
      
    }
    // Down
    if (which === 40) {

    }
  };

  $scope.getEventRange = function(startDate, endDate, offset, limit) {
    if (startDate >= endDate) {
      $scope.rangeError = dtText.get('The end date must be after start date.');
      $scope.$digest();
      return;
    }

    if (typeof offset === 'undefined') {
      offset = 0;
    }

    if (typeof limit === 'undefined') {
      limit = 100;
    }

    $scope.rangeError = dtText.get('Fetching events...');
    $scope.resource.data = [];
    $scope.resource.fetch({
      params: {
        from: startDate.valueOf(),
        to: endDate.valueOf(),
        offset: offset,
        limit: limit
      }
    })
    .then(
      function(data) {
        if (data.length) {
          $scope.rangeError = false;
        }
        else {
          $scope.rangeError = dtText.get('No events found for the specified time range');
        }
      },
      function() {
        $scope.rangeError = dtText.get('An error occurred retrieving stram events!');
      }
    );
  };

  $scope.resizableOptions = {
    handles: 'n, s'
  };

})
.run(function($templateCache) {
  $templateCache.put('template/timepicker/timepicker.html',
    '<table>\n' +
    ' <tbody>\n' +
    '   <tr class="text-center">\n' +
    '     <td><a ng-click="incrementHours()" class="btn btn-link btn-sm"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n' +
    '     <td>&nbsp;</td>\n' +
    '     <td><a ng-click="incrementMinutes()" class="btn btn-link btn-sm"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n' +
    '     <td ng-show="showMeridian"></td>\n' +
    '   </tr>\n' +
    '   <tr>\n' +
    '     <td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidHours}">\n' +
    '       <input type="text" dt-text-tooltip="Use your mousewheel to easily change this value." tooltip-placement="left" ng-model="hours" ng-change="updateHours()" class="form-control text-center input-sm" ng-mousewheel="incrementHours()" ng-readonly="readonlyInput" maxlength="2">\n' +
    '     </td>\n' +
    '     <td>:</td>\n' +
    '     <td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidMinutes}">\n' +
    '       <input type="text" dt-text-tooltip="Use your mousewheel to easily change this value." tooltip-placement="right" ng-model="minutes" ng-change="updateMinutes()" class="form-control text-center input-sm" ng-readonly="readonlyInput" maxlength="2">\n' +
    '     </td>\n' +
    '     <td ng-show="showMeridian"><button type="button" class="btn btn-info text-center btn-sm" ng-click="toggleMeridian()">{{meridian}}</button></td>\n' +
    '   </tr>\n' +
    '   <tr class="text-center">\n' +
    '     <td><a ng-click="decrementHours()" class="btn btn-link btn-sm"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n' +
    '     <td>&nbsp;</td>\n' +
    '     <td><a ng-click="decrementMinutes()" class="btn btn-link btn-sm"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n' +
    '     <td ng-show="showMeridian"></td>\n' +
    '   </tr>\n' +
    ' </tbody>\n' +
    '</table>\n' +
    '');
})
.directive('stramEventList', function() {
  return {
    templateUrl: 'pages/ops/appInstance/widgets/StramEvents/stramEventList.html',
    controller: 'StramEventListCtrl',
    restrict: 'E',
    scope: {
      resource: '=',
      state: '=',
      appId: '=',
      onResizeCallback: '&onResize',
      listHeight: '='
    },
    link: function(scope, element) {
      scope.followEvents = true;

      // Sets up auto-follow incoming events
      var eventList = element.find('.event-list');
      scope.$watchCollection('resource.data', function() {
        if (scope.mode === 'tail' && scope.followEvents) {
          // stop any animation
          eventList.stop();
          // scroll to bottom
          eventList.animate({
            scrollTop: eventList[0].scrollHeight + 100
          }, 'slow');
        }
      });

      // Set up listener for resize
      scope.onResize = function(event, ui) {
        scope.onResizeCallback({event: event, ui: ui});
      }

      // Some setup for range selection
      scope.hstep = 1;
      scope.mstep = 1;
      scope.ismeridian = true;

      // Listen for changes to the mode
      scope.$watch('state.mode', function(mode) {
        
        // clear the data
        scope.resource.data = [];

        if (mode === 'tail') {
          // subscribe to updates
          scope.resource.subscribe(scope);

          // get the last n events
          scope.resource.fetch({
            params: {
              limit: scope.state.tail.limit
            }
          });
        } else if (mode === 'range') {
          // unsubscribe to events
          scope.resource.unsubscribe();
          scope.getEventRange(scope.state.range.from, scope.state.range.to);
        }
        
      });
    }
  };
})

// Widget Data Model
.factory('StramEventsWidgetDataModel', function(BaseDataModel, StramEventCollection, settings) {
  var StramEventsWidgetDataModel = BaseDataModel.extend({

    init: function() {
      var scope = this.widgetScope;
      var self = this;
      scope.widget.dataModelOptions = scope.widget.dataModelOptions || {};

      this.resource = new StramEventCollection({ appId: scope.appId });
      scope.resource = this.resource;
      scope.state = {
        mode: 'tail',
        range: {
          from: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          to: new Date(Date.now())
        },
        tail: {
          limit: settings.stramEvents.INITIAL_LIMIT
        }
      };
      scope.onResize = function(event, ui) {
        scope.widget.dataModelOptions.listHeight = ui.size.height;
        scope.$emit('widgetChanged', scope.widget);
      }
    },

    destroy: function() {
      this.resource.unsubscribe();
    }

  });
  return StramEventsWidgetDataModel;
})

// Widget Definition
.factory('StramEventsWidgetDef', function(BaseWidget, StramEventsWidgetDataModel) {
  var StramEventsWidgetDef = BaseWidget.extend({
    defaults: {
      dataModelType: StramEventsWidgetDataModel,
      title: 'StramEvents',
      templateUrl: 'pages/ops/appInstance/widgets/StramEvents/StramEvents.html',
      // directive: 'name-of-directive'
    }
  });

  return StramEventsWidgetDef;
});