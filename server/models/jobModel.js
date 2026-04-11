const mongoose = require("mongoose");

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
      enum: ["Electrician", "Plumber", "Carpenter", "Tutor", "Delivery helper", "Other skilled trades", "Other"],
    },
    urgency: {
      type: String,
      required: true,
      enum: ["instant", "part-time", "full-time"],
      default: "part-time",
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    payAmount: {
      type: Number,
      required: [true, "Pay amount is required"],
    },
    payRate: {
      type: String,
      enum: ["hour", "day", "project"],
      default: "hour",
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "filled", "completed"],
      default: "open",
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    applicants: [
      {
        seeker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        appliedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true }
);

// Create compound text index for search functionality
jobSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Job", jobSchema);
