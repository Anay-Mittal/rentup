const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '', // You can store a URL to the avatar image here
  },
  isAdmin: {
    type: Boolean,
    default: false, // By default, users are not admins
  },
}, { timestamps: true }); // This option adds createdAt and updatedAt timestamps

module.exports = mongoose.model('User', userSchema);
