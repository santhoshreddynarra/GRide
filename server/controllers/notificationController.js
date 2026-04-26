const Notification = require("../models/Notification");

// ─── Helpers (called by other controllers) ────────────────────────────────────
/**
 * createNotification({ userId, message, type, jobId })
 * Called internally from job / review / payment controllers.
 * Silent on failure so it never crashes the parent operation.
 */
const createNotification = async ({ userId, message, type = "apply", jobId = null }) => {
  try {
    await Notification.create({ userId, message, type, jobId });
  } catch (err) {
    console.error("[Notification] silent error:", err.message);
  }
};

// @route   GET /api/notifications
// @desc    Get all notifications for the logged-in user (newest first)
// @access  Protected
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   POST /api/notifications
// @desc    Create a notification (internal / admin use)
// @access  Protected
const postNotification = async (req, res) => {
  try {
    const { userId, message, type, jobId } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ message: "userId and message are required" });
    }
    const notif = await Notification.create({ userId, message, type, jobId });
    res.status(201).json({ notification: notif });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PATCH /api/notifications/:id/read
// @desc    Mark a single notification as read
// @access  Protected
const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    res.json({ notification: notif });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PATCH /api/notifications/read-all
// @desc    Mark ALL notifications as read
// @access  Protected
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  postNotification,
  markAsRead,
  markAllAsRead,
};
