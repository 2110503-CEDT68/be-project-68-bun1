const User = require('../models/User');

exports.register = async (req, res, next) => {
  try {
    const { name, telephone, email, password, role } = req.body;

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
      password,
      role
    });

    sendTokenResponse(user, 200, res);

  } catch (err) {
    console.log(err.stack);
    res.status(400).json({ success: false });
  }
};

exports.login=async (req, res, next)=>{
    try {
    const {email, password}=req.body;
    //Validate email & password
    if(!email || !password) {
        return res.status (400).json({success:false,msg:'Please provide an email and password'});
    }
    //Check for user
    const user = await
User.findOne({email}).select('+password');
    if(!user) {
        return res.status (400).json ({success:false,msg:'Invalid credentials'});
    }

    //check if password match
    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        return res.status(401).json({success:false,msg:'Invalid credentials'});
    }

    //create token
    //const token = user.getSignedJWTToken();
    //res.status(200).json({success:true,token});
    sendTokenResponse(user, 200,res);
    } catch(err) {
        return res.status(401).json({success:false,msg:'Cannot convert email or password to string'});
    }
};

//Get token from model, create cookie and send response
const sendTokenResponse=(user, statusCode, res)=>{
    //Create token
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
        token
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