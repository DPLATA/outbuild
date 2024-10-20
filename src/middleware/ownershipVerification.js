const { AppError } = require('./errorHandler');
const Schedule = require('../models/schedule');

const verifyScheduleOwnership = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    
    const schedule = await Schedule.findByPk(scheduleId);
    
    if (!schedule) {
      throw new AppError(404, 'Schedule not found');
    }

    if (req.method === 'GET') {
      req.schedule = schedule;
      return next();
    }

    const { userId } = req.body;
    if (!userId) {
      throw new AppError(400, 'User ID is required');
    }

    if (schedule.userId !== userId) {
      throw new AppError(403, 'You do not have permission to access this schedule');
    }

    req.schedule = schedule;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyScheduleOwnership };