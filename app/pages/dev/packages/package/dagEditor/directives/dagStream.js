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

angular.module('app.pages.dev.packages.package.dagEditor.directives.dagStream', [
  'app.settings'
])
.directive('dagStream', function($log, settings, $jsPlumb) {
  return {
    link: function(scope) {

      // Add dag-stream class
      scope.connection.addClass('dag-stream');

      var overlay = scope.connection.getOverlay('streamLabel');
      var streamDel = scope.connection.getOverlay('streamDel');

      // First check for existing
      if (!overlay) {
        // Set the stream label and add delete control
        scope.connection.addOverlay(['Label', {
          label: scope.stream.name,
          id: 'streamLabel',
          cssClass: 'stream-label'
        }]);
        scope.connection.addOverlay(['Custom', {
          create: function() { return $('<button><span>&times;</span></button>'); },
          location: 0.5,
          id: 'streamDel',
          cssClass: 'stream-del close'
        }]);
        scope.connection.hideOverlay('streamDel');
        overlay = scope.connection.getOverlay('streamLabel');
        streamDel = scope.connection.getOverlay('streamDel');
      }

      // Watch for mouse events on streams to show/hide the stream delete control
      scope.connection.bind('mouseenter', function(conn) {
        conn.showOverlay('streamDel');
      });
      scope.connection.bind('mouseleave', function(conn) {
        conn.hideOverlay('streamDel');
      });

      // listener for stream delete control
      streamDel.bind('click', function(overlay) {
        $jsPlumb.detach(overlay.component);
      });

      // Update label as needed
      scope.$watch('stream.name', function(name) {
        if (name) {
          overlay.setLabel(name);
        }
      });

      // Update cssClass as locality changes
      scope.$watch('stream.locality', function(locality) {
        scope.connection.removeClass(settings.STREAM_LOCALITIES.join(' '));
        if (locality) {
          scope.connection.addClass(locality);
        }
      });

      // Watch to see if the selected stream is this one
      scope.$watch('selected', function(selected) {
        if (selected === scope.stream) {
          overlay.addClass('selected');
          scope.connection.addClass('selected');
        }
        else {
          overlay.removeClass('selected');
          scope.connection.removeClass('selected');
        }
      });

      // Listen for clicks on the connection
      scope.connection.bind('click', function(conn, event) {
        event.stopPropagation();
        scope.$emit('selectEntity', 'stream', scope.stream);
      });

      // Listen for double clicks on label, focus on name field in
      // inspector.
      overlay.bind('dblclick', function() {
        var $el = $('form[name="dag_stream_inspector"] input[name="name"]');
        var el = $el[0];
        if ($el) {
          $el.parent().effect('bounce', {}, 'slow');
          $el.focus();
          el.setSelectionRange(0, 9999);
        }
      });

      scope.$on('connectionDetached', function(event, connection) {
        if (connection === scope.connection) {

          // Remove all listeners
          connection.unbind();
          overlay.unbind();

          // Check if sink is there
          var index;
          var sink = _.find(scope.stream.sinks, function(s, i) {
            index = i;
            return s.connection_id === connection.id;
          });

          // If so, remove it
          if (sink) {
            scope.stream.sinks.splice(index, 1);
          }

          // If this was the only sink, remove the stream
          if (scope.stream.sinks.length === 0) {
            $log.info('Stream removed from app: ', scope.stream);
            var streamIndex = scope.app.streams.indexOf(scope.stream);
            if (streamIndex > -1) {
              scope.app.streams.splice(streamIndex, 1);
              scope.$emit('selectEntity'); // deselect all
            } else {
              $log.warn('Stream expected to be in app.streams, but was not found! app.streams: ', scope.app.streams, 'stream: ', scope.stream);
            }
          }
          scope.stream = null;

          // Defer destruction of this scope
          _.defer(function() {
            scope.$destroy();
          });
        }
      });

      // listen for remove events broadcast from the parent scope
      scope.$on('remove', function(e, data) {
        if (data.selected === scope.stream) {
          // broadcasted "remove" message was for this instance, so remove
          $jsPlumb.detach(scope.connection);
        }
      });
    }
  };
});
