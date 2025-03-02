// db.js
const { Pool } = require('pg');

// Create a new pool (connection pool) to your PostgreSQL database
const pool = new Pool({
    user: 'hannahadmin',
    host: 'localhost', 
    database: 'newboatdatabase',
    password: 'hannahmaschke',
    port: 5432, 
  });

module.exports = pool;