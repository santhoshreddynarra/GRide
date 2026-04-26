const History = require("../models/History");

// ── GET /api/history/seeker ───────────────────────────────────────────────────
const getSeekerHistory = async (req, res) => {
  try {
    const history = await History.find({ seekerId: req.user._id })
      .populate("providerId", "name email companyName ratings")
      .sort({ createdAt: -1 });
    res.status(200).json({ history });
  } catch (err) {
    console.error("getSeekerHistory:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── GET /api/history/provider ─────────────────────────────────────────────────
const getProviderHistory = async (req, res) => {
  try {
    const history = await History.find({ providerId: req.user._id })
      .populate("seekerId", "name email skills ratings")
      .sort({ createdAt: -1 });
    res.status(200).json({ history });
  } catch (err) {
    console.error("getProviderHistory:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── GET /api/history/:id ──────────────────────────────────────────────────────
const getHistoryById = async (req, res) => {
  try {
    const record = await History.findById(req.params.id)
      .populate("seekerId", "name email skills ratings")
      .populate("providerId", "name email companyName ratings");

    if (!record) return res.status(404).json({ message: "History record not found" });

    const uid = req.user._id.toString();
    const isSeeker = record.seekerId?._id?.toString() === uid;
    const isProvider = record.providerId?._id?.toString() === uid;

    if (!isSeeker && !isProvider) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ history: record });
  } catch (err) {
    console.error("getHistoryById:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── POST /api/history — create a history record (provider initiates) ──────────
const createHistory = async (req, res) => {
  try {
    const { seekerId, serviceTitle, description, category, price, status } = req.body;
    if (!serviceTitle) return res.status(400).json({ message: "serviceTitle is required" });

    const record = await History.create({
      seekerId: seekerId || null,
      providerId: req.user._id,
      serviceTitle: serviceTitle.trim(),
      description: description?.trim() || "",
      category: category || "other",
      price: price || null,
      status: status || "Pending",
    });
    res.status(201).json({ message: "History record created", history: record });
  } catch (err) {
    console.error("createHistory:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── PUT /api/history/:id/status — update status ───────────────────────────────
const updateHistoryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Accepted", "Rejected", "Completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(", ")}` });
    }

    const record = await History.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "History record not found" });

    const uid = req.user._id.toString();
    if (record.providerId?.toString() !== uid) {
      return res.status(403).json({ message: "Only the provider can update status" });
    }

    record.status = status;
    if (status === "Completed") record.completedAt = new Date();
    await record.save();

    res.status(200).json({ message: "Status updated", history: record });
  } catch (err) {
    console.error("updateHistoryStatus:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getSeekerHistory,
  getProviderHistory,
  getHistoryById,
  createHistory,
  updateHistoryStatus,
};
