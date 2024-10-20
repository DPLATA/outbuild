/**
 * @apiDefine ScheduleSuccess
 * @apiSuccess {Number} scheduleId Unique schedule identifier
 * @apiSuccess {Number} userId User's unique identifier
 * @apiSuccess {String} name Schedule name
 * @apiSuccess {String} imageUrl Schedule image URL
 * @apiSuccess {Date} createdAt Creation timestamp
 * @apiSuccess {Date} updatedAt Last update timestamp
 */

/**
 * @apiDefine ScheduleError
 * @apiError (400) BadRequest Missing or invalid required fields
 * @apiError (403) Forbidden User doesn't own the schedule
 * @apiError (404) NotFound Schedule or user not found
 */

/**
 * @apiDefine ActivitySuccess
 * @apiSuccess {Number} activityId Activity's unique identifier
 * @apiSuccess {Number} scheduleId Schedule's identifier
 * @apiSuccess {String} name Activity name
 * @apiSuccess {Date} startDate Start date
 * @apiSuccess {Date} endDate End date
 * @apiSuccess {Date} createdAt Creation timestamp
 * @apiSuccess {Date} updatedAt Last update timestamp
 */

/**
 * @api {post} /schedules Create Schedule
 * @apiDescription Create a new schedule for a user
 * @apiVersion 1.0.0
 * @apiName CreateSchedule
 * @apiGroup Schedules
 *
 * @apiBody {Number} userId User's unique ID
 * @apiBody {String} name Schedule name (1-100 chars)
 * @apiBody {String} [imageUrl] URL of schedule image (max 255 chars)
 *
 * @apiUse ScheduleSuccess
 * @apiUse ScheduleError
 *
 * @apiExample {curl} Example usage:
 *     curl -X POST http://localhost:3001/schedules \
 *          -H "Content-Type: application/json" \
 *          -d '{"userId":1,"name":"My Schedule","imageUrl":"http://example.com/image.jpg"}'
 */

/**
 * @api {get} /schedules/:scheduleId Get Schedule
 * @apiDescription Get schedule details with its activities
 * @apiVersion 1.0.0
 * @apiName GetSchedule
 * @apiGroup Schedules
 *
 * @apiParam {Number} scheduleId Schedule's unique ID
 * @apiQuery {Number} [page=1] Page number for pagination
 * @apiQuery {Number} [limit=10] Items per page
 *
 * @apiSuccess {Object} schedule Schedule object
 * @apiSuccess {Number} schedule.scheduleId Schedule's unique identifier
 * @apiSuccess {String} schedule.name Schedule name
 * @apiSuccess {String} schedule.imageUrl Schedule image URL
 * @apiSuccess {Object[]} schedule.activities List of activities
 * @apiSuccess {Object} pagination Pagination information
 * @apiSuccess {Number} pagination.currentPage Current page number
 * @apiSuccess {Number} pagination.totalPages Total number of pages
 * @apiSuccess {Number} pagination.totalItems Total number of items
 * @apiSuccess {Number} pagination.itemsPerPage Number of items per page
 *
 * @apiUse ScheduleError
 *
 * @apiExample {curl} Example usage:
 *     curl -X GET http://localhost:3001/schedules/1?page=1&limit=10
 */

/**
 * @api {post} /schedules/:scheduleId/activities Add Activity
 * @apiDescription Add a new activity to a schedule
 * @apiVersion 1.0.0
 * @apiName AddActivity
 * @apiGroup Activities
 *
 * @apiParam {Number} scheduleId Schedule's unique ID
 * @apiBody {Number} userId User's unique ID
 * @apiBody {String} name Activity name (1-100 chars)
 * @apiBody {String} startDate Activity start date (ISO format)
 * @apiBody {String} endDate Activity end date (ISO format)
 *
 * @apiUse ActivitySuccess
 * @apiUse ScheduleError
 *
 * @apiExample {curl} Example usage:
 *     curl -X POST http://localhost:3001/schedules/1/activities \
 *          -H "Content-Type: application/json" \
 *          -d '{"userId":1,"name":"Meeting","startDate":"2024-01-01T09:00:00Z","endDate":"2024-01-01T10:00:00Z"}'
 */

/**
 * @api {post} /schedules/:scheduleId/bulk-activities Bulk Add Activities
 * @apiDescription Add multiple activities to a schedule
 * @apiVersion 1.0.0
 * @apiName BulkAddActivities
 * @apiGroup Activities
 *
 * @apiParam {Number} scheduleId Schedule's unique ID
 * @apiBody {Number} userId User's unique ID
 * @apiBody {Object[]} activities List of activities to create
 * @apiBody {String} activities.name Activity name (1-100 chars)
 * @apiBody {String} activities.startDate Start date (ISO format)
 * @apiBody {String} activities.endDate End date (ISO format)
 *
 * @apiSuccess {Object[]} activities List of created activities
 * @apiSuccess {Number} activities.activityId Activity's unique identifier
 * @apiSuccess {String} activities.name Activity name
 * @apiSuccess {Date} activities.startDate Start date
 * @apiSuccess {Date} activities.endDate End date
 *
 * @apiUse ScheduleError
 *
 * @apiExample {curl} Example usage:
 *     curl -X POST http://localhost:3001/schedules/1/bulk-activities \
 *          -H "Content-Type: application/json" \
 *          -d '{"userId":1,"activities":[{"name":"Meeting 1","startDate":"2024-01-01T09:00:00Z","endDate":"2024-01-01T10:00:00Z"},{"name":"Meeting 2","startDate":"2024-01-01T11:00:00Z","endDate":"2024-01-01T12:00:00Z"}]}'
 */