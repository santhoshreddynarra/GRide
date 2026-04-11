const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["provider", "seeker"], // role of the person BEING rated
      required: true,
    }
  },
  { timestamps: true }
);

// Prevent duplicate ratings for the same job from the same user
ratingSchema.index({ from: 1, job: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
