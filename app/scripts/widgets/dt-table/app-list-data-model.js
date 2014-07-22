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

angular.module('dtConsoleApp')
  .factory('AppListDataModel', function(DtText, DtSettings, WidgetDataModel, ApplicationsRest, ApplicationsPubSub, $filter) {
   
    function stateFormatter(value,row) {
      if (!value) {
        return '-';
      }
      var finalStatus = row.finalStatus;
      var html = '<span class="status-' + value.replace(' ','-').toLowerCase() + '">' + value + '</span>';
      if ( typeof finalStatus === 'string' && finalStatus.toLowerCase() !== 'undefined' ) {
        html += ' <small class="final-status" title="Final Status">(' + finalStatus + ')</small>';
      }
      return html;
    }
    stateFormatter.trustAsHtml = true;

    function stateSorter(row1,row2) {
      var state1 = DtSettings.statusOrder.indexOf(row1.state);
      var state2 = DtSettings.statusOrder.indexOf(row2.state);
      return state1 - state2;
    }

    function lifetimeFormatter(value, row) {
      var finishedTime = row.finishedTime * 1 || +new Date() ;
      var startedTime = row.startedTime * 1 ;
      return $filter('timeSince')({
        timeChunk: finishedTime - startedTime,
        unixUptime: true,
        max_levels: 3
      });
    }

    function memoryFormatter(value, row) {
      if (!value) {
        return '-';
      }
      return $filter('dtByteFilter')(value, 'mb');
    }

    function memorySorter(row1, row2) {
      var v1 = row1.allocatedMB;
      var v2 = row2.allocatedMB;
      if (!v1 && !v2) {
        return 0;
      }
      if (!v1) {
        return -1;
      }
      if (!v2) {
        return 1;
      }
      return v1 - v2;
    }

    var columns = [
        { id: 'selector', key: 'id', label: '', format: 'selector', width: '40px', lock_width: true },
        { id: 'id', label: DtText.get('id_label'), key: 'id', sort: 'string', filter: 'like', format: $filter('appIdLink'), trustFormat: true },
        { id: 'name', key: 'name', label: DtText.get('name_label'), sort: 'string', filter: 'like' },
        { id: 'state', label: DtText.get('state_label'), key: 'state', format: stateFormatter, sort: stateSorter, filter:'like' },
        { id: 'user', key: 'user', label: DtText.get('user_label'), sort: 'string', filter:'like' },
        { id: 'startedTime', label: DtText.get('started_label'), key: 'startedTime', sort: 'number', filter: 'date', format: $filter('timeSince') },
        { id: 'lifetime', label: DtText.get('lifetime_label'), key: 'startedTime', filter: 'date', format: lifetimeFormatter  },
        { id: 'allocatedMB', label: DtText.get('memory_label'), key: 'allocatedMB', sort: memorySorter, filter: 'number', format: memoryFormatter }
    ];


    function AppListDataModel() {}

      AppListDataModel.prototype = Object.create(WidgetDataModel.prototype);

      AppListDataModel.prototype.init = function() {
        
        var that = this;

        // Set up items on scope
        this.widgetScope.columns = columns;
        this.widgetScope.selected = this.selected = [];
        this.widgetScope.options = {
          row_limit: 10,
          initial_sorts: [
            { id: 'state', dir: '+' },
            { id: 'startedTime', dir: '-' }
          ]
        };

        // Retrieve active applications via REST
        var result = ApplicationsRest.getActive();
        result.$promise.then(function() {
          that.widgetScope.rows = result;
        });
        that.widgetScope.rows = result;

        // Expose functions required on widget scope
        this.widgetScope.getAllApps = function() {
          var result = ApplicationsRest.getAll();
          result.$promise.then(function() {
            that.widgetScope.rows = result;
          });
        };
        this.widgetScope.endApp = function(type, id) {
          var app = _.where(that.widgetScope.rows, {id: id})[0];
          if (app) {
            app['$' + type]({
              appId: id
            });
          }
        };

        // Create PubSub instance and subscribe
        this.pubsub = new ApplicationsPubSub();
        this.pubsub.subscribe(function(data) {
          that.widgetScope.rows = data;
        });
      };

      AppListDataModel.prototype.destroy = function() {
        this.pubsub.unsubscribe();
      };

      return AppListDataModel;
  });

