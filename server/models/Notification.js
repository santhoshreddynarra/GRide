const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    message: { type: String, required: true },
    type:    { type: String, enum: ["apply", "accept", "reject", "payment", "review", "badge"], default: "apply" },
    jobId:   { type: mongoose.Schema.Types.ObjectId, ref: "Job", default: null },
    isRead:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
