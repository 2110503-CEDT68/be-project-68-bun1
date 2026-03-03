const User = require('../models/User');

// @desc Register
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 200, res);
};

// @desc Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // 2️⃣ Find user (include password + currentToken)
    const user = await User.findOne({ email })
      .select("+password +currentToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // 3️⃣ Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // 4️⃣ Generate new token (ALWAYS replace old one)
    const token = user.getSignedJwtToken();

    // 5️⃣ Save new token (overwrite old session)
    user.currentToken = token;
    await user.save({ validateBeforeSave: false });

    // 6️⃣ Send response
    return res.status(200).json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
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

// @desc Get current logged in user
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
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

// @desc Logout
exports.logout = async (req, res) => {

  await User.updateOne(
    { _id: req.user.id },
    { isLoggedIn: false }
  );

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc Update user role (Admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    // เช็คว่ามี role ส่งมาหรือไม่
    if (!req.body.role) {
      return res.status(400).json({
        success: false,
        message: "Role is required"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Helper function
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
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