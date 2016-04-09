/**
 * Created by liu on 16/4/9.
 */

'use strict';

const router = require('../../router');

router.get('/view/:template', function*() {
  yield this.render(this.params.template);
});