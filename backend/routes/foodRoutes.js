const express = require("express");
const router = express.Router();
const foodController = require("../controllers/foodController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.get("/", foodController.getAllFood);  // Public feed - available foods only

// Protected routes
router.post("/create", authMiddleware, foodController.createFood);
router.put("/claim/:id", authMiddleware, foodController.claimFood);

// Dashboard routes
router.get("/my-posts", authMiddleware, foodController.getMyPosts);      // Donor dashboard
router.get("/my-claims", authMiddleware, foodController.getMyClaims);    // Receiver dashboard

// Additional CRUD operations
router.get("/all", authMiddleware, foodController.getAllFoodsAuth);      // All foods (auth)
router.get("/:id", authMiddleware, foodController.getFoodById);
router.put("/:id", authMiddleware, foodController.updateFood);
router.delete("/:id", authMiddleware, foodController.deleteFood);

module.exports = router;