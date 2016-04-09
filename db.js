/**
 * Created by liu on 16/4/8.
 */

'use strict';
const mysql = require('koa-mysql');
const dbConfig = require('./config').db;
const pool = mysql.createPool(dbConfig);

const db = {};
db.query = function*() {

  try {
    console.log(arguments[0]);
    let rows = yield pool.query.apply(this, arguments);
    return rows;
  }
  catch (err) {
    // 500 Internal Server Error
    this.status = 500;
    this.body = { error: err };
  }
  return;
};


module.exports = db;
