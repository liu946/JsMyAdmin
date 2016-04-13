/**
 * Created by liu on 16/4/9.
 */

'use strict';
const router = require('../../router');
const db = require('../../db');

function* tableIndex(){
  this.data = [];

  const tbDes = ' `' + this.query.database + '`.`' + this.query.table + '` ';
  const rows = yield* db.query.call(this, 'DESCRIBE ' + tbDes );
  rows.tableName = '表' + this.query.database + '结构';
  this.data.push(rows);
  const tableHead = yield* db.query.call(this, 'SELECT * FROM ' + tbDes + ' LIMIT 0,10' );
  tableHead.tableName = '表预览';
  this.data.push(tableHead);
  this.params.template = 'table';
}

router.get('/table', tableIndex);
router.get('/table/index', tableIndex);

router.get('/table/select', function*() {
  this.data = {};
  this.data.selectResult = null;
  const tbDes = ' `' + this.query.database + '`.`' + this.query.table + '` ';
  this.data.structure = yield* db.query.call(this, 'DESCRIBE ' + tbDes );
  this.params.template = 'select';

});

router.post('/table/select', function*() {

  const tbDes = ' `' + this.query.database + '`.`' + this.query.table + '` ';
  const structure = yield* db.query.call(this, 'DESCRIBE ' + tbDes );

  let querySet = this.request.body;
  let conditionArray = [];
  for (let i = 0; i < this.query.condition; i++) {
    for (let row of structure) {
      if (querySet[row.Field + '[' + i + ']']) {
        conditionArray[i] = conditionArray[i] ? conditionArray[i] : {};
        conditionArray[i][row.Field] = {
          value: querySet[row.Field + '[' + i + ']'],
          type: querySet[row.Field + '_Type[' + i + ']'],
        }
      }
    }
  }
  const andArray = conditionArray.map(function(x) {
    if (!x) return ' 1 ';
    let andList = [];
    for (let key in x) {
      andList.push(conditionToString(x[key], key));
    }

    return ' ( '+ andList.join(' AND ') +' ) ';
  });


  let selectField = [];
  for (let row of structure) {
    if (querySet['__isGet' + '[' + row.Field + ']'] === 'on') {
      selectField.push(row.Field);
    }
  }
  let sql = 'SELECT ' + selectField.join(',') + ' FROM ' + tbDes;

  if (andArray.length) {
    sql += (' WHERE ' + andArray.join(' OR '));
  }

  if (querySet.__ORDER) {
    sql += (' ORDER BY ' + querySet.__ORDER + ('on' === querySet.__ORDER_DESC ? ' DESC ': ' ASC '));
  }

  if (querySet.__LIMIT) {
    sql += (' LIMIT ' + querySet.__LIMIT);
  }

  this.data = [];
  const result = yield* db.query.call(this, sql);
  if (!result) return;
  result.tableName = '查询结果';
  this.data.push(result);
  this.query.alert = 'success';
  this.query.alert_message = '执行成功: ' + sql;
  this.params.template = 'table';

});
function conditionToString(obj, name) {
  switch (obj.type) {
    case 'LIKE %...%':
      return name + ' LIKE %'+ obj.value +'%';
    case 'IN (...)':
      return name + ' IN ('+ obj.value +')';
    case 'BETWEEN (...)':
      return ' ('+name+' > '+ obj.value.split(',')[0] + ' AND '+name+' < ' + obj.value.split(',')[1] + ')';
    case 'NOT LIKE %...%':
      return name + ' NOT LIKE %' + obj.value +'%';
    case 'NOT IN (...)':
      return name + ' NOT IN (' + obj.value +')';
    case 'NOT BETWEEN (...)':
      return ' NOT ('+name+' > ' + obj.value.split(',')[0] + ' AND '+name+' < ' + obj.value.split(',')[1] + ')';
    default :
  }
  return name + ' ' + obj.type + ' ' + obj.value + ' ';
}

router.get('/table/insert', function*() {
  this.data = {};
  const tbDes = ' `' + this.query.database + '`.`' + this.query.table + '` ';
  this.data.structure = yield* db.query.call(this, 'DESCRIBE ' + tbDes );
  this.params.template = 'insert';
});

router.post('/table/insert', function*() {
  const tbDes = ' `' + this.query.database + '`.`' + this.query.table + '` ';
  const structure = yield* db.query.call(this, 'DESCRIBE ' + tbDes );
  let querySet = this.request.body;
  let fieldArray = [];
  let valueArray = [];
  for (let row of structure) {
    if (querySet[row.Field]) {
      fieldArray.push(row.Field);
      valueArray.push(querySet[row.Field]);
    }
  }
  let sql = 'INSERT INTO ' + tbDes + ' (`' + fieldArray.join('`,`') + '`) VALUES ("' + valueArray.join('","') + '")';
  const res = yield* db.query.call(this, sql );
  if (!res) return;
  this.query.alert = 'success';
  this.query.alert_message = '执行成功: ' + sql;
  this.params.template = 'blank';
});

router.get('/table/delete', function*() {
  this.data = {};
  this.data.selectResult = null;
  const tbDes = ' `' + this.query.database + '`.`' + this.query.table + '` ';
  this.data.structure = yield* db.query.call(this, 'DESCRIBE ' + tbDes );
  this.params.template = 'delete';
});

router.post('/table/delete', function*() {
  const tbDes = ' `' + this.query.database + '`.`' + this.query.table + '` ';
  const structure = yield* db.query.call(this, 'DESCRIBE ' + tbDes );

  let querySet = this.request.body;
  let conditionArray = [];
  for (let i = 0; i < this.query.condition; i++) {
    for (let row of structure) {
      if (querySet[row.Field + '[' + i + ']']) {
        conditionArray[i] = conditionArray[i] ? conditionArray[i] : {};
        conditionArray[i][row.Field] = {
          value: querySet[row.Field + '[' + i + ']'],
          type: querySet[row.Field + '_Type[' + i + ']'],
        }
      }
    }
  }
  const andArray = conditionArray.map(function(x) {
    if (!x) return ' 1 ';
    let andList = [];
    for (let key in x) {
      andList.push(conditionToString(x[key], key));
    }

    return ' ( '+ andList.join(' AND ') +' ) ';
  });


  let sql = 'DELETE FROM ' + tbDes;

  if (andArray.length) {
    sql += (' WHERE ' + andArray.join(' OR '));
  }

  const result = yield* db.query.call(this, sql);
  if (!result) return;
  this.query.alert = 'success';
  this.query.alert_message = '执行成功: ' + sql;
  this.params.template = 'blank';

});
