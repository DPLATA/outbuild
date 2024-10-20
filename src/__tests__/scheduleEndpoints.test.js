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
        passwordHash: `test${Date.now()}hashedpassword`
      });
    });

    it('should create an empty schedule', async () => {
      const scheduleData = {
        userId: user.userId,
        name: `Test Schedule ${Date.now()}`,
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
      expect(response.body).toHaveProperty('message', '"name" is required');
      expect(response.body).toHaveProperty('status', 'fail');
    });

    it('should return 404 if user does not exist', async () => {
      const response = await request(app)
        .post('/schedules')
        .send({
          userId: 9999,
          name: 'Test Schedule'
        });
    
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
      expect(response.body).toHaveProperty('status', 'fail');
    });
  });

  describe('GET /schedules/:scheduleId', () => {
    let user, schedule, activities;

    beforeEach(async () => {
      user = await User.create({
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        passwordHash: `test${Date.now()}hashedpassword`
      });

      schedule = await Schedule.create({
        userId: user.userId,
        name: `Test Schedule ${Date.now()}`,
        imageUrl: 'http://example.com/image.jpg'
      });

      activities = await Promise.all([
        Activity.create({
          scheduleId: schedule.scheduleId,
          name: 'Daaaaam les have some fun w thissss!',
          startDate: new Date('2023-01-01T09:00:00'),
          endDate: new Date('2023-01-01T10:00:00')
        }),
        Activity.create({
          scheduleId: schedule.scheduleId,
          name: 'Testing baby!',
          startDate: new Date('2023-01-01T11:00:00'),
          endDate: new Date('2023-01-01T12:00:00')
        })
      ]);
    });

    it('should return a schedule with its activities and pagination', async () => {
      const response = await request(app).get(`/schedules/${schedule.scheduleId}`);

      expect(response.status).toBe(200);
      expect(response.body.schedule).toHaveProperty('scheduleId', schedule.scheduleId);
      expect(response.body.schedule).toHaveProperty('name', schedule.name);
      expect(response.body.schedule).toHaveProperty('imageUrl', schedule.imageUrl);
      expect(response.body.schedule).toHaveProperty('activities');
      expect(response.body.schedule.activities).toHaveLength(2);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('currentPage');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('totalItems');
      expect(response.body.pagination).toHaveProperty('itemsPerPage');
    });

    it('should return 404 if schedule does not exist', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/schedules/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Schedule not found');
      expect(response.body).toHaveProperty('status', 'fail');
    });

    it('should return an empty activities array if the schedule has no activities', async () => {
      const emptySchedule = await Schedule.create({
        userId: user.userId,
        name: 'Empty Schedule',
        imageUrl: 'http://example.com/empty.jpg'
      });
  
      const response = await request(app).get(`/schedules/${emptySchedule.scheduleId}`);
  
      expect(response.status).toBe(200);
      expect(response.body.schedule).toHaveProperty('scheduleId', emptySchedule.scheduleId);
      expect(response.body.schedule).toHaveProperty('activities');
      expect(response.body.schedule.activities).toHaveLength(0);
      expect(response.body.pagination.totalItems).toBe(0);
    });

    it('should handle invalid scheduleId parameter', async () => {
      const response = await request(app).get('/schedules/invalidId');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'invalid input syntax for type bigint: "invalidId"');
    });
  });

  describe('POST /schedules/:scheduleId/activities', () => {
    let user, schedule;

    beforeEach(async () => {
      user = await User.create({
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        passwordHash: `test${Date.now()}hashedpassword`
      });

      schedule = await Schedule.create({
        userId: user.userId,
        name: `Test Schedule ${Date.now()}`,
        imageUrl: 'http://example.com/image.jpg'
      });
    });

    it('should add an activity to a schedule', async () => {
      const activityData = {
        userId: user.userId,
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
      expect(response.body).toHaveProperty('message', 'User ID is required');
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
      expect(response.body).toHaveProperty('message', 'Schedule not found');

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

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    });

    it('should add multiple activities to the same schedule', async () => {
      const activity1 = {
        name: 'Activity 1',
        startDate: '2023-01-01T09:00:00',
        endDate: '2023-01-01T10:00:00',
        userId: user.userId
      };
      
      const activity2 = {
        name: 'Activity 2',
        startDate: '2023-01-01T11:00:00',
        endDate: '2023-01-01T12:00:00',
        userId: user.userId
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
        passwordHash: `test${Date.now()}hashedpassword`
      });

      schedule = await Schedule.create({
        userId: user.userId,
        name: `Test Schedule ${Date.now()}`,
        imageUrl: 'http://example.com/image.jpg'
      });
    });

    it('should add multiple activities to a schedule', async () => {
      const activitiesData = {
        userId: user.userId,
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
    });

    it('should return 400 if activities array is empty', async () => {
      const emptyData = { 
        userId: user.userId,
        activities: [] 
      };

      const response = await request(app)
        .post(`/schedules/${schedule.scheduleId}/bulk-activities`)
        .send(emptyData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', '\"activities\" must contain at least 1 items');
      expect(response.body).toHaveProperty('status', 'fail');
    });

    it('should return 400 if required fields are missing in any activity', async () => {
      const incompleteData = {
        userId: user.userId,
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
      expect(response.body).toHaveProperty('message', '\"activities[1].startDate\" is required, \"activities[1].endDate\" is required');
      expect(response.body).toHaveProperty('status', 'fail');

      const activities = await Activity.findAll({
        where: { scheduleId: schedule.scheduleId }
      });
      expect(activities).toHaveLength(0);
    });

    it('should return 404 if schedule does not exist', async () => {
      const nonExistentId = 9999;
      const activitiesData = {
        userId: user.userId,
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

        expect(response.body).toHaveProperty('message', 'Schedule not found');
        expect(response.body).toHaveProperty('status', 'fail');
    });
  });
});