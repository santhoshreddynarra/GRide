import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Briefcase,
  MapPin,
  Zap,
  Users,
  Star,
  Filter,
  X,
  DollarSign,
  Plus,
  LayoutGrid,
} from "lucide-react";

const CATEGORIES = [
  "All Categories",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Tutor",
  "Delivery helper",
  "Other skilled trades",
  "Other",
];

const POST_CATEGORIES = CATEGORIES.filter((c) => c !== "All Categories");

const ink = "#0f172a";
const muted = "#64748b";
const border = "#e2e8f0";
const yellow = "#FFD700";

function isClientUser(user) {
  const stored = localStorage.getItem("gigride_role");
  return (
    stored === "client" ||
    user?.role === "provider" ||
    user?.role === "client"
  );
}

function jobPay(job) {
  const amt = job.payAmount ?? job.price ?? "—";
  const rate = job.payRate ?? "";
  return rate ? { amt, rate: `/${rate}` } : { amt, rate: "" };
}

function providerRef(job) {
  return job.providerId || job.createdBy;
}

function applicantIncludesUser(job, userId) {
  if (!job?.applicants?.length || !userId) return false;
  const uid = String(userId);
  return job.applicants.some((a) => {
    const s = a.seeker;
    if (s && typeof s === "object" && s._id) return String(s._id) === uid;
    return String(s) === uid;
  });
}

const fieldLabel = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: muted,
  marginBottom: "0.35rem",
  letterSpacing: "0.02em",
};

const fieldInput = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0.65rem 0.75rem",
  borderRadius: "10px",
  border: `1px solid ${border}`,
  fontSize: "0.95rem",
  background: "#fafafa",
  transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
};

// --- Add Gig Modal (POST /api/jobs) ---
const AddGigModal = ({ isOpen, onClose, onSubmit, submitting, error, values, onChange }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2100,
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-gig-title"
      onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "min(92vh, 720px)",
          overflowY: "auto",
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          border: `1px solid ${border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "1.25rem 1.35rem",
            borderBottom: `1px solid ${border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div>
            <h2 id="add-gig-title" style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: ink }}>
              Add a new gig
            </h2>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: muted }}>Fill in the basics — you can edit flows later from your dashboard.</p>
          </div>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            style={{
              flexShrink: 0,
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              border: `1px solid ${border}`,
              background: "#f8fafc",
              cursor: submitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: "1.35rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {error && (
            <div
              role="alert"
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="gig-title" style={fieldLabel}>
              Title
            </label>
            <input
              id="gig-title"
              required
              value={values.title}
              onChange={(e) => onChange({ ...values, title: e.target.value })}
              placeholder="e.g. Same-day electrical repair"
              style={fieldInput}
            />
          </div>

          <div>
            <label htmlFor="gig-category" style={fieldLabel}>
              Category
            </label>
            <select
              id="gig-category"
              required
              value={values.category}
              onChange={(e) => onChange({ ...values, category: e.target.value })}
              style={{ ...fieldInput, cursor: "pointer" }}
            >
              {POST_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gig-desc" style={fieldLabel}>
              Description
            </label>
            <textarea
              id="gig-desc"
              required
              rows={4}
              value={values.description}
              onChange={(e) => onChange({ ...values, description: e.target.value })}
              placeholder="What should the worker know? Scope, timing, requirements…"
              style={{ ...fieldInput, resize: "vertical", minHeight: "100px", lineHeight: 1.5 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
            <div>
              <label htmlFor="gig-price" style={fieldLabel}>
                Price (USD)
              </label>
              <input
                id="gig-price"
                type="number"
                min="0"
                step="0.01"
                required
                value={values.price}
                onChange={(e) => onChange({ ...values, price: e.target.value })}
                placeholder="0"
                style={fieldInput}
              />
            </div>
            <div>
              <label htmlFor="gig-location" style={fieldLabel}>
                Location
              </label>
              <input
                id="gig-location"
                required
                value={values.location}
                onChange={(e) => onChange({ ...values, location: e.target.value })}
                placeholder="City or neighborhood"
                style={fieldInput}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", paddingTop: "0.25rem" }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ fontWeight: 800, minWidth: "140px", opacity: submitting ? 0.75 : 1 }}
            >
              {submitting ? "Publishing…" : "Publish gig"}
            </button>
            <button type="button" className="btn btn-secondary" disabled={submitting} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Rating Modal ---
const RatingModal = ({ isOpen, onClose, onSubmit, targetName }) => {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
        backdropFilter: "blur(8px)",
        padding: "1rem",
      }}
    >
      <div
        className="card fade-in"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "2rem",
          background: "white",
          borderRadius: "1.25rem",
          textAlign: "center",
          boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={22} />
          </button>
        </div>
        <h3 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "0.5rem", color: ink }}>Rate {targetName}</h3>
        <p style={{ color: muted, marginBottom: "1.5rem" }}>How was your experience?</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "0.35rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setScore(num)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "0.15rem" }}
            >
              <Star
                size={36}
                fill={num <= score ? yellow : "none"}
                stroke={num <= score ? yellow : "#cbd5e1"}
              />
            </button>
          ))}
        </div>
        <textarea
          placeholder="Comment (optional)"
          style={{
            width: "100%",
            padding: "0.85rem",
            borderRadius: "12px",
            border: `1px solid ${border}`,
            marginBottom: "1.25rem",
            fontSize: "0.95rem",
            minHeight: "88px",
            boxSizing: "border-box",
          }}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button type="button" className="btn btn-primary btn-full" onClick={() => onSubmit({ score, comment })}>
          Submit rating
        </button>
      </div>
    </div>
  );
};

