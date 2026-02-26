const mongoose = require('mongoose');   // ← ต้องมีอันนี้
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// models/User.js (เฉพาะส่วนที่แก้)
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  telephone: {
    type: String,
    required: [true, 'Please add a telephone number']
  },
  email: {
    type: String,
    required: [true,'Please add an email'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please add a valid email'
    ]
  },
  // ... rest same
});

// fix pre save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // ต้อง return เพื่อไม่ให้ hash ซ้ำนะพี่
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});