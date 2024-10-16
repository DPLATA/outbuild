// In your routes file (e.g., routes/schedules.js)
const express = require('express');
const router = express.Router();
const User = require('../models/user');  // Adjust the path as needed
const Activity = require('../models/activity');  // Adjust the path as needed
const Schedule = require('../models/schedule');  // Adjust the path as needed

router.post('/', async (req, res) => {
  try {
    const { userId, name, imageUrl } = req.body;

    // Check if all required fields are present
    if (!userId || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create the schedule
    const schedule = await Schedule.create({
      userId,
      name,
      imageUrl
    });

    res.status(201).json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;