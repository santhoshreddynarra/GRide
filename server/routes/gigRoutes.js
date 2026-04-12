const express = require("express");
const router = express.Router();
const { createGig, getGigs } = require("../controllers/gigController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// @route   POST /api/gigs
// @desc    Create gig (provider only)
router.post("/", protect, restrictTo("provider"), createGig);

// @route   GET /api/gigs
// @desc    Get all gigs (public)
router.get("/", getGigs);

module.exports = router;
