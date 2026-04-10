// ============================================================
// GigRide Backend - Entry Point
// ============================================================

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables from .env file
dotenv.config();

const app = express();

// ---- Middleware ----
app.use(cors());              // Allow cross-origin requests (React frontend)
app.use(express.json());      // Parse incoming JSON request bodies

// ---- Test Route ----
app.get("/", (req, res) => {
  res.json({ message: "🚀 GigRide Backend is Running!" });
});

// ---- Start Server ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});