const Message  = require("../models/Message");
const Job      = require("../models/jobModel");

// ─── Guard: only participants of an accepted job can chat ─────────────────────
const assertParticipant = async (jobId, userId) => {
  const job = await Job.findById(jobId);
  if (!job) throw Object.assign(new Error("Job not found"), { status: 404 });

  // Must be accepted, in-progress, or completed
  if (!["accepted", "in-progress", "completed"].includes(job.status)) {
    throw Object.assign(new Error("Chat is only available for accepted jobs"), { status: 403 });
  }

  const uid = userId.toString();
  const isProvider = job.createdBy?.toString() === uid;
  const isSeeker   = job.selectedCandidate?.toString() === uid
    || job.applicants?.some(a => a.seeker?.toString() === uid && a.status === "accepted");

  if (!isProvider && !isSeeker) {
    throw Object.assign(new Error("Not authorised to view this chat"), { status: 403 });
  }
  return job;
};

// @route   GET /api/messages/:jobId
// @desc    Fetch all messages for a job
// @access  Protected (participants only)
const getMessages = async (req, res) => {
  try {
    await assertParticipant(req.params.jobId, req.user._id);
    const messages = await Message.find({ jobId: req.params.jobId })
      .populate("senderId", "name")
      .sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// @route   POST /api/messages
// @desc    Send a message
// @access  Protected (participants only)
const sendMessage = async (req, res) => {
  try {
    const { jobId, receiverId, text } = req.body;
    if (!jobId || !receiverId || !text?.trim()) {
      return res.status(400).json({ message: "jobId, receiverId, and text are required" });
    }

    await assertParticipant(jobId, req.user._id);

    const msg = await Message.create({
      jobId,
      senderId:   req.user._id,
      receiverId,
      text:       text.trim(),
    });

    const populated = await msg.populate("senderId", "name");
    res.status(201).json({ message: populated });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { getMessages, sendMessage };
