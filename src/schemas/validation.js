const Joi = require('joi');

const schemas = {
  createSchedule: Joi.object({
    userId: Joi.number().integer().positive().required(),
    name: Joi.string().min(1).max(100).required(),
    imageUrl: Joi.string().uri().max(255).allow(null)
  }),

  createActivity: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
  }),

  bulkCreateActivities: Joi.object({
    activities: Joi.array().items(Joi.object({
      name: Joi.string().min(1).max(100).required(),
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
    })).min(1).required()
  })
};

module.exports = schemas;