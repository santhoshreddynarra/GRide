const mongoose = require("mongoose");

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Name is mandatory
    },

    email: {
      type: String,
      required: true, // Email is mandatory
      unique: true,   // No two users can have the same email
    },

    password: {
      type: String,
      required: true, // Password is mandatory
    },

    role: {
      type: String,
      enum: ["provider", "worker"], // Only these two values are allowed
      default: "worker",            // Default role is worker
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Create and export the User model
const User = mongoose.model("User", userSchema);
module.exports = User;
