const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

// All analytics routes require authentication
router.use(protect);

router.get("/", getAnalytics);

module.exports = router;
