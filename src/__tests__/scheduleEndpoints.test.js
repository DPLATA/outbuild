const request = require('supertest');
const { app } = require('../index');
const User = require('../models/user'); 
const Activity = require('../models/activity');
const Schedule = require('../models/schedule');
const sequelize = require('../config/database');

jest.setTimeout(90000);

describe('API Endpoints', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    sequelize.connectionManager.close()
  });

  describe('GET /', () => {
    it('should return a welcome message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Welcome to the Schedule API' });
    });
  });

  describe('POST /schedules', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        passwordHash: 'hashedpassword'
      });
    });

    it('should create an empty schedule', async () => {
      const scheduleData = {
        userId: user.userId,
        name: 'Test Schedule',
        imageUrl: 'http://example.com/image.jpg'
      };

      const response = await request(app)
        .post('/schedules')
        .send(scheduleData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('scheduleId');
      expect(response.body.name).toBe(scheduleData.name);
      expect(response.body.imageUrl).toBe(scheduleData.imageUrl);
      expect(response.body.userId).toBe(user.userId);

      const createdSchedule = await Schedule.findByPk(response.body.scheduleId);
      expect(createdSchedule).not.toBeNull();
      expect(createdSchedule.name).toBe(scheduleData.name);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/schedules')
        .send({ userId: user.userId });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 if user does not exist', async () => {
      const response = await request(app)
        .post('/schedules')
        .send({
          userId: 9999,
          name: 'Test Schedule'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /schedules/:scheduleId', () => {
    let user, schedule, activities;

    beforeEach(async () => {
      user = await User.create({
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        passwordHash: 'hashedpassword'
      });

      schedule = await Schedule.create({
        userId: user.userId,
        name: 'Test Schedule',
        imageUrl: 'http://example.com/image.jpg'
      });

      activities = await Promise.all([
        Activity.create({
          scheduleId: schedule.scheduleId,
          name: 'Activity 1',
          startDate: new Date('2023-01-01T09:00:00'),
          endDate: new Date('2023-01-01T10:00:00')
        }),
        Activity.create({
          scheduleId: schedule.scheduleId,
          name: 'Activity 2',
          startDate: new Date('2023-01-01T11:00:00'),
          endDate: new Date('2023-01-01T12:00:00')
        })
      ]);
    });

    it('should return a schedule with its activities', async () => {
      const response = await request(app).get(`/schedules/${schedule.scheduleId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('scheduleId', schedule.scheduleId);
      expect(response.body).toHaveProperty('name', schedule.name);
      expect(response.body).toHaveProperty('imageUrl', schedule.imageUrl);
      expect(response.body).toHaveProperty('activities');
      expect(response.body.activities).toHaveLength(2);
      expect(response.body.activities[0]).toHaveProperty('name', 'Activity 1');
      expect(response.body.activities[1]).toHaveProperty('name', 'Activity 2');
    });

    it('should return 404 if schedule does not exist', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/schedules/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Schedule not found');
    });

    it('should return an empty activities array if the schedule has no activities', async () => {
      const emptySchedule = await Schedule.create({
        userId: user.userId,
        name: 'Empty Schedule',
        imageUrl: 'http://example.com/empty.jpg'
      });

      const response = await request(app).get(`/schedules/${emptySchedule.scheduleId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('scheduleId', emptySchedule.scheduleId);
      expect(response.body).toHaveProperty('activities');
      expect(response.body.activities).toHaveLength(0);
    });

    it('should handle invalid scheduleId parameter', async () => {
      const response = await request(app).get('/schedules/invalidId');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('POST /schedules/:scheduleId/activities', () => {
    let user, schedule;

    beforeEach(async () => {
      user = await User.create({
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        passwordHash: 'hashedpassword'
      });

      schedule = await Schedule.create({
        userId: user.userId,
        name: 'Test Schedule',
        imageUrl: 'http://example.com/image.jpg'
      });
    });

    it('should add an activity to a schedule', async () => {
      const activityData = {
        name: 'New Activity',
        startDate: '2023-01-01T09:00:00',
        endDate: '2023-01-01T10:00:00'
      };

      const response = await request(app)
        .post(`/schedules/${schedule.scheduleId}/activities`)
        .send(activityData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('activityId');
      expect(response.body.name).toBe(activityData.name);
      expect(new Date(response.body.startDate)).toEqual(new Date(activityData.startDate));
      expect(new Date(response.body.endDate)).toEqual(new Date(activityData.endDate));
      expect(response.body.scheduleId).toBe(schedule.scheduleId);

      const addedActivity = await Activity.findByPk(response.body.activityId);
      expect(addedActivity).not.toBeNull();
      expect(addedActivity.name).toBe(activityData.name);
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteData = {
        name: 'Incomplete Activity'
      };

      const response = await request(app)
        .post(`/schedules/${schedule.scheduleId}/activities`)
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });

    it('should return 404 if schedule does not exist', async () => {
      const nonExistentId = 9999;
      const activityData = {
        name: 'Activity for Non-existent Schedule',
        startDate: '2023-01-01T09:00:00',
        endDate: '2023-01-01T10:00:00'
      };

      const response = await request(app)
        .post(`/schedules/${nonExistentId}/activities`)
        .send(activityData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Schedule not found');
    });

    it('should handle invalid date formats', async () => {
      const invalidData = {
        name: 'Invalid Date Activity',
        startDate: 'invalid-date',
        endDate: 'invalid-date'
      };

      const response = await request(app)
        .post(`/schedules/${schedule.scheduleId}/activities`)
        .send(invalidData);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal server error');
    });

    it('should add multiple activities to the same schedule', async () => {
      const activity1 = {
        name: 'Activity 1',
        startDate: '2023-01-01T09:00:00',
        endDate: '2023-01-01T10:00:00'
      };

      const activity2 = {
        name: 'Activity 2',
        startDate: '2023-01-01T11:00:00',
        endDate: '2023-01-01T12:00:00'
      };

      await request(app)
        .post(`/schedules/${schedule.scheduleId}/activities`)
        .send(activity1);

      await request(app)
        .post(`/schedules/${schedule.scheduleId}/activities`)
        .send(activity2);

      const activities = await Activity.findAll({ where: { scheduleId: schedule.scheduleId } });
      expect(activities).toHaveLength(2);
      expect(activities[0].name).toBe('Activity 1');
      expect(activities[1].name).toBe('Activity 2');
    });
  });

  describe('POST /schedules/:scheduleId/bulk-activities', () => {
    let user, schedule;

    beforeEach(async () => {
      user = await User.create({
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        passwordHash: 'hashedpassword'
      });

      schedule = await Schedule.create({
        userId: user.userId,
        name: 'Test Schedule',
        imageUrl: 'http://example.com/image.jpg'
      });
    });

    it('should add multiple activities to a schedule', async () => {
      const activitiesData = {
        activities: [
          {
            name: 'Activity 1',
            startDate: '2023-01-01T09:00:00',
            endDate: '2023-01-01T10:00:00'
          },
          {
            name: 'Activity 2',
            startDate: '2023-01-01T11:00:00',
            endDate: '2023-01-01T12:00:00'
          }
        ]
      };

      const response = await request(app)
        .post(`/schedules/${schedule.scheduleId}/bulk-activities`)
        .send(activitiesData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('activityId');
      expect(response.body[0].name).toBe('Activity 1');
      expect(response.body[1]).toHaveProperty('activityId');
      expect(response.body[1].name).toBe('Activity 2');

      const addedActivities = await Activity.findAll({
        where: { scheduleId: schedule.scheduleId }
      });
      expect(addedActivities).toHaveLength(2);
    }, 50000);

    it('should return 400 if activities array is empty', async () => {
      const emptyData = { activities: [] };

      const response = await request(app)
        .post(`/schedules/${schedule.scheduleId}/bulk-activities`)
        .send(emptyData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid or empty activities array');
    }, 50000);

    it('should return 400 if required fields are missing in any activity', async () => {
      const incompleteData = {
        activities: [
          {
            name: 'Complete Activity',
            startDate: '2023-01-01T09:00:00',
            endDate: '2023-01-01T10:00:00'
          },
          {
            name: 'Incomplete Activity'
          }
        ]
      };

      const response = await request(app)
        .post(`/schedules/${schedule.scheduleId}/bulk-activities`)
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields in one or more activities');

      const activities = await Activity.findAll({
        where: { scheduleId: schedule.scheduleId }
      });
      expect(activities).toHaveLength(0);
    });

    it('should return 404 if schedule does not exist', async () => {
      const nonExistentId = 9999;
      const activitiesData = {
        activities: [
          {
            name: 'Activity for Non-existent Schedule',
            startDate: '2023-01-01T09:00:00',
            endDate: '2023-01-01T10:00:00'
          }
        ]
      };

      const response = await request(app)
        .post(`/schedules/${nonExistentId}/bulk-activities`)
        .send(activitiesData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Schedule not found');
    });

    it('should handle invalid date formats', async () => {
      const invalidData = {
        activities: [
          {
            name: 'Invalid Date Activity',
            startDate: 'invalid-date',
            endDate: 'invalid-date'
          }
        ]
      };

      const response = await request(app)
        .post(`/schedules/${schedule.scheduleId}/bulk-activities`)
        .send(invalidData);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal server error');

      const activities = await Activity.findAll({
        where: { scheduleId: schedule.scheduleId }
      });
      expect(activities).toHaveLength(0);
    });

    /*it('should add a large number of activities', async () => {
      const largeNumberOfActivities = Array(100).fill().map((_, index) => {
        const startHour = index % 24;
        const day = Math.floor(index / 24) + 1;
        const startDate = new Date(2023, 0, day, startHour, 0, 0);
        const endDate = new Date(2023, 0, day, startHour + 1, 0, 0);
        
        return {
          name: `Activity ${index + 1}`,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        };
      });
    
      const response = await request(app)
        .post(`/schedules/${schedule.scheduleId}/bulk-activities`)
        .send({ activities: largeNumberOfActivities });
    
      expect(response.status).toBe(201);
      expect(response.body).toHaveLength(100);
    
      const addedActivities = await Activity.findAll({
        where: { scheduleId: schedule.scheduleId }
      });
      expect(addedActivities).toHaveLength(100);
    });*/
  });

});