const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
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
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

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