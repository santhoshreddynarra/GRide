const User = require("../models/User");

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

module.exports = { getProfile, updateProfile };
