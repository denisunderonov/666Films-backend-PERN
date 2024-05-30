import pkg from 'pg'
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres', 
    host: 'localhost', 
    database: 'courseDB', 
    password: 'Denimz13', 
    port: 5432,
  });
  
export default pool;
