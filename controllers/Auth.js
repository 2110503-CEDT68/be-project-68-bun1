const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res) => {
  try {
    const { name, telephone, email, password, role } = req.body;

    if (!name || !telephone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    const user = await User.create({
      name,
      telephone,
      email,
      password,
      role
    });

    // ✅ send welcome email (old logic)
    await sendEmail(
      email,
      'Welcome to Hotel Booking!',
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;"><h1 style="margin: 0;">Welcome to Hotel Booking</h1></div><div style="padding: 30px; background-color: #f8f9fa; border: 1px solid #ddd;"><p style="font-size: 16px; color: #333;">Dear <strong>${name}</strong>,</p><p style="font-size: 14px; line-height: 1.6; color: #555;">Thank you for creating an account with Hotel Booking! We're excited to have you on board.</p><p style="font-size: 14px; line-height: 1.6; color: #555;">Your account is now active and ready to use. You can:</p><ul style="font-size: 14px; line-height: 1.8; color: #555;"><li>Browse our extensive collection of premium hotels</li><li>Make reservations and manage your bookings</li><li>Access exclusive member benefits</li></ul><p style="text-align: center; margin: 25px 0;"><a href="https://yourapp.com/dashboard" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a></p><p style="font-size: 14px; line-height: 1.6; color: #555;">If you have any questions, feel free to contact our support team.</p></div><div style="background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d;"><p style="margin: 5px 0;">Hotel Booking © 2026 | All Rights Reserved</p><p style="margin: 5px 0;">Questions? <a href="mailto:support@hotelbooking.com" style="color: #3498db; text-decoration: none;">Contact Support</a></p></div></div>`
    );

    sendTokenResponse(user, 201, res);

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Registration failed"
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    const user = await User.findOne({ email })
      .select("+password +currentToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // ✅ single session logic (new)
    const token = user.getSignedJwtToken();
    user.currentToken = token;
    await user.save({ validateBeforeSave: false });

    // ✅ send login email (old)
    await sendEmail(
      email,
      'New Login to Your Account',
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;"><h1 style="margin: 0;">Login Notification</h1></div><div style="padding: 30px; background-color: #f8f9fa; border: 1px solid #ddd;"><p style="font-size: 16px; color: #333;">Hi <strong>${user.name}</strong>,</p><p style="font-size: 14px; line-height: 1.6; color: #555;">We detected a new login to your Hotel Booking account.</p><div style="background-color: #fff; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0;"><p style="margin: 5px 0; font-size: 14px; color: #555;"><strong>Login Time:</strong> ${new Date().toLocaleString()}</p></div><p style="font-size: 14px; line-height: 1.6; color: #555;"><strong>Was this you?</strong> If you made this login, no action is needed. If this wasn't you, please secure your account immediately.</p><p style="text-align: center; margin: 25px 0;"><a href="https://yourapp.com/security" style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Secure Account</a></p></div><div style="background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d;"><p style="margin: 5px 0;">Hotel Booking © 2026 | All Rights Reserved</p><p style="margin: 5px 0;"><a href="mailto:support@hotelbooking.com" style="color: #3498db; text-decoration: none;">Report Suspicious Activity</a></p></div></div>`
    );


    // ✅ send cookie (old)
    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };

    if (process.env.NODE_ENV === "production") {
      options.secure = true;
    }

    return res
      .status(200)
      .cookie("token", token, options)
      .json({
        success: true,
        token,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          telephone: user.telephone,
          role: user.role
        }
      });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);

  return res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
};

exports.logout = async (req, res) => {

  await User.updateOne(
    { _id: req.user.id },
    { 
      isLoggedIn: false,
      currentToken: null
    }
  );

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

exports.updateUserRole = async (req, res) => {
  try {

    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const sendTokenResponse = (user, statusCode, res, existingToken = null) => {

  const token = existingToken || user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};