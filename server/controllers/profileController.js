const User = require("../models/User");
const Job = require("../models/jobModel");
const Rating = require("../models/Rating");

// @route   GET /api/profile/:id
// @desc    Get complete user profile information
// @access  Protected
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   PUT /api/profile/:id
// @desc    Update user profile information
// @access  Protected (Self-only)
const updateProfile = async (req, res) => {
  try {
    // Basic security: A user can only update their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    const { name, email, location, companyName, skills, isOnline } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        location,
        companyName,
        skills,
        isOnline,
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   GET /api/profile/activity
// @desc    Get aggregated user activity history
// @access  Protected
const getActivity = async (req, res) => {
  try {
    const userRole = req.user.role;
    let jobs = [];
    
    if (userRole === "provider") {
      jobs = await Job.find({ createdBy: req.user._id }).sort({ createdAt: -1 }).limit(10);
    } else {
      jobs = await Job.find({ "applicants.seeker": req.user._id }).sort({ createdAt: -1 }).limit(10);
    }

    const ratingsGiven = await Rating.find({ from: req.user._id }).populate("to", "name role").sort({ createdAt: -1 }).limit(10);
    const ratingsReceived = await Rating.find({ to: req.user._id }).populate("from", "name role").sort({ createdAt: -1 }).limit(10);

    // Normalize
    const activityFeed = [];

    jobs.forEach(j => {
      activityFeed.push({
        type: "job",
        id: j._id,
        date: j.createdAt,
        title: userRole === "provider" ? `You posted "${j.title}"` : `You applied to "${j.title}"`,
        meta: j.status
      });
    });

    ratingsGiven.forEach(r => {
      activityFeed.push({
        type: "rating",
        id: r._id,
        date: r.createdAt,
        title: `You gave ${r.to?.name ? r.to.name : 'a user'} a ${r.score}-star rating`,
        meta: r.comment
      });
    });

    ratingsReceived.forEach(r => {
      activityFeed.push({
        type: "rating",
        id: r._id,
        date: r.createdAt,
        title: `${r.from?.name ? r.from.name : 'Someone'} gave you a ${r.score}-star rating`,
        meta: r.comment
      });
    });

    activityFeed.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({ activity: activityFeed.slice(0, 20) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getProfile, updateProfile, getActivity };
