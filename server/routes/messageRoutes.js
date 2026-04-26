const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getMessages, sendMessage } = require("../controllers/messageController");

router.use(protect);

router.get("/:jobId", getMessages);  // GET  /api/messages/:jobId
router.post("/",      sendMessage);  // POST /api/messages

module.exports = router;
