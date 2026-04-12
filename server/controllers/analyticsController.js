const Job = require("../models/jobModel");

// @route   GET /api/analytics
// @desc    Get dynamic financial and metric calculations for the logged-in user
// @access  Protected
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const role = req.user.role;

    // Fetch jobs associated with user
    const jobs = await Job.find({
      $or: [{ createdBy: req.user._id }, { "applicants.seeker": req.user._id }],
    }).sort({ createdAt: -1 });

    let totalAmount = 0;
    let completedGigs = 0;
    let pendingGigs = 0;
    const transactions = [];

    if (role === "provider") {
      // Loop through jobs to calculate SPENT amount and active gigs
      for (const job of jobs) {
        if (job.createdBy.toString() === userId) {
          const hasAccepted = job.applicants.some((a) => a.status === "accepted");
          if (!job.isOpen || hasAccepted) {
            totalAmount += job.price || 0;
            completedGigs++;
            transactions.push(job);
          } else {
            pendingGigs++;
          }
        }
      }
    } else {
      // Loop through jobs to calculate EARNED amount and applied gigs
      for (const job of jobs) {
        const myApplication = job.applicants.find(a => a.seeker.toString() === userId);
        if (myApplication) {
          if (
            myApplication.status === "accepted" ||
            (!job.isOpen && myApplication.status !== "rejected" && job.urgency === "instant")
          ) {
            totalAmount += job.price || 0;
            completedGigs++;
            transactions.push(job);
          } else if (job.isOpen) {
            pendingGigs++;
          }
        }
      }
    }

    res.status(200).json({
      role,
      financialTotal: totalAmount,
      metrics: {
        completed: completedGigs,
        pending: pendingGigs
      },
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAnalytics };
