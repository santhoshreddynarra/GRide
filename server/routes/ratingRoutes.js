const express = require("express");
const router = express.Router();
const { submitRating, getMyRatings } = require("../controllers/ratingController");
const { protect } = require("../middleware/authMiddleware");

// All rating routes require login
router.use(protect);

router.post("/", submitRating); // POST /api/ratings - submit a rating
router.get("/me", getMyRatings); // GET /api/ratings/me - get my received ratings

module.exports = router;
