console.log("server reached sucess");
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
require('dotenv').config();

app.use(express.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
