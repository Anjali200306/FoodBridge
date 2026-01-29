const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);

// API Documentation Route
app.get("/", (req, res) => {
  res.json({ 
    message: "FoodBridge API Running 🚀",
    version: "2.0.0",
    status: "active",
    time: new Date().toISOString(),
    documentation: {
      public_endpoints: {
        "GET /api/food": "Get all available food (Public Feed)",
        "POST /api/auth/register": "Register new user",
        "POST /api/auth/login": "Login user"
      },
      protected_endpoints: {
        "POST /api/food/create": "Create food donation (Auth Required)",
        "PUT /api/food/claim/:id": "Claim food item (Auth Required)",
        "GET /api/food/my-posts": "Donor dashboard - view your donations",
        "GET /api/food/my-claims": "Receiver dashboard - view your claims",
        "GET /api/auth/profile": "Get user profile"
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    suggestion: "Visit / to see available endpoints"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";
  
  res.status(statusCode).json({ 
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}`);
  console.log("\n🌟 FOODBRIDGE CORE FEATURES:");
  console.log("   ✅ Public Food Feed    - GET /api/food");
  console.log("   ✅ Food Creation       - POST /api/food/create (Auth)");
  console.log("   ✅ Food Claim System   - PUT /api/food/claim/:id (Auth)");
  console.log("   ✅ Donor Dashboard     - GET /api/food/my-posts (Auth)");
  console.log("   ✅ Receiver Dashboard  - GET /api/food/my-claims (Auth)");
  console.log("\n📱 Test with Postman:");
  console.log("   1. Register/Login to get token");
  console.log("   2. View available food: GET /api/food");
  console.log("   3. Create donation: POST /api/food/create");
  console.log("   4. Claim food: PUT /api/food/claim/:id");
  console.log("   5. View dashboards: GET /api/food/my-posts & /api/food/my-claims");
});
app.use(cors({
  origin: "http://localhost:5175", // Vite port
  credentials: true
}));