/**
 * Created by liu on 16/4/8.
 */
'use strict';

require('./views');
require('./dbStruct');
require('./sql');

const router = require('../router');
router.get('/', function*() {
  yield this.render('index');
});

