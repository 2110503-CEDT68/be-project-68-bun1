// routes/hotels.js
const express = require('express');
const {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel
} = require('../controllers/Hotels');

const { protect, authorize } = require('../middleware/auth');

// Include booking router (ชื่อไฟล์ที่เราใช้คือ routes/booking.js)
const bookingRouter = require('./bookings');

const router = express.Router();

// Re-route -> /hotels/:hotelId/bookings
// booking router must be created with express.Router({ mergeParams: true })
router.use('/:hotelId/bookings', bookingRouter);

// Public: list hotels, Admin: create hotel
router
  .route('/')
  .get(getHotels)
  .post(protect, authorize('admin'), createHotel);

// Single hotel operations
router
  .route('/:id')
  .get(getHotel)
  .put(protect, authorize('admin'), updateHotel)
  .delete(protect, authorize('admin'), deleteHotel);

module.exports = router;