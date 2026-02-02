const express = require("express");
const router = express.Router();
const foodController = require("../controllers/foodController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Public route - get all available food
router.get("/", foodController.getAllFood);

// Protected routes
router.post("/", authMiddleware, foodController.createFood);
router.get("/my-posts", authMiddleware, foodController.getMyPosts);
router.get("/my-claims", authMiddleware, foodController.getMyClaims);
router.get("/:id", authMiddleware, foodController.getFoodById);
router.put("/:id", authMiddleware, foodController.updateFood);
router.delete("/:id", authMiddleware, foodController.deleteFood);
router.post("/:id/claim", authMiddleware, foodController.claimFood);

module.exports = router;