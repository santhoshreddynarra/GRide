const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  postNotification,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");

router.use(protect);

router.get("/",                    getNotifications);  // GET  /api/notifications
router.post("/",                   postNotification);  // POST /api/notifications
router.patch("/read-all",          markAllAsRead);     // PATCH /api/notifications/read-all
router.patch("/:id/read",          markAsRead);        // PATCH /api/notifications/:id/read

module.exports = router;
