// models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  nights: {
    type: Number,
    required: [true, 'Please add number of nights'],
    min: [1, 'Nights must be at least 1'],
    max: [3, 'Nights can not be more than 3'] // enforce requirement
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);