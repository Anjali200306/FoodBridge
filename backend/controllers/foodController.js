const Food = require("../models/Food");
const User = require("../models/User");

// Get all available food (public feed)
const getAllFood = async (req, res) => {
  try {
    const foods = await Food.find({ status: "available" })
      .populate("donor", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    console.error("Get all food error:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch food" 
    });
  }
};

// Create food (donor action)
const createFood = async (req, res) => {
  try {
    const { title, quantity, location, expiryTime, description, image } = req.body;

    if (!title || !quantity || !location || !expiryTime) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }

    const food = await Food.create({
      title,
      quantity,
      location,
      expiryTime,
      description: description || "",
      image: image || "",
      donor: req.user.id,
      status: "available"
    });

    // Populate donor info for response
    const populatedFood = await Food.findById(food._id)
      .populate("donor", "name email phone");

    res.status(201).json({
      success: true,
      message: "Food posted successfully",
      food: populatedFood
    });
  } catch (error) {
    console.error("Create food error:", error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Claim food (receiver action)
const claimFood = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }
    
    const food = await Food.findById(id)
      .populate("donor", "name email phone");
    
    if (!food) {
      return res.status(404).json({ 
        success: false,
        message: "Food not found" 
      });
    }
    
    // Check if food is available
    if (food.status !== "available") {
      return res.status(400).json({ 
        success: false,
        message: `Food is already ${food.status}` 
      });
    }
    
    // Donor cannot claim their own food
    if (food.donor._id.toString() === req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: "You cannot claim your own food donation" 
      });
    }
    
    // Update food status and set receiver
    food.status = "claimed";
    food.receiver = req.user.id;
    food.claimedAt = new Date();
    
    await food.save();
    
    // Get receiver info
    const receiver = await User.findById(req.user.id).select("name email phone");
    
    // Get updated food with both donor and receiver info
    const updatedFood = await Food.findById(id)
      .populate("donor", "name email phone")
      .populate("receiver", "name email phone");
    
    res.status(200).json({
      success: true,
      message: "Food claimed successfully! Contact the donor to arrange pickup.",
      food: updatedFood,
      donorContact: {
        name: food.donor.name,
        email: food.donor.email,
        phone: food.donor.phone || "Not provided"
      },
      receiverContact: {
        name: receiver.name,
        email: receiver.email,
        phone: receiver.phone || "Not provided"
      }
    });
  } catch (error) {
    console.error("Claim food error:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Error claiming food" 
    });
  }
};

// Donor dashboard - get my posts
const getMyPosts = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }
    
    const foods = await Food.find({ donor: req.user.id })
      .populate("donor", "name email phone")
      .populate("receiver", "name email phone")
      .sort({ createdAt: -1 });
    
    // Calculate statistics
    const totalPosts = foods.length;
    const availablePosts = foods.filter(f => f.status === "available").length;
    const claimedPosts = foods.filter(f => f.status === "claimed").length;
    const reservedPosts = foods.filter(f => f.status === "reserved").length;
    
    res.status(200).json({
      success: true,
      count: totalPosts,
      statistics: {
        total: totalPosts,
        available: availablePosts,
        claimed: claimedPosts,
        reserved: reservedPosts
      },
      foods
    });
  } catch (error) {
    console.error("Get my posts error:", error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Receiver dashboard - get my claims
const getMyClaims = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }
    
    const foods = await Food.find({ 
      receiver: req.user.id,
      status: "claimed"
    })
      .populate("donor", "name email phone address")
      .populate("receiver", "name email phone")
      .sort({ claimedAt: -1 });
    
    // Calculate statistics
    const totalClaims = foods.length;
    
    res.status(200).json({
      success: true,
      count: totalClaims,
      statistics: {
        totalClaims: totalClaims,
        todayClaims: foods.filter(f => {
          const today = new Date();
          const claimDate = new Date(f.claimedAt);
          return claimDate.toDateString() === today.toDateString();
        }).length
      },
      foods
    });
  } catch (error) {
    console.error("Get my claims error:", error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get food by ID
const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }
    
    const food = await Food.findById(id)
      .populate("donor", "name email phone")
      .populate("receiver", "name email phone");
    
    if (!food) {
      return res.status(404).json({ 
        success: false,
        message: "Food not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      food
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update food
const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }
    
    const food = await Food.findById(id);
    
    if (!food) {
      return res.status(404).json({ 
        success: false,
        message: "Food not found" 
      });
    }
    
    // Check if user is the donor
    if (food.donor.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to update this food" 
      });
    }
    
    const updatedFood = await Food.findByIdAndUpdate(id, req.body, { 
      new: true,
      runValidators: true 
    })
    .populate("donor", "name email phone")
    .populate("receiver", "name email phone");
    
    res.status(200).json({
      success: true,
      message: "Food updated successfully",
      food: updatedFood
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Delete food
const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }
    
    const food = await Food.findById(id);
    
    if (!food) {
      return res.status(404).json({ 
        success: false,
        message: "Food not found" 
      });
    }
    
    // Check if user is the donor
    if (food.donor.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to delete this food" 
      });
    }
    
    await Food.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "Food deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get all foods (admin)
const getAllFoodsAuth = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }
    
    const foods = await Food.find()
      .populate("donor", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Export all functions
module.exports = {
  getAllFood,
  createFood,
  claimFood,
  getMyPosts,
  getMyClaims,
  getFoodById,
  updateFood,
  deleteFood,
  getAllFoodsAuth
};