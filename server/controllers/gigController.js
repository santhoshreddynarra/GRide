const Gig = require("../models/Gig");

// @route   POST /api/gigs
// @desc    Create a new gig (provider only)
// @access  Private - provider
const createGig = async (req, res) => {
  try {
    const { title, description, stipend, location, category, payRate } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const gig = await Gig.create({
      title,
      description,
      stipend: stipend || 0,
      location: location || "",
      category: category || "other",
      payRate: payRate || "hour",
      providerId: req.user._id,
    });

    const populated = await gig.populate("providerId", "name email ratings");

    res.status(201).json({
      message: "Gig created successfully",
      gig: populated,
    });
  } catch (error) {
    console.error("CREATE GIG ERROR:", error);
    res.status(500).json({ message: "Server error creating gig", error: error.message });
  }
};

// @route   GET /api/gigs
// @desc    Get all open gigs (seekers see all; providers also see all for browsing)
// @access  Private (any authenticated user)
const getGigs = async (req, res) => {
  try {
    const { keyword, minStipend, maxStipend, location, category } = req.query;
    let filter = {};

    if (keyword) {
      filter.title = { $regex: keyword, $options: "i" };
    }
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }
    if (category && category !== "All") {
      filter.category = category;
    }
    if (minStipend || maxStipend) {
      filter.stipend = {};
      if (minStipend) filter.stipend.$gte = Number(minStipend);
      if (maxStipend) filter.stipend.$lte = Number(maxStipend);
    }

    const gigs = await Gig.find(filter)
      .populate("providerId", "name email ratings location")
      .sort({ createdAt: -1 });

    res.status(200).json({ gigs });
  } catch (error) {
    console.error("GET GIGS ERROR:", error);
    res.status(500).json({ message: "Server error fetching gigs", error: error.message });
  }
};

// @route   GET /api/gigs/my
// @desc    Get gigs posted by the logged-in provider
// @access  Private - provider only
const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ providerId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ gigs });
  } catch (error) {
    console.error("GET MY GIGS ERROR:", error);
    res.status(500).json({ message: "Server error fetching your gigs", error: error.message });
  }
};

// @route   POST /api/gigs/:id/apply
// @desc    Seeker applies to a gig
// @access  Private - seeker only
const applyToGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig || !gig.isOpen) {
      return res.status(404).json({ message: "Gig not found or no longer open" });
    }
    // prevent provider from applying to their own gig
    if (gig.providerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot apply to your own gig" });
    }
    res.status(200).json({ message: "Application sent successfully! The provider will contact you." });
  } catch (error) {
    console.error("APPLY GIG ERROR:", error);
    res.status(500).json({ message: "Server error applying to gig", error: error.message });
  }
};

// @route   PATCH /api/gigs/:id/close
// @desc    Provider closes/removes a gig
// @access  Private - provider only
const closeGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to close this gig' });
    }
    gig.isOpen = false;
    await gig.save();
    res.status(200).json({ message: 'Gig closed successfully' });
  } catch (error) {
    console.error('CLOSE GIG ERROR:', error);
    res.status(500).json({ message: 'Server error closing gig', error: error.message });
  }
};

module.exports = { createGig, getGigs, getMyGigs, applyToGig, closeGig };
