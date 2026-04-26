const Review = require("../models/Review");
const Job = require("../models/jobModel");
const User = require("../models/User");

/**
 * POST /api/reviews
 * Submit a review after job completion
 */
const createReview = async (req, res) => {
  try {
    const { jobId, rating, comment } = req.body;

    if (!jobId || !rating) {
      return res.status(400).json({ message: "jobId and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const job = await Job.findById(jobId)
      .populate("createdBy", "name email")
      .populate("selectedCandidate", "name email");

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.status !== "completed") {
      return res.status(400).json({ message: "Can only review after job is completed" });
    }

    const reviewerId = req.user._id.toString();
    const providerId = job.createdBy._id.toString();
    const seekerId = job.selectedCandidate?._id?.toString();

    // Determine who is reviewing whom
    let receiverId;
    let isProvider = reviewerId === providerId;
    let isSeeker = reviewerId === seekerId;

    if (!isProvider && !isSeeker) {
      return res.status(403).json({ message: "You are not part of this job" });
    }

    // Check duplicate
    if (isProvider && job.providerReviewed) {
      return res.status(400).json({ message: "You have already reviewed the seeker for this job" });
    }
    if (isSeeker && job.seekerReviewed) {
      return res.status(400).json({ message: "You have already reviewed the provider for this job" });
    }

    receiverId = isProvider ? seekerId : providerId;
    if (!receiverId) {
      return res.status(400).json({ message: "Cannot determine review receiver" });
    }

    // Create review
    const review = await Review.create({
      job: job._id,
      reviewer: reviewerId,
      receiver: receiverId,
      rating,
      comment: comment?.trim() || "",
    });

    // Mark reviewed flag on job
    if (isProvider) job.providerReviewed = true;
    else job.seekerReviewed = true;
    await job.save();

    // Update receiver's average rating
    const allReviews = await Review.find({ receiver: receiverId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(receiverId, {
      "ratings.average": Math.round(avgRating * 10) / 10,
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
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already submitted a review for this job" });
    }
    console.error("createReview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/reviews/job/:jobId
 * Get all reviews for a job
 */
const getJobReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ job: req.params.jobId })
      .populate("reviewer", "name role")
      .populate("receiver", "name role")
      .sort({ createdAt: -1 });
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/reviews/user/:userId
 * Get all reviews received by a user
 */
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ receiver: req.params.userId })
      .populate("reviewer", "name role")
      .populate("job", "title")
      .sort({ createdAt: -1 });
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/reviews/about-me
 * Get all reviews received by the currently logged-in user
 */
const getMyReceivedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ receiver: req.user._id })
      .populate("reviewer", "name role")
      .populate("job", "title")
      .sort({ createdAt: -1 });
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createReview, getJobReviews, getUserReviews, getMyReceivedReviews };
