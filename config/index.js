/**
 * Created by liu on 16/4/8.
 */
'use strict';
const path = require('path');

let config = {};

config.siteName = '数据库管理系统';
config.author = 'Michael Liu';

config.db = {
  host: '127.0.0.1',
  dialect: 'mysql',
  user: 'root',
  password: '123456',
  pool: {
    max: 100,
    min: 0,
    idle: 5000,
    maxConnections: 100,
    minConnections: 0,
    maxIdleTime: 5000,
  },
  logging: false,
  timezone: '+08:00',
  dialectOptions: {
    charset: 'utf8mb4',
  },
};

config.debug = true;
config.port = 8080;
config.url = 'http://127.0.0.1:8080';

config.ipFilter = ['*'];

let customConfig = {};
try {
  customConfig = require(path.join(__dirname, './custom.js'));
} catch (err) {
  // ignore error
}

function overwrite(obj1, obj2) {
  for (let key in obj2) {
    if (typeof (obj2[key]) === 'object' && obj2[key].constructor !== Array) {
      if (!obj1.hasOwnProperty(key)) {
        obj1[key] = {};
      }

      overwrite(obj1[key], obj2[key]);
    } else {
      obj1[key] = obj2[key];
    }
  }

  return obj1;
}

config = overwrite(config, customConfig);

module.exports = config;
