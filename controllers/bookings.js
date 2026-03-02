const Booking = require('../models/booking');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

exports.getBookings = async (req, res, next) => {
  let query;

  if (req.user.role !== 'admin') {
    query = Booking.find({ user: req.user.id }).populate({
      path: 'hotel',
      select: 'name address tel'
    });
  } else {
    if (req.params.hotelId) {
      query = Booking.find({ hotel: req.params.hotelId }).populate({
        path: 'hotel',
        select: 'name address tel'
      });
    } else {
      query = Booking.find().populate({
        path: 'hotel',
        select: 'name address tel'
      });
    }
  }

  try {
    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Cannot find Bookings"
    });
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'hotel',
      select: 'name address tel'
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Cannot find Booking"
    });
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    req.body.hotel = req.params.hotelId;

    const hotel = await Hotel.findById(req.params.hotelId);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `No hotel with id ${req.params.hotelId}`
      });
    }

    req.body.user = req.user.id;

    const existedBookings = await Booking.find({ user: req.user.id });

    if (existedBookings.length >= 3 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `User ${req.user.id} already has 3 bookings`
      });
    }
// ??

    if (req.body.nights > 3) {
      return res.status(400).json({
        success: false,
        message: 'Booking up to 3 nights only'
      });
    }

    const booking = await Booking.create(req.body);

    // Send booking confirmation email
    const user = await User.findById(req.user.id);
    if (user) {
      await sendEmail(
        user.email,
        'Booking Confirmed - Your Reservation is Secure',
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background-color: #27ae60; color: white; padding: 20px; text-align: center;"><h1 style="margin: 0;">✓ Booking Confirmed</h1></div><div style="padding: 30px; background-color: #f8f9fa; border: 1px solid #ddd;"><p style="font-size: 16px; color: #333;">Dear <strong>${user.name}</strong>,</p><p style="font-size: 14px; line-height: 1.6; color: #555;">Your reservation has been successfully confirmed! We're delighted to welcome you.</p><div style="background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;"><h3 style="margin-top: 0; color: #2c3e50;">Reservation Details</h3><table style="width: 100%; font-size: 14px; color: #333;"><tr style="border-bottom: 1px solid #bdc3c7;"><td style="padding: 10px 0;"><strong>Hotel:</strong></td><td style="padding: 10px 0;">${hotel.name}</td></tr><tr style="border-bottom: 1px solid #bdc3c7;"><td style="padding: 10px 0;"><strong>Address:</strong></td><td style="padding: 10px 0;">${hotel.address}</td></tr><tr style="border-bottom: 1px solid #bdc3c7;"><td style="padding: 10px 0;"><strong>Check-in Date:</strong></td><td style="padding: 10px 0;">${new Date(req.body.startDate).toLocaleDateString('en-US', {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'})}</td></tr><tr><td style="padding: 10px 0;"><strong>Number of Nights:</strong></td><td style="padding: 10px 0;">${req.body.nights} night${req.body.nights > 1 ? 's' : ''}</td></tr></table></div><p style="font-size: 14px; line-height: 1.6; color: #555;">A confirmation email with check-in instructions will be sent 24 hours before your arrival.</p><p style="text-align: center; margin: 25px 0;"><a href="https://yourapp.com/bookings" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Booking</a></p><p style="font-size: 13px; line-height: 1.6; color: #7f8c8d;">Thank you for choosing Hotel Booking. We look forward to providing you with an exceptional stay!</p></div><div style="background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d;"><p style="margin: 5px 0;">Hotel Booking © 2026 | All Rights Reserved</p><p style="margin: 5px 0;">Need help? <a href="mailto:support@hotelbooking.com" style="color: #3498db; text-decoration: none;">Contact Support</a></p></div></div>`
      );
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.log(error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: "Cannot create Booking"
    });
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with id ${req.params.id}`
      });
    }

    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} not authorized`
      });
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Send booking update email
    const updatedBooking = await Booking.findById(req.params.id).populate('hotel');
    const user = await User.findById(req.user.id);
    if (user && updatedBooking) {
      await sendEmail(
        user.email,
        'Booking Updated Successfully',
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background-color: #3498db; color: white; padding: 20px; text-align: center;"><h1 style="margin: 0;">Booking Updated</h1></div><div style="padding: 30px; background-color: #f8f9fa; border: 1px solid #ddd;"><p style="font-size: 16px; color: #333;">Hi <strong>${user.name}</strong>,</p><p style="font-size: 14px; line-height: 1.6; color: #555;">Your reservation${updatedBooking.hotel ? ' at <strong>' + updatedBooking.hotel.name + '</strong>' : ''} has been successfully updated.</p><div style="background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;"><h3 style="margin-top: 0; color: #2c3e50;">Updated Details</h3><table style="width: 100%; font-size: 14px; color: #333;"><tr style="border-bottom: 1px solid #bdc3c7;"><td style="padding: 10px 0;"><strong>Check-in Date:</strong></td><td style="padding: 10px 0;">${new Date(updatedBooking.startDate).toLocaleDateString('en-US', {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'})}</td></tr><tr><td style="padding: 10px 0;"><strong>Number of Nights:</strong></td><td style="padding: 10px 0;">${updatedBooking.nights} night${updatedBooking.nights > 1 ? 's' : ''}</td></tr></table></div><p style="font-size: 13px; line-height: 1.6; color: #7f8c8d;">If you did not make this change or have any questions, please contact our support team immediately.</p><p style="text-align: center; margin: 25px 0;"><a href="https://yourapp.com/bookings" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Booking</a></p></div><div style="background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d;"><p style="margin: 5px 0;">Hotel Booking © 2026 | All Rights Reserved</p><p style="margin: 5px 0;">Questions? <a href="mailto:support@hotelbooking.com" style="color: #3498db; text-decoration: none;">Contact Support</a></p></div></div>`
      );
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Cannot update Booking"
    });
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with id ${req.params.id}`
      });
    }

    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} not authorized`
      });
    }

    // Send booking cancellation email before deleting
    const populatedBooking = await Booking.findById(req.params.id).populate('hotel');
    const user = await User.findById(req.user.id);
    if (user && populatedBooking) {
      await sendEmail(
        user.email,
        'Booking Cancellation Confirmation',
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background-color: #e74c3c; color: white; padding: 20px; text-align: center;"><h1 style="margin: 0;">Booking Cancelled</h1></div><div style="padding: 30px; background-color: #f8f9fa; border: 1px solid #ddd;"><p style="font-size: 16px; color: #333;">Hi <strong>${user.name}</strong>,</p><p style="font-size: 14px; line-height: 1.6; color: #555;">Your reservation${populatedBooking.hotel ? ' at <strong>' + populatedBooking.hotel.name + '</strong>' : ''} has been cancelled.</p><div style="background-color: #fff3cd; border-left: 4px solid #f39c12; padding: 15px; margin: 20px 0;"><p style="margin: 0; font-size: 13px; color: #856404;"><strong>⚠️ Important:</strong> If you did not request this cancellation, please contact our support team immediately to secure your account.</p></div><p style="text-align: center; margin: 25px 0;"><a href="https://yourapp.com/support" style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Report Issue</a></p><p style="font-size: 13px; line-height: 1.6; color: #555;">We're sorry to see you go. If you'd like to rebook, we offer flexible reservation options.</p></div><div style="background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d;"><p style="margin: 5px 0;">Hotel Booking © 2026 | All Rights Reserved</p><p style="margin: 5px 0;">Urgent? <a href="mailto:support@hotelbooking.com" style="color: #e74c3c; font-weight: bold; text-decoration: none;">Contact Support</a></p></div></div>`
      );
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Cannot delete Booking"
    });
  }
};
