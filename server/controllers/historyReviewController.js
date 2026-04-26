const HistoryReview = require("../models/HistoryReview");
const History = require("../models/History");
const User = require("../models/User");

// ── POST /api/history-review — submit a review ────────────────────────────────
const createReview = async (req, res) => {
  try {
    const { historyId, rating, comment } = req.body;

    if (!historyId || !rating) {
      return res.status(400).json({ message: "historyId and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const record = await History.findById(historyId)
      .populate("seekerId", "name email")
      .populate("providerId", "name email");

    if (!record) return res.status(404).json({ message: "History record not found" });
    if (record.status !== "Completed") {
      return res.status(400).json({ message: "Reviews can only be submitted for Completed records" });
    }

    const uid = req.user._id.toString();
    const seekerId = record.seekerId?._id?.toString();
    const providerId = record.providerId?._id?.toString();

    const isSeeker = uid === seekerId;
    const isProvider = uid === providerId;

    if (!isSeeker && !isProvider) {
      return res.status(403).json({ message: "You are not part of this history record" });
    }

    // Duplicate check
    if (isSeeker && record.seekerReviewSubmitted) {
      return res.status(400).json({ message: "You have already reviewed the provider for this record" });
    }
    if (isProvider && record.providerReviewSubmitted) {
      return res.status(400).json({ message: "You have already reviewed the seeker for this record" });
    }

    const reviewedUserId = isSeeker ? providerId : seekerId;
    const reviewerRole   = isSeeker ? "seeker" : "provider";
    const reviewedUserRole = isSeeker ? "provider" : "seeker";

    if (!reviewedUserId) {
      return res.status(400).json({ message: `No ${reviewedUserRole} linked to this record` });
    }

    // Save review
    const review = await HistoryReview.create({
      historyId: record._id,
      reviewerId: uid,
      reviewerRole,
      reviewedUserId,
      reviewedUserRole,
      rating,
      comment: comment?.trim() || "",
    });

    // Update review flag on history record
    if (isSeeker) record.seekerReviewSubmitted = true;
    else record.providerReviewSubmitted = true;
    await record.save();

    // Update reviewed user's overall rating average
    const allReviews = await HistoryReview.find({ reviewedUserId });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(reviewedUserId, {
      "ratings.average": Math.round(avg * 10) / 10,
      "ratings.count": allReviews.length,
    });

    res.status(201).json({
      message: "Review submitted successfully",
      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already submitted a review for this record" });
    }
    console.error("createReview (history):", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── GET /api/history-review/about-me — reviews received by logged-in user ─────
const getReviewsAboutMe = async (req, res) => {
  try {
    const reviews = await HistoryReview.find({ reviewedUserId: req.user._id })
      .populate("reviewerId", "name email role")
      .populate("historyId", "serviceTitle status completedAt")
      .sort({ createdAt: -1 });
    res.status(200).json({ reviews });
  } catch (err) {
    console.error("getReviewsAboutMe:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── GET /api/history-review/my-reviews — reviews written by logged-in user ────
const getMyGivenReviews = async (req, res) => {
  try {
    const reviews = await HistoryReview.find({ reviewerId: req.user._id })
      .populate("reviewedUserId", "name email role")
      .populate("historyId", "serviceTitle status completedAt")
      .sort({ createdAt: -1 });
    res.status(200).json({ reviews });
  } catch (err) {
    console.error("getMyGivenReviews:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createReview, getReviewsAboutMe, getMyGivenReviews };
