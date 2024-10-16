const { app } = require('./index');
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});