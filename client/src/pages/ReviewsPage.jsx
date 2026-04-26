import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Star,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Briefcase,
  User as UserIcon,
  MessageSquare,
  TrendingUp,
  Award,
} from "lucide-react";

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("gigride_token") || "";

// ── Star display (read-only) ─────────────────────────────────────────────────
function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={15}
          fill={s <= rating ? "#eab308" : "transparent"}
          className={s <= rating ? "text-yellow-400" : "text-gray-300"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

// ── Review card ──────────────────────────────────────────────────────────────
function ReviewCard({ review }) {
  const reviewer = review.reviewer || {};
  const job = review.job || {};
  const date = new Date(review.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const roleLabel = reviewer.role === "provider" ? "Job Provider" : "Worker";
  const roleColor = reviewer.role === "provider"
    ? "bg-green-100 text-green-700"
    : "bg-blue-100 text-blue-700";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg shrink-0">
            {(reviewer.name || "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-black text-gray-900">{reviewer.name || "Anonymous"}</p>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${roleColor}`}>
              {roleLabel}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarDisplay rating={review.rating} />
          <span className="text-xs text-gray-400">{date}</span>
        </div>
      </div>

      {/* Job title */}
      {job.title && (
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 font-semibold">
          <Briefcase size={12} className="shrink-0" />
          <span className="truncate">{job.title}</span>
        </div>
      )}

      {/* Comment */}
      {review.comment ? (
        <div className="flex items-start gap-2 bg-gray-50 rounded-2xl p-4">
          <MessageSquare size={14} className="text-gray-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 font-medium leading-relaxed">{review.comment}</p>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">No comment provided</p>
      )}
    </div>
  );
}

export default function SeekerReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role") || localStorage.getItem("gigride_role") || "";
  const isProvider = role === "provider";

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError("");
    try {
      // Use the appropriate endpoint based on role
      const endpoint = isProvider
        ? "/api/reviews/about-me"   // provider: reviews received by them (from seekers)
        : "/api/seeker/reviews";    // seeker: reviews received by them (from providers)

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setReviews(res.data.reviews || []);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate("/login"); return; }
      setError(err.response?.data?.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const dashboardPath = isProvider ? "/provider/dashboard" : "/seeker/dashboard";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(dashboardPath)}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-semibold text-sm transition-colors"
            >
              <ArrowLeft size={17} /> Dashboard
            </button>
            <span className="text-gray-300 text-lg">›</span>
            <span className="font-black text-blue-700 flex items-center gap-1.5">
              <Star size={16} /> My Reviews
            </span>
          </div>
          <button
            onClick={fetchReviews}
            className="flex items-center gap-1.5 text-sm text-blue-600 font-bold hover:text-blue-800"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-1">Reviews About Me</h1>
          <p className="text-gray-500 font-medium">
            {isProvider
              ? "Reviews you've received from workers you hired."
              : "Reviews you've received from providers you worked with."}
          </p>
        </div>

        {/* Summary stats */}
        {!loading && reviews.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl border bg-yellow-50 border-yellow-200 p-5 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star size={22} fill="#eab308" className="text-yellow-400" />
                <p className="text-3xl font-black text-yellow-600">{avgRating}</p>
              </div>
              <p className="text-xs font-bold text-gray-500">Avg Rating</p>
            </div>
            <div className="rounded-2xl border bg-blue-50 border-blue-200 p-5 text-center">
              <p className="text-3xl font-black text-blue-600">{reviews.length}</p>
              <p className="text-xs font-bold text-gray-500 mt-1">Total Reviews</p>
            </div>
            <div className="rounded-2xl border bg-green-50 border-green-200 p-5 text-center">
              <p className="text-3xl font-black text-green-600">
                {reviews.filter((r) => r.rating >= 4).length}
              </p>
              <p className="text-xs font-bold text-gray-500 mt-1">4★ or Above</p>
            </div>
          </div>
        )}

        {/* Average rating banner */}
        {!loading && avgRating && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 mb-8 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Award size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Your Rating</p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-white font-black text-3xl">{avgRating}</p>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      fill={s <= Math.round(parseFloat(avgRating)) ? "#fbbf24" : "transparent"}
                      className={s <= Math.round(parseFloat(avgRating)) ? "text-yellow-400" : "text-white/40"}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <span className="text-white/70 text-sm">/ 5</span>
              </div>
            </div>
            <div className="text-white/80 text-sm font-semibold text-right">
              Based on<br />
              <strong className="text-white font-black">{reviews.length}</strong> review{reviews.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-6 text-sm font-semibold">
            <AlertCircle size={18} className="shrink-0" /> {error}
            <button onClick={fetchReviews} className="ml-auto underline text-red-500 font-bold">Retry</button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-11 h-11 bg-gray-200 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                  <div className="w-24 h-4 bg-gray-200 rounded" />
                </div>
                <div className="h-12 bg-gray-100 rounded-2xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && reviews.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-300">
              <Star size={36} />
            </div>
            <h3 className="text-xl font-black text-gray-700 mb-2">No reviews yet</h3>
            <p className="text-gray-400 mb-6">
              {isProvider
                ? "Complete jobs and workers will be able to review you here."
                : "Complete jobs and providers will be able to review you here."}
            </p>
            <button
              onClick={() => navigate(dashboardPath)}
              className="px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-md shadow-blue-100"
            >
              Browse Jobs
            </button>
          </div>
        )}

        {/* Review cards */}
        {!loading && !error && reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
