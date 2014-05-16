'use strict';

angular.module('dtConsoleApp')
  .factory('widgets/dtTable/applicationsListColumns', function () {

    // var bormat = require('bormat');
    // var templates = DT.templates;
    // var formatters = DT.formatters;
    // var stateOrder = DT.settings.statusOrder;

    // function stateFormatter(value,row) {
    //     if (!value) {
    //         return '-';
    //     }
    //     var finalStatus = row.get('finalStatus');
    //     var html = '<span class="status-' + value.replace(' ','-').toLowerCase() + '">' + value + '</span>';
    //     if ( typeof finalStatus === 'string' && finalStatus.toLowerCase() !== 'undefined' ) {
    //         html += ' <span class="final-status" title="Final Status">(' + finalStatus + ')</span>';
    //     }
    //     return html;
    // }

    // function stateSorter(row1,row2) {
    //     var state1 = stateOrder.indexOf(row1.get('state'));
    //     var state2 = stateOrder.indexOf(row2.get('state'));
    //     return state1 - state2;
    // }

    // function idFormatter(value, row) {
    //     return templates.app_instance_link({ appId: value });
    // }

    // function idFilter(term, value, computedValue, row) {
    //     var parts = value.split('_');
    //     term = term.toLowerCase();
    //     value = parts[parts.length-1]+'';
    //     value = value.toLowerCase();
    //     return value.indexOf(term) > -1;
    // }

    // function lifetimeFormatter(value, row) {
    //     var finishedTime = row.get('finishedTime') * 1 || +new Date() ;
    //     var startedTime = row.get('startedTime') * 1 ;
    //     return bormat.timeSince({
    //         timeChunk: finishedTime - startedTime,
    //         unixUptime: true,
    //         max_levels: 3
    //     });
    // }

    // function memoryFormatter(value, row) {
    //     if (!value) {
    //         return '-';
    //     }
    //     return formatters.byteFormatter(value, 'mb');
    // }

    // function memorySorter(row1, row2) {
    //     var v1 = row1.get('allocatedMB');
    //     var v2 = row2.get('allocatedMB');
    //     if (!v1 && !v2) {
    //         return 0;
    //     }
    //     if (!v1) {
    //         return -1;
    //     }
    //     if (!v2) {
    //         return 1;
    //     }
    //     return v1 - v2;
    // }

    return [
        { id: 'selector', key: 'id', label: '', format: 'selector' }
        // { id: 'id', label: DT.text('id_label'), key: 'id', sort: 'string', filter: idFilter, format: idFormatter, width: 50, sort_value: 'd', lock_width: true },
        // { id: 'name', key: 'name', label: DT.text('name_label'), sort: 'string', filter: 'like', width: 200 },
        // { id: 'state', label: DT.text('state_label'), key: 'state', format: stateFormatter, sort: stateSorter, filter:'like', width: 100 , sort_value: 'a'},
        // { id: 'user', key: 'user', label: DT.text('user_label'), sort: 'string', filter:'like' },
        // { id: 'startedTime', label: DT.text('started_label'), key: 'startedTime', sort: 'number', filter: 'date', format: 'timeSince' },
        // { id: 'lifetime', label: DT.text('lifetime_label'), key: 'startedTime', filter: 'numberFormatted', format: lifetimeFormatter },
        // { id: 'allocatedMB', label: DT.text('memory_label'), key: 'allocatedMB', sort: memorySorter, filter: 'number', format: memoryFormatter, width: 60 }
    ];
  });
