import React, { useState } from "react";
import { Star, X, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import axios from "axios";

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("gigride_token") || "";

/**
 * ReviewModal — shown after a job is completed.
 * 
 * Props:
 *  jobId        — string
 *  jobTitle     — string
 *  receiverName — string
 *  onClose      — function()
 *  onSuccess    — function(review)
 *  theme        — "blue" | "green"  (seeker=blue, provider=green)
 */
export default function ReviewModal({ jobId, jobTitle, receiverName, onClose, onSuccess, theme = "green" }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const accent = theme === "blue"
    ? { bg: "bg-blue-600", light: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", ring: "focus:ring-blue-500" }
    : { bg: "bg-green-700", light: "bg-green-50", border: "border-green-200", text: "text-green-700", ring: "focus:ring-green-500" };

  const handleSubmit = async () => {
    if (rating === 0) { setError("Please select a star rating."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await axios.post(
        "/api/reviews",
        { jobId, rating, comment: comment.trim() },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSubmitted(true);
      onSuccess?.(res.data.review);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success State ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Star size={40} fill="#eab308" className="text-yellow-500" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Review Submitted!</h3>
          <p className="text-gray-500 font-medium mb-8">
            Your {rating}-star review for <strong>{receiverName}</strong> has been saved.
          </p>
          <button
            onClick={onClose}
            className={`w-full py-3 ${accent.bg} text-white font-black rounded-2xl hover:opacity-90 transition-opacity`}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className={`${accent.bg} px-7 py-6 flex items-start justify-between`}>
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Leave a Review</p>
            <h3 className="text-xl font-black text-white">{jobTitle}</h3>
            <p className="text-white/80 text-sm mt-1">Reviewing: <strong>{receiverName}</strong></p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-7 space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm font-black text-gray-500 uppercase tracking-wider mb-4">
              Your Rating
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={40}
                    fill={(hover || rating) >= star ? "#eab308" : "none"}
                    className={(hover || rating) >= star ? "text-yellow-400" : "text-gray-300"}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm font-bold text-gray-500 mt-2">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2">
              <MessageSquare size={15} /> Comment <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share your experience working with ${receiverName}…`}
              rows={4}
              maxLength={1000}
              className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 ${accent.ring} focus:border-transparent transition-all`}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/1000</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-semibold">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-black rounded-2xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className={`flex-1 py-3 ${accent.bg} text-white font-black rounded-2xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting…
                </>
              ) : (
                <>
                  <CheckCircle size={16} /> Submit Review
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
