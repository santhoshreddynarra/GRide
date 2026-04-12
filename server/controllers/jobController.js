const Job = require("../models/jobModel");
const JOB_CATEGORIES = Job.JOB_CATEGORIES;

function normalizeCategory(raw) {
  let s = String(raw || "other")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (s === "other_skilled_trades") s = "other_skilled";
  if (JOB_CATEGORIES.includes(s)) return s;
  return "other";
}

// @route   POST /api/jobs
// @desc    Create a new job (providers only)
// @access  Protected - provider only
const createJob = async (req, res) => {
  try {
    const { title, description, category, urgency, location, payRate } = req.body;
    const priceRaw = req.body.price ?? req.body.payAmount;
    const price = priceRaw !== undefined && priceRaw !== "" ? Number(priceRaw) : NaN;

    if (!title?.trim() || !description?.trim() || !location?.trim()) {
      return res.status(400).json({ message: "Title, description, and location are required" });
    }
    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ message: "Valid price is required" });
    }

    const job = await Job.create({
      title: title.trim(),
      description: description.trim(),
      category: normalizeCategory(category),
      price,
      location: location.trim(),
      createdBy: req.user._id,
      urgency: ["instant", "part-time", "full-time"].includes(urgency) ? urgency : "part-time",
      payRate: ["hour", "day", "project"].includes(payRate) ? payRate : "hour",
    });

    res.status(201).json({ message: "Job posted successfully", job: job.toJSON() });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   GET /api/jobs
// @desc    Get all open jobs (with optional filters)
// @access  Protected
const getJobs = async (req, res) => {
  try {
    const filter = { isOpen: true };
    if (req.query.urgency) filter.urgency = req.query.urgency;
    if (req.query.category && req.query.category !== "All Categories") {
      filter.category = normalizeCategory(req.query.category);
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const jobs = await Job.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ jobs: jobs.map((j) => j.toJSON()) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   GET /api/jobs/my
// @desc    Jobs created by the logged-in provider
// @access  Protected - provider only
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id })
      .populate("applicants.seeker", "name email skills ratings")
      .sort({ createdAt: -1 });
    res.status(200).json({ jobs: jobs.map((j) => j.toJSON()) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   POST /api/jobs/:id/apply
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

    job.applicants.push({ seeker: req.user._id });
    await job.save();
    return res.status(200).json({ message: "Application submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   POST /api/jobs/:id/claim
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

    res.status(200).json({ message: "⚡ Gig claimed instantly!", job: job.toJSON() });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   PUT /api/jobs/:id/accept
const acceptApplicant = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const seekerId = req.params.seekerId || req.body.seekerId;
    const applicant = job.applicants.find((a) => a.seeker.toString() === seekerId);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });

    applicant.status = "accepted";
    job.isOpen = false;
    job.status = "filled";

    await job.save();
    res.status(200).json({ message: "Applicant accepted and job closed", job: job.toJSON() });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   PUT /api/jobs/:id/reject
const rejectApplicant = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const seekerId = req.params.seekerId || req.body.seekerId;
    const applicant = job.applicants.find((a) => a.seeker.toString() === seekerId);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });

    applicant.status = "rejected";
    await job.save();
    res.status(200).json({ message: "Applicant rejected", job: job.toJSON() });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   GET /api/jobs/:id/applications
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "applicants.seeker",
      "name email skills ratings"
    );
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view these applications" });
    }

    res.status(200).json({ applicants: job.applicants });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   PUT /api/jobs/:id/complete
const completeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    job.status = "completed";
    await job.save();

    res.status(200).json({ message: "Job marked as completed. Please rate your partner!", job: job.toJSON() });
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
  completeJob,
};
