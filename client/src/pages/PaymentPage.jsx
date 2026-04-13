import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CreditCard,
  User as UserIcon,
  Briefcase,
  MapPin,
  CheckCircle,
  ArrowLeft,
  Shield,
  Zap,
  AlertCircle,
  Star,
} from "lucide-react";

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("gigride_token") || "";

export default function PaymentPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setJob(res.data.job);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handlePay = async () => {
    if (!job) return;
    setPaying(true);
    setError("");
    try {
      const seekerId =
        typeof job.selectedCandidate === "object"
          ? job.selectedCandidate?._id
          : job.selectedCandidate;

      const res = await axios.post(
        "/api/payments",
        { jobId: job._id, seekerId },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setPayment(res.data.payment);
      setJob(res.data.job);
      setPaid(true);
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-full border-4 border-green-200 border-t-green-600 animate-spin mx-auto mb-4"
          />
          <p className="text-green-700 font-semibold text-lg">Loading payment details…</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
          <AlertCircle size={52} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate("/provider/dashboard")}
            className="px-8 py-3 bg-green-700 text-white font-black rounded-xl hover:bg-green-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const seeker =
    typeof job?.selectedCandidate === "object" ? job?.selectedCandidate : null;
  const providerName =
    typeof job?.createdBy === "object" ? job?.createdBy?.name : "Provider";

  // ── Success screen ────────────────────────────────────────────────────────────
  if (paid && payment) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)" }}
      >
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={44} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500 mb-8 text-sm font-medium">
            The job is now in-progress. Complete it to unlock reviews.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-semibold">Transaction ID</span>
              <span className="font-black text-green-700 text-xs">{payment.transactionId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-semibold">Amount Paid</span>
              <span className="font-black text-gray-900">₹{payment.amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-semibold">Status</span>
              <span className="font-black text-green-700 uppercase">{payment.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-semibold">Job</span>
              <span className="font-black text-gray-900">{job?.title}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/provider/dashboard")}
            className="w-full py-4 bg-green-700 hover:bg-green-800 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-green-200"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Main Payment Page ────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-up { animation: slide-up 0.5s ease-out both; }
      `}</style>

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center">
              <Briefcase size={18} color="white" />
            </div>
            <span className="font-black text-xl text-green-800">GigRide</span>
          </div>
          <button
            onClick={() => navigate("/provider/dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-semibold text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">
        {/* Header */}
        <div className="slide-up text-center mb-2">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-black mb-4">
            <Shield size={14} /> Secure Simulated Payment
          </div>
          <h1 className="text-4xl font-black text-gray-900">Confirm & Pay</h1>
          <p className="text-gray-500 mt-2 font-medium">
            Review the details below and confirm payment to start the job.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-center gap-3 font-semibold text-sm slide-up">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Job Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-7 slide-up">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
              <Briefcase size={22} className="text-green-700" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-green-600 uppercase tracking-wider mb-1">Job Details</p>
              <h2 className="text-2xl font-black text-gray-900">{job?.title}</h2>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                <MapPin size={13} /> {job?.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-semibold uppercase">Pay Rate</p>
              <p className="text-2xl font-black text-green-700">
                ₹{job?.price ?? job?.payAmount}
              </p>
              <p className="text-xs text-gray-400">/{job?.payRate}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-gray-600 leading-relaxed">{job?.description}</p>
          </div>

          {/* Status */}
          <div className="mt-4 flex gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded-lg uppercase tracking-wider">
              {job?.category}
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-black rounded-lg uppercase tracking-wider">
              {job?.status}
            </span>
          </div>
        </div>

        {/* Seeker Card */}
        {seeker && (
          <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-7 slide-up">
            <p className="text-xs font-black text-green-600 uppercase tracking-wider mb-4">Selected Worker</p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-xl select-none">
                {seeker.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <p className="font-black text-xl text-gray-900">{seeker.name}</p>
                <p className="text-gray-500 text-sm">{seeker.email}</p>
                {seeker.ratings?.count > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={13} fill="#eab308" className="text-yellow-500" />
                    <span className="text-xs font-black text-gray-600">
                      {seeker.ratings.average} ({seeker.ratings.count} reviews)
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
                <p className="text-xs font-black text-green-700">Accepted ✓</p>
              </div>
            </div>

            {seeker.skills?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {seeker.skills.slice(0, 5).map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment Summary */}
        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-7 slide-up">
          <p className="text-xs font-black text-green-600 uppercase tracking-wider mb-5">
            Payment Summary
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Job Amount</span>
              <span className="font-black text-gray-900">₹{job?.price ?? job?.payAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Platform Fee</span>
              <span className="font-black text-green-700">₹0.00 (Free)</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-black text-gray-900 text-base">Total Due</span>
              <span className="font-black text-2xl text-green-700">
                ₹{job?.price ?? job?.payAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex gap-4 justify-center text-xs text-gray-400 font-semibold slide-up">
          <span className="flex items-center gap-1"><Shield size={12} /> Secure</span>
          <span className="flex items-center gap-1"><Zap size={12} /> Instant</span>
          <span className="flex items-center gap-1"><CheckCircle size={12} /> Simulated</span>
        </div>

        {/* Pay Now Button */}
        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full py-5 text-lg font-black text-white rounded-3xl shadow-xl shadow-green-200 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed slide-up"
          style={{
            background: paying ? "#4ade80" : "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
          }}
        >
          {paying ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing Payment…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <CreditCard size={22} />
              Pay Now — ₹{job?.price ?? job?.payAmount}
            </span>
          )}
        </button>

        <p className="text-center text-xs text-gray-400 pb-8 slide-up">
          This is a simulated payment. No real money will be charged.
        </p>
      </div>
    </div>
  );
}
