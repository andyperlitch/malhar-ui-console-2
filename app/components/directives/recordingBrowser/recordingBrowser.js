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

angular.module('app.components.directives.recordingBrowser', [
  'app.components.directives.twoWayInfiniteScroll',
  'app.components.filters.relativeTimestamp',
  'app.components.filters.commaGroups',
  'jsbn.BigInteger',
  'app.components.services.delayedBroadcast',
  'app.components.directives.focusOn'
])
    /**
      * @ngdoc directive
      * @name app.components.directives.recordingBrowser
      * @restrict A
      * @description UI Component for navigating a tuple recording.
      * @param {RecordingModel} recording The recording to browse
      * @param {Boolean}        sample    If true, treats the recording as a sample, meaning it will hide some additional controls. 
      * @element div
    **/

.directive('recordingBrowser', function(BigInteger, $q, $log, $timeout, delayedBroadcast) {

  // Extracts names of enabled ports into a new array
  function makeSelectedPortsArray(ports) {
    var enabled = [];
    for (var k in ports) {
      if (ports.hasOwnProperty(k) && ports[k].enabled) {
        enabled.push(k);
      }
    }
    return enabled;
  }

  return {
    templateUrl: 'components/directives/recordingBrowser/recordingBrowser.html',
    scope: {
      recording: '=recordingBrowser',
      sample: '='
    },
    link: {
      pre: function(scope) {
        // Set up the options. Used later to retrieve the 
        // internal data array of the twoWayInfiniteScroll
        // directive.
        scope.listOptions = {};

        function setSelectedTuples(tuples) {
          scope.selectedTuples = tuples.filter(function(t) {
            return t.selected;
          });
        }

        // Stuff to be added to the twoWayInfiniteScroll scope
        scope.scopeAdditions = {
          onTupleClick: function($event, tuple, tuples) {
            $event.preventDefault();

            // Check for shift key
            if (!$event.shiftKey) {
              // Clear out all other selected
              tuples.forEach(function(t) {
                delete t.selected;
                delete t.anchor;
              });
              tuple.selected = true;
              tuple.anchor = true;
            }
            else {
              // find the index of the selected tuples
              var clickedIndex = tuples.indexOf(tuple);

              // find index of the anchor
              var anchorIndex;
              for (var i = 0; i < tuples.length; i++) {
                if (tuples[i].anchor) {
                  anchorIndex = i;
                  break;
                }
              }
              
              // When no anchor is found, treat as if shift 
              // was not being pressed.
              // 
              // Also, if the anchor is the same as the tuple 
              // selected, also treat as if shift was not
              // being pressed
              if (typeof anchorIndex === 'undefined' || anchorIndex === clickedIndex) {
                scope.scopeAdditions.onTupleClick({ preventDefault: angular.noop }, tuple, tuples);
                return;
              }

              // Loop through, setting selected
              var startedSelecting = false;
              var doneSelecting = false;
              for (var k = 0; k < tuples.length; k++) {
                if (k === anchorIndex || k === clickedIndex) {
                  if (!startedSelecting) {
                    tuples[k].selected = true;
                    startedSelecting = true;  
                  }
                  else {
                    tuples[k].selected = true;
                    doneSelecting = true;
                  }
                }
                else {
                  if (startedSelecting && !doneSelecting) {
                    tuples[k].selected = true;
                  }
                  else {
                    delete tuples[k].selected;
                  }
                }
              }
            }
            
            // Update the selectedTuples on the scope            
            setSelectedTuples(tuples);

            // Queue focus on tuple list. Needs to be queued to prevent
            // double-digest loops
            delayedBroadcast('focusOnTupleList', 1);
          },
          recording: scope.recording
        };

        scope.onKeydown = function($event) {
          var which = $event.which;
          var items = scope.listOptions.getItems();
          var item, currentIsSelected, currentIsAnchor;
          // up
          if (which === 38) {
            $event.preventDefault();
            var nextWasSelected;
            var nextWasAnchor;
            for (var i = items.length -1; i >= 0; i--) {
              item = items[i];
              currentIsSelected = item.selected;
              currentIsAnchor = item.anchor;
              item.selected = nextWasSelected;
              item.anchor = nextWasAnchor;
              nextWasSelected = currentIsSelected;
              nextWasAnchor = currentIsAnchor;
            }
          }
          // down
          else if (which === 40) {
            $event.preventDefault();
            var previousWasSelected;
            var previousWasAnchor;
            var len = items.length;
            for (var k = 0; k < len; k++) {
              item = items[k];
              currentIsSelected = item.selected;
              currentIsAnchor = item.anchor;
              item.selected = previousWasSelected;
              item.anchor = previousWasAnchor;
              previousWasSelected = currentIsSelected;
              previousWasAnchor = currentIsAnchor;
            }
          }
          else {
            return;
          }
          setSelectedTuples(items);
        };
      },
      post: function(scope) {
        
        var recording = scope.recording;
        var offset, total;
        var chunkSize = new BigInteger('50');

        // Set up the port object to be used by browser
        var ports = scope.ports = {};
        for (var i = 0; i < recording.data.ports.length; i++) {
          scope.ports[i] = angular.copy(recording.data.ports[i]);
          scope.ports[i].enabled = true;
        }

        // Set up tuple retrieval functions
        scope.init = function(dfd) {
          $log.debug('Getting initial tuples for recordingBrowser.');
          scope.selectedTuples = [];
          recording.getTuples(0, chunkSize.toString(), makeSelectedPortsArray(ports)).then(
            function(tuples) {
              offset = new BigInteger('0');
              total = new BigInteger(tuples.length + '');
              dfd.resolve(tuples);
              $log.debug('Initial tuples for recordingBrowser received: ', tuples);
            },
            dfd.reject
          );
        };
        scope.prependTuples = function(dfd) {
          if (offset.compareTo(BigInteger.ZERO) <= 0) {
            // reached top of recording, don't display a message
            dfd.resolve();
            return;
          }
          var newOffset = offset.subtract(chunkSize);
          var limit;
          if (newOffset.compareTo(BigInteger.ZERO) < 0) {
            newOffset = new BigInteger('0');
            limit = offset;
          }
          else {
            limit = chunkSize;
          }

          recording.getTuples(newOffset, limit, makeSelectedPortsArray(ports)).then(function(tuples) {
            offset = newOffset;
            total = total.add(new BigInteger(tuples.length + ''));
            dfd.resolve(tuples);
          }, dfd.reject);
        };
        scope.appendTuples = function(dfd) {
          if (typeof total === 'undefined') {
            dfd.resolve();
            return;
          }

          recording.getTuples(total.toString(), chunkSize.toString(), makeSelectedPortsArray(ports)).then(function(tuples) {
            total = total.add(new BigInteger(tuples.length + ''));
            dfd.resolve(tuples);
          }, dfd.reject);
        };

        // Watch for changes to selected ports
        scope.$watch('ports', function() {
          var dfd = $q.defer();
          scope.$broadcast('resetTuples', dfd.promise);
          scope.init(dfd);
        }, true);

      }
    }

  };
});