const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Activity extends Model {}

Activity.init({
  activityId: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    field: 'activity_id'
  },
  scheduleId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'schedule_id'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_date'
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
  tableName: 'activities',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['schedule_id']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['end_date']
    }
  ]
});

module.exports = Activity;