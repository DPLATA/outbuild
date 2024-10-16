const express = require('express');
const { setupAssociations } = require('./models/associations');

const app = express();
app.use(express.json());

setupAssociations();

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Schedule API' });
});

module.exports = { app };