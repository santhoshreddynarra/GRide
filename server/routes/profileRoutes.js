const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, getActivity } = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

// All profile routes require authentication
router.use(protect);

router.get("/activity", getActivity);
router.get("/:id", getProfile);
router.put("/:id", updateProfile);

module.exports = router;
