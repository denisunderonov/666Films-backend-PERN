import pkg from 'pg'
const { Pool } = pkg;

// Поддержка как DATABASE_URL (для Railway), так и локальных настроек
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://postgres:Denimz13@localhost:5432/courseDB',
  ssl: process.env.NODE_ENV === 'production' ? 
    { rejectUnauthorized: false } : false
});
  
export default pool;
