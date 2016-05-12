/**
 * Created by liu on 16/4/9.
 */

'use strict';
const router = require('../../router');
const db = require('../../db');

/**
 * 生成表结构（DESCRIBE tableName）
 * 表的预览信息（SELECT * FROM tableName LIMIT 0,10）
 *
 * 调用生成模板：table
 */
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

/**
 * 表查找界面
 * 需要提供的参数：表结构（DESCRIBE tableName）
 *
 * 调用生成模板：select
 */
router.get('/table/select', function*() {
  this.data = {};
  this.data.selectResult = null;
  const tbDes = ' `' + this.query.database + '`.`' + this.query.table + '` ';
  this.data.structure = yield* db.query.call(this, 'DESCRIBE ' + tbDes );
  this.params.template = 'select';

});

/**
 * 表查找结果界面
 * 需要提供的参数： 表结构（DESCRIBE tableName）
 *                查找的SQL语句（）
 *
 * 调用生成模板：select
 */
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
  // 组合 AND 逻辑
  const andArray = conditionArray.map(function(x) {
    if (!x) return ' 1 ';
    let andList = [];
    for (let key in x) {
      andList.push(conditionToString(x[key], key));
    }

    return ' ( '+ andList.join(' AND ') +' ) ';
  });

  // 拼装 筛选字段信息 SELECT (...) FROM WHERE
  let selectField = [];
  for (let row of structure) {
    if (querySet['__isGet' + '[' + row.Field + ']'] === 'on') {
      selectField.push(row.Field);
    }
  }
  let sql = 'SELECT ' + selectField.join(',') + ' FROM ' + tbDes;

  // 拼装 选择条件信息 SELECT FROM WHERE ...
  // 组合 OR 逻辑
  if (andArray.length) {
    sql += (' WHERE ' + andArray.join(' OR '));
  }

  // 拼装 ORDER 字段 SELECT FROM WHERE ORDER BY ...
  if (querySet.__ORDER) {
    sql += (' ORDER BY ' + querySet.__ORDER + ('on' === querySet.__ORDER_DESC ? ' DESC ': ' ASC '));
  }

  // 拼装 LIMIT 字段 SELECT FROM WHERE ORDER BY LIMIT ...
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
/**
 * 将condition选项对象SQL序列化
 * @param obj
 * @param name
 * @returns {string}
 */
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
  return name + ' ' + obj.type + ' "' + obj.value + '" ';
}

/**
 * 表插入界面
 * 需要提供的参数：表结构（DESCRIBE tableName）
 *
 * 调用生成模板：insert
 */
router.get('/table/insert', function*() {
  this.data = {};
  const tbDes = ' `' + this.query.database + '`.`' + this.query.table + '` ';
  this.data.structure = yield* db.query.call(this, 'DESCRIBE ' + tbDes );
  this.params.template = 'insert';
});

/**
 * 表插入执行
 * 需要提供的参数： 表结构（DESCRIBE tableName）
 *                执行的SQL语句（INSERT INTO tableName (,,,) VALUES (,,,); ）
 *
 * 调用生成模板：insert
 */
router.post('/table/insert', function*() {
  const tbDes = ' `' + this.query.database + '`.`' + this.query.table + '` ';
  const structure = yield* db.query.call(this, 'DESCRIBE ' + tbDes );
  let querySet = this.request.body;
  let fieldArray = [];
  let valueArray = [];
  // 拼装插入的字段
  for (let row of structure) {
    if (querySet[row.Field]) {
      fieldArray.push(row.Field);
      valueArray.push(querySet[row.Field]);
    }
  }

  // 拼装插入的数据
  let sql = 'INSERT INTO ' + tbDes + ' (`' + fieldArray.join('`,`') + '`) VALUES ("' + valueArray.join('","') + '")';
  const res = yield* db.query.call(this, sql );
  if (!res) return;
  this.query.alert = 'success';
  this.query.alert_message = '执行成功: ' + sql;
  this.params.template = 'blank';
});


/**
 * 表删除界面
 * 需要提供的参数：表结构（DESCRIBE tableName）
 *
 * 调用生成模板：delete
 */
router.get('/table/delete', function*() {
  this.data = {};
  this.data.selectResult = null;
  const tbDes = ' `' + this.query.database + '`.`' + this.query.table + '` ';
  this.data.structure = yield* db.query.call(this, 'DESCRIBE ' + tbDes );
  this.params.template = 'delete';
});
/**
 * 表删除执行
 * 需要提供的参数： 表结构（DESCRIBE tableName）
 *                查询构造参数
 *
 * 调用生成模板：delete
 */
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
