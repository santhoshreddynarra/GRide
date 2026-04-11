const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is missing from .env");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit gracefully as per requirement
    process.exit(1);
  }
};

module.exports = connectDB;