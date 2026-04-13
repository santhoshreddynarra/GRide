const express = require("express");
const router = express.Router();
const { createReview, getJobReviews, getUserReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// POST /api/reviews — submit a review
router.post("/", createReview);

// GET /api/reviews/job/:jobId — reviews for a job
router.get("/job/:jobId", getJobReviews);

// GET /api/reviews/user/:userId — reviews received by a user
router.get("/user/:userId", getUserReviews);

module.exports = router;
