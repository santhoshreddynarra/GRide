import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Star,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Briefcase,
  User as UserIcon,
  MapPin,
  MessageSquare,
  Send,
  IndianRupee,
} from "lucide-react";

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("gigride_token") || "";

// ── Interactive star rating ──────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent!"];

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
            aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
          >
            <Star
              size={44}
              fill={(hover || value) >= star ? "#eab308" : "transparent"}
              className={(hover || value) >= star ? "text-yellow-400" : "text-gray-300"}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      <p className={`text-sm font-black transition-all ${value ? "text-yellow-600" : "text-gray-400"}`}>
        {value ? LABELS[value] : "Click a star to rate"}
      </p>
    </div>
  );
}

export default function ProviderReview() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Fetch job detail
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const j = res.data.job;

        if (j.providerReviewed) {
          setError("You have already submitted a review for this job.");
        } else if (j.status !== "completed") {
          setError("Reviews can only be submitted for completed jobs.");
        } else if (!j.selectedCandidate) {
          setError("No accepted seeker found for this job.");
        }

        setJob(j);
      } catch (err) {
        if (err.response?.status === 401) { localStorage.clear(); navigate("/login"); return; }
        if (err.response?.status === 403) { navigate("/provider/dashboard"); return; }
        setError(err.response?.data?.message || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [jobId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating before submitting."); return; }
    setError("");
    setSubmitting(true);

    try {
      await axios.post(
        "/api/reviews",
        { jobId, rating, comment: comment.trim() },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const seekerName = job?.selectedCandidate?.name || "the seeker";

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
          <p className="text-green-700 font-semibold">Loading details…</p>
        </div>
      </div>
    );
  }

  // ── Success screen ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}>
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center">
          <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={22}
                  fill={s <= rating ? "#eab308" : "#d1d5db"}
                  className={s <= rating ? "text-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
          </div>
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Review Submitted!</h2>
          <p className="text-gray-500 font-medium mb-2">
            You gave <strong className="text-yellow-600">{rating} star{rating !== 1 ? "s" : ""}</strong> to
          </p>
          <p className="text-lg font-black text-gray-800 mb-8">{seekerName}</p>
          <button
            onClick={() => navigate("/provider/dashboard")}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl transition-colors shadow-lg shadow-green-100 active:scale-95"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Guard: already reviewed or not completed ────────────────────────────────
  if (error && (!job || job.providerReviewed || job.status !== "completed")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}>
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center">
          <AlertCircle size={52} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-900 mb-2">Cannot Review</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate("/provider/dashboard")}
            className="w-full py-3 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Main review form ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        @keyframes slide-up { from { opacity:0; transform:translateY(20px);} to { opacity:1; transform:translateY(0);} }
        .slide-up { animation: slide-up 0.4s ease-out both; }
      `}</style>

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/provider/dashboard")}
              className="flex items-center gap-2 text-gray-500 hover:text-green-600 font-semibold text-sm transition-colors"
            >
              <ArrowLeft size={17} /> Dashboard
            </button>
            <span className="text-gray-300 text-lg">›</span>
            <span className="font-black text-green-700 text-base">Review Seeker</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        {/* Page header */}
        <div className="slide-up">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-black mb-4 uppercase tracking-wider">
            <Star size={13} /> Review Worker
          </div>
          <h1 className="text-3xl font-black text-gray-900">Rate the Worker</h1>
          <p className="text-gray-500 mt-1 font-medium">Your honest feedback helps the community grow.</p>
        </div>

        {/* Job summary card */}
        {job && (
          <div className="bg-white rounded-3xl border border-green-100 p-6 shadow-sm slide-up">
            <p className="text-xs font-black text-green-500 uppercase tracking-widest mb-3">Job Summary</p>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
                <Briefcase size={22} />
              </div>
              <div className="flex-1">
                <h2 className="font-black text-xl text-gray-900">{job.title}</h2>
                <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                  <UserIcon size={13} /> Worker: <strong>{seekerName}</strong>
                </p>
                <div className="flex flex-wrap gap-3 mt-3">
                  {job.location && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                      <MapPin size={12} /> {job.location}
                    </span>
                  )}
                  {job.price != null && (
                    <span className="flex items-center gap-1 text-xs font-black text-green-600">
                      <IndianRupee size={12} /> ₹{job.price}/{job.payRate}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-black rounded-full">
                    ✓ Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-green-100 shadow-sm overflow-hidden slide-up">
          {/* Green header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-7 py-6">
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Your Review</p>
            <h3 className="text-xl font-black text-white">
              Rate {seekerName}
            </h3>
          </div>

          <div className="p-7 space-y-7">
            {/* Stars */}
            <div>
              <label className="block text-sm font-black text-gray-700 mb-4">
                Overall Rating <span className="text-red-400">*</span>
              </label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            {/* Comment */}
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2" htmlFor="comment">
                <MessageSquare size={15} />
                Comment
                <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Share your experience working with ${seekerName}…`}
                rows={5}
                maxLength={1000}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-medium"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">{comment.length}/1000 characters</span>
                {comment.length > 800 && <span className="text-xs text-orange-500 font-bold">Almost at limit</span>}
              </div>
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
                type="button"
                onClick={() => navigate("/provider/dashboard")}
                className="flex-1 py-3.5 border-2 border-gray-200 text-gray-600 font-black rounded-2xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-100"
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
                    <Send size={16} /> Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
