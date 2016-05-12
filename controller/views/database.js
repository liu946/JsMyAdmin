/**
 * Created by liu on 16/4/9.
 */

'use strict';

const router = require('../../router');
const db = require('../../db');

const meaningField = [
  'TABLE_NAME as NAME',
  'ENGINE' ,
  'TABLE_ROWS as ROWS' ,
  'DATA_LENGTH as LENGTH' ,
  'AUTO_INCREMENT' ,
  'CREATE_TIME' ,
  'CREATE_OPTIONS as OPTIONS' ,
  'TABLE_COLLATION as COLLATION' ,
  'TABLE_COMMENT as COMMENT',
];

/**
 * 显示某数据库表信息
 */
router.get('/database', function*() {
  this.data = [];

  const dbDes = '"' + this.query.database + '"';
  const rows = yield* db.query.call(this, 'SELECT ' + meaningField.join(',') + ' FROM information_schema.tables WHERE table_schema=' + dbDes + '' );
  rows.tableName = this.query.database + '中表信息';

  this.data.push(rows);

  this.params.template = 'table';
});
