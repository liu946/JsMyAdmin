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
    this.query.alert = 'error';
    this.query.alert_message = '执行' + arguments[0] + '出错<br/>'+ err;
    this.params.template = 'blank';
    return null;
  }
  return;
};


module.exports = db;
