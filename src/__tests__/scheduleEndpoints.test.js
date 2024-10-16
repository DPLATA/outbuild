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
});