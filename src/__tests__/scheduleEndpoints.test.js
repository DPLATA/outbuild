const request = require('supertest');
const { app } = require('../index');  // Adjust the path as needed
const User = require('../models/user');  // Adjust the path as needed
const Activity = require('../models/activity');  // Adjust the path as needed
const Schedule = require('../models/schedule');  // Adjust the path as needed
const sequelize = require('../config/database');  // Adjust the path as needed

describe('API Endpoints', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });  // This will recreate all tables
  });

  afterAll(async () => {
    await sequelize.close();
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
      // Create a test user with a unique username and email
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

      // Verify the schedule was created in the database
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
          userId: 9999,  // Non-existent user ID
          name: 'Test Schedule'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /schedules/:scheduleId', () => {
    let user, schedule, activities;

    beforeEach(async () => {
      // Create a test user
      user = await User.create({
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        passwordHash: 'hashedpassword'
      });

      // Create a test schedule
      schedule = await Schedule.create({
        userId: user.userId,
        name: 'Test Schedule',
        imageUrl: 'http://example.com/image.jpg'
      });

      // Create some test activities
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
      // Create a new schedule without activities
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
});