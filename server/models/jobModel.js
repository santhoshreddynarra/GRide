const mongoose = require("mongoose");

/** Stored as lowercase slugs (matches API / easy querying) */
const JOB_CATEGORIES = [
  "plumber",
  "electrician",
  "carpenter",
  "tutor",
  "delivery_helper",
  "other_skilled",
  "other",
];

const applicantSchema = new mongoose.Schema(
  {
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appliedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { _id: true }
);

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: JOB_CATEGORIES,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "createdBy (user id) is required"],
    },
    applicants: {
      type: [applicantSchema],
      default: [],
    },
    /** Kept for instant-claim and filtering */
    urgency: {
      type: String,
      enum: ["instant", "part-time", "full-time"],
      default: "part-time",
    },
    payRate: {
      type: String,
      enum: ["hour", "day", "project"],
      default: "hour",
    },
    status: {
      type: String,
      enum: ["open", "accepted", "in-progress", "filled", "completed"],
      default: "open",
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    /** The seeker accepted by the provider */
    selectedCandidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    /** Set after payment is confirmed */
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    /** Whether provider has reviewed seeker for this job */
    providerReviewed: { type: Boolean, default: false },
    /** Whether seeker has reviewed provider for this job */
    seekerReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", description: "text" });

const legacyJsonTransform = (_doc, ret) => {
  ret.payAmount = ret.price;
  ret.providerId = ret.createdBy;
  return ret;
};

jobSchema.set("toJSON", { virtuals: true, transform: legacyJsonTransform });
jobSchema.set("toObject", { virtuals: true, transform: legacyJsonTransform });

module.exports = mongoose.model("Job", jobSchema);
module.exports.JOB_CATEGORIES = JOB_CATEGORIES;
