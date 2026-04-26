const express = require("express");
const router = express.Router();
const {
  getSeekerHistory,
  getProviderHistory,
  getHistoryById,
  createHistory,
  updateHistoryStatus,
} = require("../controllers/historyController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.use(protect); // all routes require JWT

// GET  /api/history/seeker   — seeker views their history
router.get("/seeker", restrictTo("seeker"), getSeekerHistory);

// GET  /api/history/provider — provider views their history
router.get("/provider", restrictTo("provider"), getProviderHistory);

// GET  /api/history/:id      — either party views a single record
router.get("/:id", getHistoryById);

// POST /api/history          — provider (or admin) creates a history record
router.post("/", restrictTo("provider"), createHistory);

// PUT  /api/history/:id/status — provider updates status (e.g. → Completed)
router.put("/:id/status", restrictTo("provider"), updateHistoryStatus);

module.exports = router;
