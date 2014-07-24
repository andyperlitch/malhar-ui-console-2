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
  'underscore',
  'app.components.filters.relativeTimestamp',
  'app.components.resources.StramEventCollection',
  'app.components.directives.dtContainerShorthand',
  'app.components.widgets.Base',
  'app.settings'
])
.controller('StramEventListCtrl', function($scope) {

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
      _.each($scope.data, function(e) {
        e.selected = false;
        e.selected_anchor = false;
      });

      event.selected = true;
      event.selected_anchor = true;
    }

    else {

      var selecting = false;

      for (var i = 0; i < $scope.data.length; i++) {
        var e = $scope.data[i];

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

    var curIndices = _.map($scope.data, function(evt, i) {
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
})
.directive('stramEventList', function() {
  return {
    templateUrl: 'pages/ops/appInstance/widgets/StramEvents/stramEventList.html',
    controller: 'StramEventListCtrl',
    restrict: 'E',
    scope: {
      data: '=',
      state: '='
    },
    link: function(scope, element) {
      scope.followEvents = true;

      var eventList = element.find('.event-list');
      scope.$watchCollection('data', function() {
        if (scope.followEvents) {
          // stop any animation
          eventList.stop();
          // scroll to bottom
          eventList.animate({
            scrollTop: eventList[0].scrollHeight + 100
          }, 'slow');
        }
      });
    }
  };
})

// Widget Data Model
.factory('StramEventsWidgetDataModel', function(_, BaseDataModel, StramEventCollection, settings) {
  var StramEventsWidgetDataModel = BaseDataModel.extend({

    init: function() {
      var resource, scope = this.widgetScope;
      resource = this.resource = new StramEventCollection({ appId: this.widgetScope.appId });
      resource.fetch({
        params: {
          limit: settings.stramEvents.INITIAL_LIMIT
        }
      });

      resource.subscribe(scope);

      scope.data = resource.data;

      scope.state = {
        mode: 'tail'
      };
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