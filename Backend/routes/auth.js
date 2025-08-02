const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, getUserByEmail } = require('../models/UserModel');
require('dotenv').config();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  // Check if user already exists
  getUserByEmail(email, async (err, user) => {
    if (err) return res.status(500).json({ msg: 'Database error' });
    if (user) return res.status(409).json({ msg: 'User already exists' });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      createUser(email, hashedPassword, role || 'user', (err, result) => {
        if (err) return res.status(500).json({ msg: 'Error creating user' });
        return res.status(201).json({ msg: 'User registered successfully' });
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: 'Error hashing password' });
    }
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  getUserByEmail(email, async (err, user) => {
    if (err) return res.status(500).json({ msg: 'Database error' });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.json({
        msg: 'Login successful',
        token,
        email: user.email,
        role: user.role,
        fullName: user.full_name || ''
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: 'Error verifying password' });
    }
  });
});

module.exports = router;
