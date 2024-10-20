require('dotenv').config();

const config = {
  username: process.env.DB_USER || '',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || '',
  //host: process.env.DB_HOST || 'localhost',
  host: '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dialect: 'postgres'
};

module.exports = config;