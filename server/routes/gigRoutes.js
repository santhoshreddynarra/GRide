const express = require("express");
const router = express.Router();
const { createGig, getGigs, getMyGigs, applyToGig, closeGig } = require("../controllers/gigController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// @route   POST /api/gigs
// @desc    Create gig (provider only)
router.post("/", protect, restrictTo("provider"), createGig);

// @route   GET /api/gigs/my
// @desc    Get only this provider's posted gigs (must be before /:id routes)
router.get("/my", protect, restrictTo("provider"), getMyGigs);

// @route   GET /api/gigs
// @desc    Get all gigs — any authenticated user (seeker OR provider)
router.get("/", protect, getGigs);

// @route   POST /api/gigs/:id/apply
// @desc    Seeker applies to a gig
router.post("/:id/apply", protect, restrictTo("seeker"), applyToGig);

// @route   PATCH /api/gigs/:id/close
// @desc    Provider closes a gig
router.patch("/:id/close", protect, restrictTo("provider"), closeGig);

module.exports = router;
