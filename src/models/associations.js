const Schedule = require('./schedule');
const Activity = require('./activity');
const User = require('./user');

function setupAssociations() {
  Schedule.hasMany(Activity, { 
    sourceKey: 'scheduleId',
    foreignKey: 'scheduleId',
    as: 'activities'
  });

  Activity.belongsTo(Schedule, { 
    targetKey: 'scheduleId',
    foreignKey: 'scheduleId',
    as: 'schedule'
  });

  User.hasMany(Schedule, {
    sourceKey: 'userId',
    foreignKey: 'userId',
    as: 'schedules'
  });

  Schedule.belongsTo(User, {
    targetKey: 'userId',
    foreignKey: 'userId',
    as: 'user'
  });
}

module.exports = { setupAssociations };