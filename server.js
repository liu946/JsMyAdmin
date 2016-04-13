/**
 * Created by liu on 16/4/8.
 */
'use strict';

const koa = require('koa');
const ms = require('ms');
const staticCache = require('koa-static-cache');
const http = require('http');
const config = require('./config');
const logger = require('koa-logger');
const parameter = require('koa-parameter');
const formidable = require('koa-formidable');
const ipFilter = require('koa-ip-filter');
const middlewares = require('./middlewares');
const path = require('path');
const rt = require('koa-rt');
const router = require('./router');
const ejs = require('koa-ejs');
const app = koa();




//抓取错误
app.on('error', function(err) {
  console.error(err.stack);
});

//响应计时
app.use(rt());

//显示请求、响应
if (config.debug) {
  app.use(logger());
}

if (!config.debug) {
  app.use(ipFilter({
    forbidden: '{ statusCode: 403, message: "Forbidden!" }',
    filter: config.ipFilter,
  }));
}

//静态资源缓存
app.use(staticCache({
  dir: path.join(__dirname, './static'),
  prefix: '/static',
  maxAge: ms('1y'),
  buffer: true,
  gzip: false,
}));

//解析http头
app.use(formidable());

//显示参数
if (config.debug) {
  app.use(middlewares.showBody());
}

// 加载公用参数
app.use(middlewares.addingStructure());


////如无错误发生，添加200状态码
//app.use(middlewares.addStatusCode());

require('./controller');

app.use(router.routes());

// 加载模板引擎
ejs(app, {
  root: path.join(__dirname, 'view'),
  viewExt: 'html',
  layout: false,
  cache: false,
  debug: config.debug,
});

module.exports = http.createServer(app.callback());

