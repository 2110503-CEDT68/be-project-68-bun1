const jwt = require('jsonwebtoken');
const User = require('../models/User');


/* =====================================
   🔐 PROTECT ROUTES
===================================== */
exports.protect = async (req, res, next) => {
  let token;

  // ดึง token จาก header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  try {
    // verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ดึง user + currentToken
    const user = await User.findById(decoded.id)
      .select('+currentToken');

    // เช็คว่ามี user และ token ตรงกับใน DB ไหม
    if (!user || user.currentToken !== token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    req.user = user;

    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};


/* =====================================
   🔒 AUTHORIZE ROLES
===================================== */
exports.authorize = (...roles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not allowed`
      });
    }

    next();
  };
};