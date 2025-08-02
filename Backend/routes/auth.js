const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, getUserByEmail } = require('../models/UserModel');
require('dotenv').config();

// Register Route
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  getUserByEmail(email, async (err, user) => {
    if (user) return res.status(409).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    createUser(email, hashedPassword, role || 'user', (err, result) => {
      if (err) return res.status(500).json({ msg: 'Error creating user' });
      res.status(201).json({ msg: 'User registered successfully' });
    });
  });
});

// Login Route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  getUserByEmail(email, async (err, user) => {
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  });
});

module.exports = router;
