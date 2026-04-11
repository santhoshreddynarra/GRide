const Job = require("../models/jobModel");

// @route   POST /api/jobs
// @desc    Create a new job posting (providers only)
// @access  Protected - provider only
const createJob = async (req, res) => {
  try {
    const { title, description, category, urgency, location, payAmount, payRate } = req.body;

    const job = await Job.create({
      title,
      description,
      category,
      urgency,
      location,
      payAmount,
      payRate,
      providerId: req.user._id,
    });

    res.status(201).json({ message: "Job posted successfully", job });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   GET /api/jobs
// @desc    Get all open jobs (seekers browse), with optional fuzzy search
// @access  Protected
const getJobs = async (req, res) => {
  try {
    const filter = { isOpen: true };
    if (req.query.urgency) filter.urgency = req.query.urgency;
    if (req.query.category && req.query.category !== "All Categories") filter.category = req.query.category;
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const jobs = await Job.find(filter)
      .populate("providerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   GET /api/jobs/my
// @desc    Get all jobs posted by the logged-in provider
// @access  Protected - provider only
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ providerId: req.user._id })
      .populate("applicants.seeker", "name email skills ratings")
      .sort({ createdAt: -1 });
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   POST /api/jobs/:id/apply
// @desc    Apply to a job (seekers only)
// @access  Protected - seeker only
const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || !job.isOpen) {
      return res.status(404).json({ message: "Job not found or closed" });
    }

    const alreadyApplied = job.applicants.find(
      (a) => a.seeker.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied to this job" });
    }

    // Regular gig: standard application
    job.applicants.push({ seeker: req.user._id });
    await job.save();
    return res.status(200).json({ message: "Application submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   POST /api/jobs/:id/claim
// @desc    Instantly claim an urgent gig (Seekers only)
// @access  Protected - seeker only
const claimJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || !job.isOpen || job.urgency !== "instant") {
      return res.status(404).json({ message: "Instant gig not found or already closed" });
    }

    job.applicants.push({ seeker: req.user._id, status: "accepted" });
    job.isOpen = false;
    job.status = "filled"; 
    await job.save();

    res.status(200).json({ message: "⚡ Gig claimed instantly!", job });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   PUT /api/jobs/:id/accept
// @desc    Accept a specific applicant
// @access  Protected - provider only
const acceptApplicant = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const seekerId = req.params.seekerId || req.body.seekerId;
    const applicant = job.applicants.find(a => a.seeker.toString() === seekerId);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });

    applicant.status = "accepted";
    job.isOpen = false; 
    job.status = "filled"; 

    await job.save();
    res.status(200).json({ message: "Applicant accepted and job closed", job });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   PUT /api/jobs/:id/reject
// @desc    Reject a specific applicant
// @access  Protected - provider only
const rejectApplicant = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const seekerId = req.params.seekerId || req.body.seekerId;
    const applicant = job.applicants.find(a => a.seeker.toString() === seekerId);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });

    applicant.status = "rejected";
    await job.save();
    res.status(200).json({ message: "Applicant rejected", job });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   GET /api/jobs/:id/applications
// @desc    Get detailed application list (Provider only)
// @access  Protected - provider only
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("applicants.seeker", "name email skills ratings");
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view these applications" });
    }

    res.status(200).json({ applicants: job.applicants });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   PUT /api/jobs/:id/complete
// @desc    Mark a job as finished (Provider only)
// @access  Protected - provider only
const completeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    job.status = "completed";
    await job.save();

    res.status(200).json({ message: "Job marked as completed. Please rate your partner!", job });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { 
  createJob, 
  getJobs, 
  getMyJobs, 
  applyToJob, 
  claimJob, 
  acceptApplicant, 
  rejectApplicant, 
  getJobApplications, 
  completeJob 
};
