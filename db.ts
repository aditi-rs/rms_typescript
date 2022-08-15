require('dotenv').config()

import {Pool}  from 'pg'

import  pool_conf  from './src/database/config'

const args:object = pool_conf["dev"];

const pool = new Pool(args);

export default pool;


