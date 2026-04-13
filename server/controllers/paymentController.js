const Payment = require("../models/Payment");
const Job = require("../models/jobModel");

/**
 * POST /api/payments
 * Simulate a payment — creates a Payment record and moves job to "in-progress"
 */
const createPayment = async (req, res) => {
  try {
    const { jobId, seekerId } = req.body;

    // Only providers can pay
    if (req.user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can initiate payments" });
    }

    const job = await Job.findById(jobId).populate("createdBy", "name email");
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized — you did not create this job" });
    }

    if (!["accepted"].includes(job.status)) {
      return res.status(400).json({ message: "Can only pay for accepted jobs" });
    }

    if (job.paymentId) {
      return res.status(400).json({ message: "Payment already made for this job" });
    }

    // Simulate payment — create record
    const payment = await Payment.create({
      job: job._id,
      provider: req.user._id,
      seeker: seekerId || job.selectedCandidate,
      amount: job.price,
      status: "paid",
    });

    // Advance job to in-progress
    job.status = "in-progress";
    job.paymentId = payment._id;
    await job.save();

    res.status(201).json({
      message: "Payment successful! Job is now in-progress.",
      payment: {
        _id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        paidAt: payment.paidAt,
      },
      job: job.toJSON(),
    });
  } catch (error) {
    console.error("createPayment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/payments/job/:jobId
 * Get payment details for a specific job
 */
const getPaymentForJob = async (req, res) => {
  try {
    const payment = await Payment.findOne({ job: req.params.jobId })
      .populate("provider", "name email")
      .populate("seeker", "name email");
    if (!payment) return res.status(404).json({ message: "No payment found for this job" });
    res.status(200).json({ payment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createPayment, getPaymentForJob };
