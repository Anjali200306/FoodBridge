const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    quantity: {
      type: String,
      required: [true, "Quantity is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    expiryTime: {
      type: String,
      required: [true, "Expiry time is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: ""
    },
    image: {
      type: String,
      default: ""
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Donor is required"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: {
        values: ["available", "reserved", "claimed"],
        message: '{VALUE} is not a valid status'
      },
      default: "available",
    },
    claimedAt: {
      type: Date,
    },
    pickupTime: {
      type: String,
      trim: true,
    },
    pickupLocation: {
      type: String,
      trim: true,
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [200, "Special instructions cannot exceed 200 characters"]
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for days until expiry (if needed)
foodSchema.virtual('isExpired').get(function() {
  // You can implement expiry logic here if needed
  return false;
});

// Indexes for better performance
foodSchema.index({ status: 1, createdAt: -1 });         // For public feed
foodSchema.index({ donor: 1, createdAt: -1 });          // For donor dashboard
foodSchema.index({ receiver: 1, claimedAt: -1 });       // For receiver dashboard
foodSchema.index({ location: "text", title: "text" });  // For search functionality

module.exports = mongoose.model("Food", foodSchema);