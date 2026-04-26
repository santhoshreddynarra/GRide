const Job = require("../models/jobModel");
const Review = require("../models/Review");

/**
 * GET /api/seeker/history
 * Returns every job the seeker applied to, with status info derived from
 * the Job document — no separate History collection needed.
 */
const getSeekerHistory = async (req, res) => {
  try {
    const seekerId = req.user._id;

    // Find all jobs where this seeker appears in the applicants array
    const jobs = await Job.find({ "applicants.seeker": seekerId })
      .populate("createdBy", "name email companyName")
      .populate("selectedCandidate", "name email")
      .sort({ createdAt: -1 });

    const history = jobs.map((job) => {
      const applicant = job.applicants.find(
        (a) => a.seeker?.toString() === seekerId.toString()
      );

      // Derive a friendly status
      let status = "Pending";
      if (job.status === "completed") status = "Completed";
      else if (job.status === "in-progress") status = "In Progress";
      else if (job.status === "accepted" && applicant?.status === "accepted") status = "Accepted";
      else if (applicant?.status === "rejected") status = "Rejected";
      else if (applicant?.status === "accepted") status = "Accepted";

      return {
        _id: job._id,
        serviceTitle: job.title,
        category: job.category,
        location: job.location,
        price: job.price,
        payRate: job.payRate,
        status,
        applicantStatus: applicant?.status || "pending",
        jobStatus: job.status,
        seekerReviewSubmitted: job.seekerReviewed,
        requestedAt: applicant?.appliedAt || job.createdAt,
        completedAt: job.status === "completed" ? job.updatedAt : null,
        provider: job.createdBy
          ? { _id: job.createdBy._id, name: job.createdBy.name, email: job.createdBy.email }
          : null,
      };
    });

    res.status(200).json({ history });
  } catch (error) {
    console.error("getSeekerHistory error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/seeker/history/:id
 * Single job/application detail for a seeker
 */
const getSeekerHistoryById = async (req, res) => {
  try {
    const seekerId = req.user._id;
    const job = await Job.findById(req.params.id)
      .populate("createdBy", "name email companyName ratings")
      .populate("selectedCandidate", "name email");

    if (!job) return res.status(404).json({ message: "Job not found" });

    const applicant = job.applicants.find(
      (a) => a.seeker?.toString() === seekerId.toString()
    );
    if (!applicant) {
      return res.status(403).json({ message: "You did not apply to this job" });
    }

    let status = "Pending";
    if (job.status === "completed") status = "Completed";
    else if (job.status === "in-progress") status = "In Progress";
    else if (job.status === "accepted" && applicant?.status === "accepted") status = "Accepted";
    else if (applicant?.status === "rejected") status = "Rejected";
    else if (applicant?.status === "accepted") status = "Accepted";

    res.status(200).json({
      history: {
        _id: job._id,
        serviceTitle: job.title,
        description: job.description,
        category: job.category,
        location: job.location,
        price: job.price,
        payRate: job.payRate,
        status,
        applicantStatus: applicant.status,
        jobStatus: job.status,
        seekerReviewSubmitted: job.seekerReviewed,
        requestedAt: applicant.appliedAt || job.createdAt,
        completedAt: job.status === "completed" ? job.updatedAt : null,
        provider: job.createdBy,
      },
    });
  } catch (error) {
    console.error("getSeekerHistoryById error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/seeker/reviews
 * All reviews received by the logged-in seeker (reviews about them)
 */
const getSeekerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ receiver: req.user._id })
      .populate("reviewer", "name email role")
      .populate("job", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("getSeekerReviews error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getSeekerHistory, getSeekerHistoryById, getSeekerReviews };
