const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", authMiddleware, authController.getUserProfile);

// Add this route to authRoutes.js
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Assuming you have a User model
    const user = await User.findById(req.userId).select('-password');
    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;