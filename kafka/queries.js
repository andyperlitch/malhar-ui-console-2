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