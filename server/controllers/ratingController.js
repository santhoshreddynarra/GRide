const Rating = require("../models/Rating");
const User = require("../models/User");
const Job = require("../models/jobModel");

// @route   POST /api/ratings
// @desc    Submit a rating for a partner/provider after job completion
// @access  Protected
const submitRating = async (req, res) => {
  try {
    const { to, job, score, comment, role } = req.body;
    const from = req.user._id;

    // 1. Validate if job exists and is completed
    const jobDoc = await Job.findById(job);
    if (!jobDoc) return res.status(404).json({ message: "Job not found" });
    if (jobDoc.status !== "completed") {
      return res.status(400).json({ message: "Ratings can only be submitted for completed jobs" });
    }

    // 2. Check for duplicate rating
    const existing = await Rating.findOne({ from, job });
    if (existing) return res.status(400).json({ message: "You have already rated this job" });

    // 3. Create Rating
    const rating = await Rating.create({ from, to, job, score, comment, role });

    // 4. Update the Target User's rating average & count
    const targetUser = await User.findById(to);
    if (targetUser) {
      const oldCount = targetUser.ratings.count || 0;
      const oldAvg = targetUser.ratings.average || 0;
      
      const newCount = oldCount + 1;
      const newAvg = ((oldAvg * oldCount) + score) / newCount;

      targetUser.ratings.count = newCount;
      targetUser.ratings.average = parseFloat(newAvg.toFixed(1));
      await targetUser.save();
    }

    res.status(201).json({ message: "Rating submitted successfully", rating });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { submitRating };
