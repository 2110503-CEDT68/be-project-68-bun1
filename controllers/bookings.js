const Booking = require('../models/booking');
const Hotel = require('../models/Hotel');

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

    // จำกัดจำนวน booking (ตาม logic เดิมพี่)
    if (existedBookings.length >= 3 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `User ${req.user.id} already has 3 bookings`
      });
    }

    // จำกัดไม่เกิน 3 คืน 💥 (requirement ใหม่)
    if (req.body.nights > 3) {
      return res.status(400).json({
        success: false,
        message: 'Booking up to 3 nights only'
      });
    }

    const booking = await Booking.create(req.body);

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.log(error);
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