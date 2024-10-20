const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Activity = require('../models/activity');
const Schedule = require('../models/schedule');
const sequelize = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { validate } = require('../middleware/validation');
const schemas = require('../schemas/validation');


router.post('/', validate(schemas.createSchedule), async (req, res, next) => {
  try {
    const { userId, name, imageUrl } = req.body;

    if (!userId || !name) {
      throw new AppError(400, 'Missing required fields');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const schedule = await Schedule.create({
      userId,
      name,
      imageUrl
    });

    logger.info(`Schedule created with ID: ${schedule.scheduleId}`);
    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
});

router.get('/:scheduleId', async (req, res, next) => {
    try {
      const { scheduleId } = req.params;
  
      const schedule = await Schedule.findByPk(scheduleId, {
        include: [{
          model: Activity,
          as: 'activities'
        }]
      });
  
      if (!schedule) {
        throw new AppError(404, 'Schedule not found');
      }
  
      res.status(200).json(schedule);
    } catch (error) {
      next(error);
    }
});

router.post('/:scheduleId/activities', validate(schemas.createActivity), async (req, res, next) => {
    try {
      const { scheduleId } = req.params;
      const { name, startDate, endDate } = req.body;
  
      if (!name || !startDate || !endDate) {
        throw new AppError(400, 'Missing required fields');
      }
  
      const schedule = await Schedule.findByPk(scheduleId);
      if (!schedule) {
        throw new AppError(404, 'Schedule not found');
      }
  
      const activity = await Activity.create({
        scheduleId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });
  
      res.status(201).json(activity);
    } catch (error) {
      next(error);
    }
});

router.post('/:scheduleId/bulk-activities', validate(schemas.bulkCreateActivities), async (req, res, next) => {
    const t = await sequelize.transaction();
  
    try {
      const { scheduleId } = req.params;
      const { activities } = req.body;
  
      if (!Array.isArray(activities) || activities.length === 0) {
        throw new AppError(400, 'Invalid or empty activities array');
      }
  
      const schedule = await Schedule.findByPk(scheduleId);
      if (!schedule) {
        throw new AppError(404, 'Schedule not found');
      }
  
      for (const activity of activities) {
        if (!activity.name || !activity.startDate || !activity.endDate) {
          await t.rollback();
          throw new AppError(400, 'Missing required fields in one or more activities');
        }
      }
  
      const createdActivities = await Activity.bulkCreate(
        activities.map(activity => ({
          ...activity,
          scheduleId,
          startDate: new Date(activity.startDate),
          endDate: new Date(activity.endDate)
        })),
        { transaction: t }
      );
  
      await t.commit();
      res.status(201).json(createdActivities);
    } catch (error) {
      await t.rollback();
      next(error);
    }
});

module.exports = router;