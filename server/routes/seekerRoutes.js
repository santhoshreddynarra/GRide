const express = require("express");
const router = express.Router();
const {
  getSeekerHistory,
  getSeekerHistoryById,
  getSeekerReviews,
} = require("../controllers/seekerController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// All routes require seeker login
router.use(protect, restrictTo("seeker"));

// GET /api/seeker/history  — all jobs the seeker applied to
router.get("/history", getSeekerHistory);

// GET /api/seeker/history/:id — single job/application detail
router.get("/history/:id", getSeekerHistoryById);

// GET /api/seeker/reviews  — reviews the seeker has written
router.get("/reviews", getSeekerReviews);

module.exports = router;
