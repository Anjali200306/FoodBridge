const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ["donor", "receiver", "admin"],
    default: "donor"
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [250, "Bio cannot exceed 250 characters"]
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user statistics
userSchema.virtual('foodsDonated', {
  ref: 'Food',
  localField: '_id',
  foreignField: 'donor',
  count: true
});

userSchema.virtual('foodsClaimed', {
  ref: 'Food',
  localField: '_id',
  foreignField: 'receiver',
  count: true
});

// Index for email search
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);