const { Sequelize } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize({
  ...config,
  dialect: 'postgres',
  logging: console.log,
});

module.exports = sequelize;