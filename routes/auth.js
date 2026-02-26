// routes/auth.js
const express = require('express');
const { register, login, getMe, logout } = require('../controllers/Auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register user (name, telephone, email, password)
router.post('/register', register);

// Login (email, password)
router.post('/login', login);

// Get current logged-in user
router.get('/me', protect, getMe);

// Logout (clears cookie)
router.get('/logout', protect, logout);

module.exports = router;