const GigsPage = ({ user }) => {
  const isClient = isClientUser(user);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [filterCategory, setFilterCategory] = useState("All Categories");

  const [showAddGig, setShowAddGig] = useState(false);
  const [newGig, setNewGig] = useState({
    title: "",
    description: "",
    category: POST_CATEGORIES[0],
    price: "",
    location: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submittingGig, setSubmittingGig] = useState(false);

  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    jobId: null,
    targetId: null,
    targetName: "",
    role: "",
  });

  const [applyBanner, setApplyBanner] = useState({ type: "", text: "" });
  const [applyingJobId, setApplyingJobId] = useState(null);

  const workerUserId = user?._id ?? user?.id;

  const fetchJobs = useCallback(async () => {
    try {
      const token = localStorage.getItem("gigride_token");
      let url = isClient ? "/api/jobs/my" : "/api/jobs?";

      if (!isClient) {
        if (filterUrgency !== "all") url += `urgency=${filterUrgency}&`;
        if (filterCategory !== "All Categories") url += `category=${encodeURIComponent(filterCategory)}&`;
        if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      }

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isClient, filterUrgency, filterCategory, searchQuery]);

  useEffect(() => {
    setLoading(true);
    fetchJobs();
    const interval = setInterval(fetchJobs, 8000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  useEffect(() => {
    if (!formSuccess) return;
    const t = window.setTimeout(() => setFormSuccess(""), 5500);
    return () => window.clearTimeout(t);
  }, [formSuccess]);

  useEffect(() => {
    if (!applyBanner.text) return;
    const t = window.setTimeout(() => setApplyBanner({ type: "", text: "" }), 6000);
    return () => window.clearTimeout(t);
  }, [applyBanner.text]);

  const resetNewGig = () =>
    setNewGig({
      title: "",
      description: "",
      category: POST_CATEGORIES[0],
      price: "",
      location: "",
    });

  const openAddGigModal = () => {
    setFormError("");
    setFormSuccess("");
    setShowAddGig(true);
  };

  const closeAddGigModal = () => {
    if (submittingGig) return;
    setShowAddGig(false);
    setFormError("");
  };

  const handlePostGig = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    const price = Number(newGig.price);
    if (!Number.isFinite(price) || price < 0) {
      setFormError("Please enter a valid price (0 or greater).");
      return;
    }
    if (!newGig.title.trim() || !newGig.description.trim() || !newGig.location.trim()) {
      setFormError("Title, description, and location are required.");
      return;
    }

    setSubmittingGig(true);
    try {
      const token = localStorage.getItem("gigride_token");
      const body = {
        title: newGig.title.trim(),
        description: newGig.description.trim(),
        category: newGig.category,
        price,
        location: newGig.location.trim(),
        urgency: "part-time",
        payRate: "hour",
      };
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormSuccess(data.message || "Gig published successfully.");
        resetNewGig();
        setShowAddGig(false);
        await fetchJobs();
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.message || "Could not create gig.");
      }
    } catch (err) {
      console.error(err);
      setFormError("Something went wrong. Check your connection and try again.");
    } finally {
      setSubmittingGig(false);
    }
  };

  const handleApply = async (jobId) => {
    const job = jobs.find((j) => j._id === jobId);
    if (job && applicantIncludesUser(job, workerUserId)) return;
    if (applyingJobId === jobId) return;

    setApplyingJobId(jobId);
    setApplyBanner({ type: "", text: "" });
    try {
      const token = localStorage.getItem("gigride_token");
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setApplyBanner({
          type: "success",
          text: data.message || "You have applied to this gig.",
        });
        await fetchJobs();
      } else {
        setApplyBanner({
          type: "error",
          text: data.message || "Could not submit application.",
        });
      }
    } catch (err) {
      console.error(err);
      setApplyBanner({ type: "error", text: "Network error. Try again." });
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleApplicantAction = async (jobId, seekerId, action) => {
    try {
      const token = localStorage.getItem("gigride_token");
      const res = await fetch(`/api/jobs/${jobId}/${action}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ seekerId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(action === "accept" ? "Partner hired." : "Application rejected.");
        fetchJobs();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteJob = async (jobId) => {
    if (!window.confirm("Mark this gig as completed?")) return;
    try {
      const token = localStorage.getItem("gigride_token");
      const res = await fetch(`/api/jobs/${jobId}/complete`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Completed. You can now rate each other.");
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitRating = async ({ score, comment }) => {
    try {
      const token = localStorage.getItem("gigride_token");
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: ratingModal.targetId,
          job: ratingModal.jobId,
          score,
          comment,
          role: ratingModal.role,
        }),
      });
      if (res.ok) {
        alert("Thanks — rating saved.");
        setRatingModal({ ...ratingModal, isOpen: false });
        fetchJobs();
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: "16px",
    border: `1px solid ${border}`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 12px 32px rgba(15,23,42,0.06)",
    padding: "1.35rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    height: "100%",
    boxSizing: "border-box",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
    gap: "clamp(1rem, 2vw, 1.5rem)",
  };

  const renderWorkerCard = (job) => {
    const pay = jobPay(job);
    const open = job.status === "open";
    const prov = providerRef(job);
    const hasApplied = applicantIncludesUser(job, workerUserId);
    return (
      <article key={job._id} style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: ink, lineHeight: 1.3 }}>{job.title}</h3>
            <p style={{ margin: "0.35rem 0 0", color: muted, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <MapPin size={15} style={{ flexShrink: 0 }} />
              {job.location || "—"}
            </p>
          </div>
          <span
            style={{
              flexShrink: 0,
              fontSize: "0.7rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              padding: "0.35rem 0.65rem",
              borderRadius: "999px",
              background: open ? "#dcfce7" : "#fef9c3",
              color: open ? "#166534" : "#854d0e",
            }}
          >
            {job.status}
          </span>
        </div>
        <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem", lineHeight: 1.55, flex: 1 }}>{job.description}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, background: "#f1f5f9", padding: "0.35rem 0.65rem", borderRadius: "8px" }}>
            {job.category}
          </span>
          {job.urgency === "instant" && (
            <span style={{ fontSize: "0.8rem", fontWeight: 800, background: "#fee2e2", color: "#b91c1c", padding: "0.35rem 0.65rem", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <Zap size={14} /> Instant
            </span>
          )}
        </div>
        <div
          style={{
            marginTop: "auto",
            paddingTop: "0.85rem",
            borderTop: `1px solid ${border}`,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem" }}>
            <DollarSign size={20} style={{ color: "#b45309" }} />
            <span style={{ fontSize: "1.35rem", fontWeight: 900, color: ink }}>{pay.amt}</span>
            <span style={{ fontSize: "0.95rem", color: "#b45309", fontWeight: 700 }}>{pay.rate}</span>
          </div>
          {open && hasApplied ? (
            <span
              style={{
                fontWeight: 800,
                fontSize: "0.9rem",
                padding: "0.55rem 1rem",
                borderRadius: "10px",
                background: "#e0f2fe",
                color: "#0369a1",
                border: "1px solid #bae6fd",
              }}
            >
              Applied
            </span>
          ) : open ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={applyingJobId === job._id}
              onClick={() => handleApply(job._id)}
              style={{ fontWeight: 800, opacity: applyingJobId === job._id ? 0.75 : 1 }}
            >
              {applyingJobId === job._id ? "Applying…" : "Apply"}
            </button>
          ) : job.status === "completed" ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                setRatingModal({
                  isOpen: true,
                  jobId: job._id,
                  targetId: prov?._id || prov,
                  targetName: prov?.name || "Provider",
                  role: "provider",
                })
              }
            >
              Rate provider
            </button>
          ) : (
            <span style={{ fontWeight: 700, color: muted, fontSize: "0.9rem" }}>Closed</span>
          )}
        </div>
      </article>
    );
  };

  const renderClientCard = (job) => {
    const pay = jobPay(job);
    const hired = job.applicants?.find((a) => a.status === "accepted");
    return (
      <article key={job._id} style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: ink }}>{job.title}</h3>
            <p style={{ margin: "0.35rem 0 0", color: muted, fontSize: "0.875rem" }}>{job.category} · {job.location}</p>
          </div>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 800,
              textTransform: "uppercase",
              padding: "0.35rem 0.65rem",
              borderRadius: "999px",
              background: job.status === "open" ? "#dcfce7" : "#f1f5f9",
              color: job.status === "open" ? "#166534" : muted,
            }}
          >
            {job.status}
          </span>
        </div>
        <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem", lineHeight: 1.55 }}>{job.description}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: 800 }}>
          <DollarSign size={18} style={{ color: "#b45309" }} />
          <span style={{ fontSize: "1.2rem" }}>{pay.amt}</span>
          <span style={{ color: "#b45309" }}>{pay.rate}</span>
          <span style={{ marginLeft: "0.5rem", color: muted, fontSize: "0.85rem", fontWeight: 600 }}>
            {(job.applicants?.length || 0)} applicant{(job.applicants?.length || 0) === 1 ? "" : "s"}
          </span>
        </div>
        {job.status === "filled" && (
          <button type="button" className="btn btn-primary" onClick={() => handleCompleteJob(job._id)} style={{ alignSelf: "flex-start", fontWeight: 800 }}>
            Mark complete
          </button>
        )}
        {isClient && job.status !== "completed" && job.applicants?.length > 0 && (
          <div style={{ borderTop: `1px dashed ${border}`, paddingTop: "1rem" }}>
            <h4 style={{ margin: "0 0 0.75rem", fontWeight: 800, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem", color: ink }}>
              <Users size={18} /> Applicants
            </h4>
            <div style={{ display: "grid", gap: "0.65rem" }}>
              {job.applicants.map((app, idx) => {
                const sid = app.seeker?._id || app.seeker;
                const name = app.seeker?.name || "Applicant";
                return (
                  <div key={idx} style={{ padding: "0.85rem", background: "#f8fafc", borderRadius: "12px", border: `1px solid ${border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.65rem", flexWrap: "wrap", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 800 }}>{name}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.2rem", color: "#b45309", fontWeight: 700, fontSize: "0.85rem" }}>
                        <Star size={14} fill="#b45309" /> {app.seeker?.ratings?.average ?? "—"}
                      </span>
                    </div>
                    {app.status === "pending" ? (
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => handleApplicantAction(job._id, sid, "accept")}
                          style={{
                            flex: "1 1 120px",
                            padding: "0.55rem",
                            borderRadius: "8px",
                            background: ink,
                            color: yellow,
                            border: "none",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          Hire
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplicantAction(job._id, sid, "reject")}
                          style={{ padding: "0.55rem 0.85rem", borderRadius: "8px", background: "#fee2e2", color: "#b91c1c", border: "none", fontWeight: 700, cursor: "pointer" }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", fontWeight: 800, fontSize: "0.8rem", textTransform: "uppercase", color: app.status === "accepted" ? "#166534" : muted }}>
                        {app.status}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {job.status === "completed" && hired?.seeker && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              setRatingModal({
                isOpen: true,
                jobId: job._id,
                targetId: hired.seeker._id || hired.seeker,
                targetName: hired.seeker.name || "Worker",
                role: "seeker",
              })
            }
          >
            Rate worker
          </button>
        )}
      </article>
    );
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 100px)",
        padding: "clamp(1rem, 3vw, 2rem)",
        background: "linear-gradient(165deg, #fffbeb 0%, #f8fafc 45%, #e2e8f0 100%)",
      }}
    >
      <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <header
          style={{
            marginBottom: "clamp(1.25rem, 3vw, 2rem)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#b45309", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.12em" }}>
                <LayoutGrid size={16} /> GIGS
              </div>
              <h1 style={{ margin: "0.35rem 0 0", fontSize: "clamp(1.65rem, 4vw, 2.25rem)", fontWeight: 900, color: ink, letterSpacing: "-0.02em" }}>
                {isClient ? "Your gigs" : "Browse gigs"}
              </h1>
              <p style={{ margin: "0.5rem 0 0", color: muted, maxWidth: "36rem", fontSize: "0.95rem" }}>
                {isClient ? "Gigs you posted and who applied." : "Open work near you — filter, then apply in one tap."}
              </p>
            </div>
            {isClient && (
              <button
                type="button"
                onClick={openAddGigModal}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.25rem",
                  borderRadius: "12px",
                  border: "none",
                  background: ink,
                  color: yellow,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(15,23,42,0.18)",
                  flexShrink: 0,
                }}
              >
                <Plus size={20} strokeWidth={2.5} />
                Add Gig
              </button>
            )}
          </div>

          {!isClient && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                padding: "1rem",
                background: "#fff",
                borderRadius: "14px",
                border: `1px solid ${border}`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ flex: "2 1 220px", position: "relative", minWidth: 0 }}>
                <Search size={18} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="search"
                  placeholder="Search gigs…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "0.65rem 0.85rem 0.65rem 2.5rem",
                    borderRadius: "10px",
                    border: `1px solid ${border}`,
                    fontSize: "0.95rem",
                  }}
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ flex: "1 1 160px", padding: "0.65rem", borderRadius: "10px", border: `1px solid ${border}`, fontWeight: 600 }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                style={{ flex: "1 1 140px", padding: "0.65rem", borderRadius: "10px", border: `1px solid ${border}`, fontWeight: 600 }}
              >
                <option value="all">Any urgency</option>
                <option value="instant">Instant</option>
                <option value="part-time">Standard</option>
              </select>
            </div>
          )}

          {!isClient && applyBanner.text && (
            <div
              role={applyBanner.type === "error" ? "alert" : "status"}
              style={{
                padding: "0.85rem 1.1rem",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "0.9rem",
                background: applyBanner.type === "success" ? "#f0fdf4" : "#fef2f2",
                border: applyBanner.type === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca",
                color: applyBanner.type === "success" ? "#166534" : "#b91c1c",
              }}
            >
              {applyBanner.text}
            </div>
          )}

          {isClient && formSuccess && (
            <div
              role="status"
              style={{
                padding: "0.85rem 1.1rem",
                borderRadius: "12px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              {formSuccess}
            </div>
          )}

          {isClient && !showAddGig && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: muted, fontSize: "0.9rem", fontWeight: 600 }}>
              <Filter size={18} /> Showing only gigs you created
            </div>
          )}
        </header>

        <AddGigModal
          isOpen={isClient && showAddGig}
          onClose={closeAddGigModal}
          onSubmit={handlePostGig}
          submitting={submittingGig}
          error={formError}
          values={newGig}
          onChange={setNewGig}
        />

        <RatingModal
          isOpen={ratingModal.isOpen}
          onClose={() => setRatingModal({ ...ratingModal, isOpen: false })}
          targetName={ratingModal.targetName}
          onSubmit={handleSubmitRating}
        />

        {loading && jobs.length === 0 ? (
          <p style={{ textAlign: "center", color: muted, padding: "3rem" }}>Loading gigs…</p>
        ) : jobs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "clamp(2rem, 5vw, 3.5rem)",
              background: "#fff",
              borderRadius: "16px",
              border: `1px dashed ${border}`,
            }}
          >
            <Briefcase size={48} style={{ color: "#cbd5e1", marginBottom: "0.75rem" }} />
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: ink }}>No gigs here yet</h3>
            <p style={{ color: muted, marginTop: "0.5rem" }}>
              {isClient ? "Use Add Gig to post your first listing." : "Try different filters or check back soon."}
            </p>
          </div>
        ) : (
          <div style={gridStyle}>{jobs.map((job) => (isClient ? renderClientCard(job) : renderWorkerCard(job)))}</div>
        )}
      </div>
    </div>
  );
};

export default GigsPage;
