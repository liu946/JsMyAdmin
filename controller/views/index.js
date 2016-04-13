/**
 * Created by liu on 16/4/9.
 */

'use strict';

const router = require('../../router');
const db = require('../../db');


router.get('/view/:template', function*() {
  const row = yield* db.query.call(this, 'select 1+1');
  this.body = row;
});

require('./table');
require('./database');


