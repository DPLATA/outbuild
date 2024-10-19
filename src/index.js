const express = require('express');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { setupAssociations } = require('./models/associations');

const app = express();
app.use(express.json());

setupAssociations();

app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    body: req.body,
    params: req.params,
    query: req.query
  });
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Schedule API' });
});


const scheduleRoutes = require('./routes/schedules');
app.use('/schedules', scheduleRoutes);

app.use(errorHandler);

module.exports = { app };