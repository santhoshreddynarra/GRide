const mongoose = require("mongoose");

const historyReviewSchema = new mongoose.Schema(
  {
    historyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "History",
      required: [true, "historyId is required"],
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewerRole: {
      type: String,
      enum: ["seeker", "provider"],
      required: true,
    },
    reviewedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewedUserRole: {
      type: String,
      enum: ["seeker", "provider"],
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false } // using manual createdAt for simplicity
);

// Prevent duplicate: one review per reviewer per history record
historyReviewSchema.index({ historyId: 1, reviewerId: 1 }, { unique: true });

module.exports = mongoose.model("HistoryReview", historyReviewSchema);
