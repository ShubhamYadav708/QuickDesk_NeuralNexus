console.log("server reached success");
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/ticket');

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);


// Protected route test
const verifyToken = require('./middleware/verifyToken');
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ msg: `Hello ${req.user.role}, your ID is ${req.user.id}` });
});

// Serve frontend (optional)
app.use(express.static(path.join(__dirname, 'public')));

const fs = require('fs');
const indexPath = path.join(__dirname, 'public', 'index.html');

app.get('/*', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend not found');
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
