import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Briefcase, MapPin, Clock, CheckCircle, XCircle, AlertCircle,
  Star, ArrowLeft, RefreshCw, CalendarDays, User as UserIcon,
  IndianRupee, History, PlusCircle,
} from "lucide-react";

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("gigride_token") || "";

const STATUS_CFG = {
  Pending:    { color: "bg-yellow-100 text-yellow-700 border-yellow-200", bar: "bg-yellow-400", icon: <Clock size={12} /> },
  Accepted:   { color: "bg-blue-100 text-blue-700 border-blue-200",       bar: "bg-blue-500",   icon: <CheckCircle size={12} /> },
  Rejected:   { color: "bg-red-100 text-red-700 border-red-200",          bar: "bg-red-400",    icon: <XCircle size={12} /> },
  Completed:  { color: "bg-green-100 text-green-700 border-green-200",    bar: "bg-green-500",  icon: <CheckCircle size={12} /> },
};

function Badge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${c.color}`}>
      {c.icon} {status}
    </span>
  );
}

function HistoryCard({ item, onReview }) {
  const bar = (STATUS_CFG[item.status] || STATUS_CFG.Pending).bar;
  const canReview = item.status === "Completed" && !item.seekerReviewSubmitted;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className={`h-1.5 ${bar}`} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Briefcase size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-gray-900 text-lg leading-snug truncate">{item.serviceTitle}</h3>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{item.category}</p>
            </div>
          </div>
          <Badge status={item.status} />
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-5 text-sm text-gray-600">
          {item.providerId?.name && (
            <div className="flex items-center gap-1.5">
              <UserIcon size={13} className="text-gray-400 shrink-0" />
              <span className="font-semibold truncate">{item.providerId.name}</span>
            </div>
          )}
          {item.price != null && (
            <div className="flex items-center gap-1.5">
              <IndianRupee size={13} className="text-gray-400 shrink-0" />
              <span className="font-black text-blue-700">₹{item.price}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 col-span-2">
            <CalendarDays size={13} className="text-gray-400 shrink-0" />
            <span>Requested: {new Date(item.requestedAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</span>
          </div>
          {item.completedAt && (
            <div className="flex items-center gap-1.5 col-span-2">
              <CheckCircle size={13} className="text-green-500 shrink-0" />
              <span>Completed: {new Date(item.completedAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {canReview ? (
            <button
              onClick={() => onReview(item._id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl transition-all active:scale-95 shadow-md shadow-blue-100"
            >
              <Star size={14} /> Review Provider
            </button>
          ) : item.seekerReviewSubmitted ? (
            <span className="flex items-center gap-1.5 text-xs font-black text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
              <CheckCircle size={13} /> Reviewed ✓
            </span>
          ) : (
            <span className="text-xs text-gray-400 italic">Review available after completion</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SeekerHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const FILTERS = ["All", "Pending", "Accepted", "Completed", "Rejected"];

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get("/api/history/seeker", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setHistory(res.data.history || []);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate("/login"); return; }
      setError(err.response?.data?.message || "Failed to load history.");
    } finally { setLoading(false); }
  };

  const filtered = filter === "All" ? history : history.filter(h => h.status === filter);

  const stats = {
    total: history.length,
    completed: history.filter(h => h.status === "Completed").length,
    reviewed: history.filter(h => h.seekerReviewSubmitted).length,
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');*{font-family:'Inter',sans-serif;}`}</style>

      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/seeker/dashboard")} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-semibold text-sm">
              <ArrowLeft size={17} /> Dashboard
            </button>
            <span className="text-gray-300">›</span>
            <span className="font-black text-blue-700 flex items-center gap-1.5"><History size={16} /> My History</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/seeker/reviews")} className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1"><Star size={13} /> My Reviews</button>
            <button onClick={fetchHistory} className="flex items-center gap-1.5 text-sm text-blue-600 font-bold hover:text-blue-800">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-1">Job History</h1>
          <p className="text-gray-500 font-medium">All your service requests and their current statuses.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label:"Total", value: stats.total,     color:"text-blue-600",   bg:"bg-blue-50",   border:"border-blue-200" },
            { label:"Completed", value: stats.completed, color:"text-green-600",  bg:"bg-green-50",  border:"border-green-200" },
            { label:"Reviews Given", value: stats.reviewed,  color:"text-yellow-600", bg:"bg-yellow-50", border:"border-yellow-200" },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 text-center ${s.bg} ${s.border}`}>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs font-bold text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-black border transition-all ${filter === f ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
              {f}{f !== "All" && <span className="ml-1.5 opacity-60">({history.filter(h => h.status === f).length})</span>}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-6 text-sm font-semibold">
            <AlertCircle size={18} className="shrink-0" /> {error}
            <button onClick={fetchHistory} className="ml-auto underline text-red-500 font-bold">Retry</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(n => (
              <div key={n} className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-11 h-11 bg-gray-200 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2"><div className="h-5 bg-gray-200 rounded w-2/3" /><div className="h-3 bg-gray-100 rounded w-1/3" /></div>
                  <div className="w-20 h-6 bg-gray-200 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-3"><div className="h-4 bg-gray-100 rounded" /><div className="h-4 bg-gray-100 rounded" /></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-300"><Briefcase size={36} /></div>
            <h3 className="text-xl font-black text-gray-700 mb-2">{filter === "All" ? "No history yet" : `No ${filter} records`}</h3>
            <p className="text-gray-400 mb-6">Your service history will appear here.</p>
            <button onClick={() => navigate("/seeker/dashboard")} className="px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-md shadow-blue-100">
              Browse Jobs
            </button>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(item => (
              <HistoryCard key={item._id} item={item} onReview={id => navigate(`/seeker/review/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
