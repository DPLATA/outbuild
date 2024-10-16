const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Schedule extends Model {}

Schedule.init({
  scheduleId: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    field: 'schedule_id'
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'user_id'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    field: 'image_url'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  sequelize,
  tableName: 'schedules',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'name']
    }
  ]
});

module.exports = Schedule;