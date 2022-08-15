"use strict";
Promise.resolve().then(() => require('dotenv')).config();
const { Pool } = Promise.resolve().then(() => require('pg'));
const pool_conf = Promise.resolve().then(() => require('./src/database/config'));
const pool = new Pool(pool_conf['dev']);
module.exports = pool;
