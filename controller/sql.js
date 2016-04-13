/**
 * Created by liu on 16/4/9.
 */
'use strict';

const router = require('../router');
const db = require('../db');

router.get('/sql', function*() {
  let row = yield* db.query(this.params.sql);
  this.body = JSON.stringify(row);
});


