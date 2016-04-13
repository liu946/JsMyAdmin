/**
 * Created by liu on 16/4/8.
 */

'use strict';

exports.showBody = function() {
  return function*(next) {
    console.log('<<<------ this.request ----------------------->>>');
    console.log(this.request);
    console.log('-------- this.request.body ---------------------');
    console.log(this.request.body);
    console.log('-------- this.query ----------------------------');
    console.log(this.query);
    console.log('-------------- next -----------------------------');
    yield next;
    console.log('-------- this.response --------------------------');
    console.log(this.response);
    console.log('--------- the end -------------------------------\n\n\n\n\n');
  };
};

const db = require('../db');
const config = require('../config');
const field = ' TABLE_SCHEMA AS db ,TABLE_NAME AS tb ';

const order = ' ORDER BY TABLE_SCHEMA ';
const ignoreDb = '"information_schema"';

exports.addingStructure = function() {
  return function*(next) {
    let row = yield* db.query.call(this, 'SELECT' + field + 'FROM INFORMATION_SCHEMA.TABLES Where TABLE_SCHEMA NOT IN (' + ignoreDb + ')' + order);
    let dbTableTree = {};
    row.map(function(r) {
      if (!(r.db in dbTableTree)) {
        dbTableTree[r.db] = [];
      }
      dbTableTree[r.db].push(r.tb);
    });
    yield next;
    yield this.render(this.params.template,
      { route: this.originalUrl.split('?')[0].split('/') ,
        data: this.data ,
        structure: dbTableTree,
        config, query: this.query,
    });
  };
};
