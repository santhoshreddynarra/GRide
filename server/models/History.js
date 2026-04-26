const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    seekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "seekerId is required"],
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    serviceTitle: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "other",
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Completed"],
      default: "Pending",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },
    /** Review tracking — set to true once the respective party submits a review */
    seekerReviewSubmitted: {
      type: Boolean,
      default: false,
    },
    providerReviewSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for fast querying by participant
historySchema.index({ seekerId: 1, createdAt: -1 });
historySchema.index({ providerId: 1, createdAt: -1 });

module.exports = mongoose.model("History", historySchema);
