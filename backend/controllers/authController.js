const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register controller
const register = async (req, res) => {
  try {
    console.log("Register request received:", req.body);
    
    const { name, email, password, phone, address, city, pincode, bio, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "User with this email already exists" 
      });
    }

    // Validate and set role
    let userRole = "donor"; // Default role
    if (role && ["donor", "receiver", "admin"].includes(role)) {
      userRole = role;
    }

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password, // Raw password, will be hashed by pre-save hook
      phone: phone || "",
      address: address || "",
      city: city || "",
      pincode: pincode || "",
      bio: bio || "",
      role: userRole
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET || "foodbridge_secret_key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        pincode: user.pincode,
        bio: user.bio,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: messages.join(', ')
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

// Login controller
const login = async (req, res) => {
  try {
    console.log("Login request received:", req.body);
    
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Create token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET || "foodbridge_secret_key",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        pincode: user.pincode,
        bio: user.bio,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    console.log("Profile request for user ID:", req.user?.id);
    
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, pincode, bio } = req.body;
    
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // Update fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (pincode !== undefined) user.pincode = pincode;
    if (bio !== undefined) user.bio = bio;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        pincode: user.pincode,
        bio: user.bio,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user?.id) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot delete your own account" 
      });
    }
    
    await User.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

// Export all functions
module.exports = {
  register,
  login,
  getUserProfile,
  updateProfile,
  getAllUsers,
  deleteUser
};