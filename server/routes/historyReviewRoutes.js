const express = require("express");
const router = express.Router();
const {
  createReview,
  getReviewsAboutMe,
  getMyGivenReviews,
} = require("../controllers/historyReviewController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // all routes require JWT

// POST /api/history-review              — submit a review (seeker or provider)
router.post("/", createReview);

// GET  /api/history-review/about-me     — reviews received by logged-in user
router.get("/about-me", getReviewsAboutMe);

// GET  /api/history-review/my-reviews   — reviews written by logged-in user
router.get("/my-reviews", getMyGivenReviews);

module.exports = router;
