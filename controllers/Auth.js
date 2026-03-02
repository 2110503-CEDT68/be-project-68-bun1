const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res, next) => {
  try {
    const { name, telephone, email, password } = req.body;

    if (!name || !telephone || !email || !password) {
      return res.status(400).json({
        success: false,
        msg: 'Please provide all required fields'
      });
    }

    const user = await User.create({
      name,
      telephone,
      email,
      password
    });

    // Send welcome email
    await sendEmail(
      email,
      'Welcome to Hotel Booking!',
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;"><h1 style="margin: 0;">Welcome to Hotel Booking</h1></div><div style="padding: 30px; background-color: #f8f9fa; border: 1px solid #ddd;"><p style="font-size: 16px; color: #333;">Dear <strong>${name}</strong>,</p><p style="font-size: 14px; line-height: 1.6; color: #555;">Thank you for creating an account with Hotel Booking! We're excited to have you on board.</p><p style="font-size: 14px; line-height: 1.6; color: #555;">Your account is now active and ready to use. You can:</p><ul style="font-size: 14px; line-height: 1.8; color: #555;"><li>Browse our extensive collection of premium hotels</li><li>Make reservations and manage your bookings</li><li>Access exclusive member benefits</li></ul><p style="text-align: center; margin: 25px 0;"><a href="https://yourapp.com/dashboard" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a></p><p style="font-size: 14px; line-height: 1.6; color: #555;">If you have any questions, feel free to contact our support team.</p></div><div style="background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d;"><p style="margin: 5px 0;">Hotel Booking © 2026 | All Rights Reserved</p><p style="margin: 5px 0;">Questions? <a href="mailto:support@hotelbooking.com" style="color: #3498db; text-decoration: none;">Contact Support</a></p></div></div>`
    );

    sendTokenResponse(user, 201, res);

  } catch (err) {
    console.log(err.stack);
    res.status(400).json({ success: false });
  }
};

exports.login=async (req, res, next)=>{
    try {
    const {email, password}=req.body;
    
    if(!email || !password) {
        return res.status (400).json({success:false,msg:'Please provide an email and password'});
    }
    
    const user = await
User.findOne({email}).select('+password');
    if(!user) {
        return res.status (400).json ({success:false,msg:'Invalid credentials'});
    }

    
    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        return res.status(401).json({success:false,msg:'Invalid credentials'});
    }

    // Send login notification email
    await sendEmail(
      email,
      'New Login to Your Account',
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;"><h1 style="margin: 0;">Login Notification</h1></div><div style="padding: 30px; background-color: #f8f9fa; border: 1px solid #ddd;"><p style="font-size: 16px; color: #333;">Hi <strong>${user.name}</strong>,</p><p style="font-size: 14px; line-height: 1.6; color: #555;">We detected a new login to your Hotel Booking account.</p><div style="background-color: #fff; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0;"><p style="margin: 5px 0; font-size: 14px; color: #555;"><strong>Login Time:</strong> ${new Date().toLocaleString()}</p></div><p style="font-size: 14px; line-height: 1.6; color: #555;"><strong>Was this you?</strong> If you made this login, no action is needed. If this wasn't you, please secure your account immediately.</p><p style="text-align: center; margin: 25px 0;"><a href="https://yourapp.com/security" style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Secure Account</a></p></div><div style="background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d;"><p style="margin: 5px 0;">Hotel Booking © 2026 | All Rights Reserved</p><p style="margin: 5px 0;"><a href="mailto:support@hotelbooking.com" style="color: #3498db; text-decoration: none;">Report Suspicious Activity</a></p></div></div>`
    );

    sendTokenResponse(user, 200,res);
    } catch(err) {
        return res.status(401).json({success:false,msg:'Cannot convert email or password to string'});
    }
};


const sendTokenResponse=(user, statusCode, res)=>{
    
    const token=user.getSignedJwtToken();
    const option = {
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),httpOnly: true
    };
    console.log("Test value", process.env.JWT_COOKIE_EXPIRE);
    
    if(process.env.NODE_ENV==='production'){
        option.secure=true;
    }
    res.status(statusCode).cookie('token',token,option).json({
        success: true,
        token,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            telephone: user.telephone,
            role: user.role
        }
    })
}
//At the end of file
//@desc Get current Logged in user
//@route POST /api/vl/auth/me
//@access Private
exports.getMe=async(req, res,next)=>{
    const user=await User.findById(req.user.id);
    res.status (200).json({
        success:true,data:user
    });
};

exports.updateUserRole=async(req,res,next)=>{
    try {
        const { role } = req.body;

        if (!role || !['user','admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid role (user or admin)'
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
                message: `No user with id ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.log(err.stack);
        res.status(400).json({ success: false });
    }
};

exports.logout=async(req,res,next)=>{
    res.cookie('token','none',{
        expires: new Date(Date.now()+ 10*1000),
        httpOnly:true
    });

    res.status(200).json({
        success:true,
        data:{}
    });
};