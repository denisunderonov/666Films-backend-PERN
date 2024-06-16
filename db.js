import pkg from 'pg'
import { bdURL } from './var.js';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres', 
    host: `${bdURL}`, 
    database: 'courseDB', 
    password: 'Denimz13', 
    port: 5432,
  });
  
export default pool;
