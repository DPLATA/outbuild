require('dotenv').config();

const config = {
  username: process.env.DB_USER || '',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || '',
  //host: process.env.DB_HOST || 'localhost',
  host: process.env.CI ? 'db' : 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dialect: 'postgres'
};

module.exports = config;