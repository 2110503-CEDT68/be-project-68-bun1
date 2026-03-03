const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// USER ROUTE
router.get(
  '/user-data',
  protect,
  authorize('user'),
  (req, res) => {
    res.json({ message: 'User content' });
  }
);

// ADMIN ROUTE
router.get(
  '/admin-data',
  protect,
  authorize('admin'),
  (req, res) => {
    res.json({ message: 'Admin content' });
  }
);

module.exports = router;