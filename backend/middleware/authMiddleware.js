const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied"
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied"
      });
    }
    
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "foodbridge_secret_key"
    );
    
    // Add user to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }
    
    res.status(401).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only."
    });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };