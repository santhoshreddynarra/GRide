const mongoose = require("mongoose");

// Connect to MongoDB using URI from .env
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log the error but don't crash the server
    console.error(`⚠️  MongoDB not connected: ${error.message}`);
    console.log("💡 Tip: Make sure MongoDB is running or check your MONGO_URI in .env");
  }
};

module.exports = connectDB;
