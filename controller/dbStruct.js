/**
 * Created by liu on 16/4/8.
 */
'use strict';

const router = require('../router');
const db = require('../db');

const field = ' TABLE_SCHEMA AS db ,TABLE_NAME AS tb ';
const order = ' ORDER BY TABLE_SCHEMA ';
const ignoreDb = '"information_schema"';
router.get('/structure', function*() {
  let row = yield* db.query.call(this, 'SELECT' + field + 'FROM INFORMATION_SCHEMA.TABLES Where TABLE_SCHEMA NOT IN (' + ignoreDb + ')' + order);
  let dbTableTree = {};
  row.map(function(r) {
    if (!(r.db in dbTableTree)) {
      dbTableTree[r.db] = [];
    }
    dbTableTree[r.db].push(r.tb);
  });
  this.body = JSON.stringify(dbTableTree);

});
