const mongoose = require("mongoose");

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    stipend: {
      type: Number,
      default: 0,
    },
    payRate: {
      type: String,
      enum: ["hour", "day", "project"],
      default: "hour",
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "other",
      trim: true,
    },
    mobileNumber: {
      type: String,
      default: "",
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gig", gigSchema);
