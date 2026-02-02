const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/profile", authMiddleware, authController.getUserProfile);
router.put("/profile", authMiddleware, authController.updateProfile);

// Admin only routes
router.get("/users", authMiddleware, adminMiddleware, authController.getAllUsers);
router.delete("/users/:id", authMiddleware, adminMiddleware, authController.deleteUser);

module.exports = router;