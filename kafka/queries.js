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

var _ = require('lodash');

function Queries() {
  this.query2id = {}; // query -> {id1: true, id2: true}
  this.id2query = {}; // id -> {query1: true, query2: true}
}

_.extend(Queries.prototype, {
  getQueryList: function () {
    return _.keys(this.query2id);
  },

  addQuery: function (id, query) {
    this.addIdToQuery(id, query);
    this.addQueryToId(id, query);
  },

  addIdToQuery: function (id, query) {
    var idMap = this.query2id[query];
    if (!idMap) {
      idMap = {};
      this.query2id[query] = idMap;
    }

    idMap[id] = true;
  },

  addQueryToId: function (id, query) {
    var queryMap = this.id2query[id];
    if (!queryMap) {
      queryMap = {};
      this.id2query[id] = queryMap;
    }

    queryMap[query] = true;
  },

  removeQuery: function (id, query) {
    this.removeIdFromQuery(id, query);
    this.removeQueryFromId(id, query);
  },

  hasQuery: function (query) {
    return !_.isEmpty(this.query2id[query]);
  },

  removeIdFromQuery: function (id, query) {
    var idMap = this.query2id[query];
    if (idMap) {
      delete idMap[id];
      if (_.isEmpty(idMap)) {
        delete this.query2id[query];
      }
    }
  },

  removeQueryFromId: function (id, query) {
    var queryMap = this.id2query[id];
    if (queryMap) {
      delete queryMap[query];
      if (_.isEmpty(queryMap)) {
        delete this.id2query[id];
      }
    }
  },

  removeId: function (id) {
    var queryMap = this.id2query[id];
    if (queryMap) {
      var queries = _.keys(queryMap);
      _.each(queries, function (query) {
        this.removeQuery(id, query);
      }, this);
    }
  }
});

module.exports = Queries;