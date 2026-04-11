const express = require("express");
const router = express.Router();
const { submitRating } = require("../controllers/ratingController");
const { protect } = require("../middleware/authMiddleware");

// All rating routes require login
router.use(protect);

router.post("/", submitRating); // POST /api/ratings - submit a rating

module.exports = router;
