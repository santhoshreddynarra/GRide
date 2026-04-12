const Gig = require("../models/Gig");

// @route   POST /api/gigs
// @desc    Create a new gig (provider only)
// @access  Private
const createGig = async (req, res) => {
  try {
    const { title, description, stipend } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const gig = await Gig.create({
      title,
      description,
      stipend: stipend || 0,
      providerId: req.user._id,
    });

    res.status(201).json({
      message: "Gig created successfully",
      gig,
    });
  } catch (error) {
    console.error("CREATE GIG ERROR:", error);
    res.status(500).json({ message: "Server error creating gig", error: error.message });
  }
};

// @route   GET /api/gigs
// @desc    Get all gigs (with optional filtering)
// @access  Public
const getGigs = async (req, res) => {
  try {
    const { keyword, minStipend, maxStipend } = req.query;
    let filter = {};

    if (keyword) {
      filter.title = { $regex: keyword, $options: "i" };
    }

    if (minStipend || maxStipend) {
      filter.stipend = {};
      if (minStipend) filter.stipend.$gte = Number(minStipend);
      if (maxStipend) filter.stipend.$lte = Number(maxStipend);
    }

    const gigs = await Gig.find(filter)
      .populate("providerId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(gigs);
  } catch (error) {
    console.error("GET GIGS ERROR:", error);
    res.status(500).json({ message: "Server error fetching gigs", error: error.message });
  }
};

module.exports = { createGig, getGigs };
