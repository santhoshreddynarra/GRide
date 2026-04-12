const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// @route   POST /api/register
// @desc    Register a new user
// @access  Public
router.post("/register", register);

// @route   POST /api/login
// @desc    Login user
// @access  Public
router.post("/login", login);

// @route   GET /api/me
// @desc    Get current logged-in user
// @access  Private (requires JWT)
router.get("/me", protect, getMe);

module.exports = router;