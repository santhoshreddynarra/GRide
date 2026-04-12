import React, { useState, useEffect, useMemo } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  Send,
  Zap,
  ClipboardList,
  RefreshCw,
  CheckCircle2,
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

const ink = "#0f172a";
const muted = "#64748b";
const border = "#e2e8f0";
const yellow = "#FFD700";

function applicantIncludesUser(job, userId) {
  if (!job?.applicants?.length || !userId) return false;
  const uid = String(userId);
  return job.applicants.some((a) => {
    const s = a.seeker;
    if (s && typeof s === "object" && s._id) return String(s._id) === uid;
    return String(s) === uid;
  });
}

function jobPay(job) {
  const amt = job.payAmount ?? job.price ?? "—";
  const rate = job.payRate ?? "";
  return rate ? `$${amt}/${rate}` : `$${amt}`;
}

const WorkerDashboard = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [banner, setBanner] = useState({ type: "", text: "" });
  const [applyingId, setApplyingId] = useState(null);

  const userId = user._id ?? user.id;

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("gigride_token");
      let query = "/api/jobs?";
      if (filterType !== "all") query += `urgency=${filterType}&`;
      if (filterCategory !== "All Categories")
        query += `category=${encodeURIComponent(filterCategory)}&`;

      const res = await fetch(query, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
      setBanner({ type: "error", text: "Could not load gigs. Try refresh." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setBanner({ type: "", text: "" });
    fetchJobs();
  }, [filterType, filterCategory]);

  useEffect(() => {
    if (!banner.text) return;
    const t = window.setTimeout(() => setBanner({ type: "", text: "" }), 6000);
    return () => window.clearTimeout(t);
  }, [banner.text]);

  const myApplications = useMemo(
    () => jobs.filter((j) => applicantIncludesUser(j, userId)),
    [jobs, userId]
  );

  const availableGigs = useMemo(
    () => jobs.filter((j) => !applicantIncludesUser(j, userId)),
    [jobs, userId]
  );

  const handleApply = async (jobId) => {
    const job = jobs.find((j) => j._id === jobId);
    if (job && applicantIncludesUser(job, userId)) return;
    if (applyingId === jobId) return;

    setApplyingId(jobId);
    setBanner({ type: "", text: "" });
    try {
      const token = localStorage.getItem("gigride_token");
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setBanner({
          type: "success",
          text: data.message || "You have applied to this gig.",
        });
        await fetchJobs();
      } else {
        setBanner({
          type: "error",
          text: data.message || "Could not apply (you may already be on this gig).",
        });
      }
    } catch (err) {
      console.error(err);
      setBanner({ type: "error", text: "Network error. Try again." });
    } finally {
      setApplyingId(null);
    }
  };

  const cardShell = {
    background: "#fff",
    borderRadius: "16px",
    border: `1px solid ${border}`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 10px 28px rgba(15,23,42,0.06)",
  };

  const GigCard = ({ job, showApply }) => {
    const instant = job.urgency === "instant";
    return (
      <div
        style={{
          padding: "1.25rem 1.35rem",
          borderRadius: "14px",
          border: `1px solid ${border}`,
          background: "#fafafa",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              flexShrink: 0,
              background: instant ? "#fff7ed" : ink,
              color: instant ? "#ea580c" : yellow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {instant ? <Zap size={22} /> : <Briefcase size={22} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: "1.05rem", color: ink, lineHeight: 1.3 }}>{job.title}</div>
            <div
              style={{
                marginTop: "0.35rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.65rem",
                color: muted,
                fontSize: "0.875rem",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <MapPin size={14} /> {job.location || "—"}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <Clock size={14} /> {job.urgency || "—"}
              </span>
              <span style={{ fontWeight: 700, color: "#b45309" }}>{jobPay(job)}</span>
            </div>
          </div>
        </div>
        {showApply && (
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.15rem", borderTop: `1px solid ${border}` }}>
            <button
              type="button"
              disabled={applyingId === job._id}
              onClick={() => handleApply(job._id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.65rem 1.15rem",
                borderRadius: "10px",
                border: "none",
                fontWeight: 800,
                fontSize: "0.9rem",
                cursor: applyingId === job._id ? "wait" : "pointer",
                opacity: applyingId === job._id ? 0.7 : 1,
                background: ink,
                color: yellow,
                boxShadow: "0 6px 18px rgba(15,23,42,0.15)",
                transition: "background 0.2s ease, color 0.2s ease, transform 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (applyingId !== job._id) {
                  e.currentTarget.style.background = yellow;
                  e.currentTarget.style.color = ink;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = ink;
                e.currentTarget.style.color = yellow;
              }}
            >
              <Send size={17} />
              Apply
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        padding: "clamp(1rem, 3vw, 2rem)",
        background: "linear-gradient(165deg, #0f172a 0%, #020617 42%, #171717 100%)",
      }}
    >
      <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ ...cardShell, padding: "1.5rem 1.75rem" }}>
          <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", color: yellow }}>WORKER</p>
          <h1 style={{ margin: "0.35rem 0 0", fontSize: "clamp(1.45rem, 3vw, 1.85rem)", fontWeight: 800, color: "#fff" }}>
            {user.name}
          </h1>
          <p style={{ margin: "0.45rem 0 0", color: "#94a3b8", fontSize: "0.95rem", maxWidth: "36rem" }}>
            Open gigs you can still join, and a separate list for everything you have applied to.
          </p>
        </div>

        {banner.text && (
          <div
            style={{
              ...cardShell,
              padding: "0.85rem 1.1rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: banner.type === "success" ? "#166534" : "#b91c1c",
              background: banner.type === "success" ? "#f0fdf4" : "#fef2f2",
              borderColor: banner.type === "success" ? "#bbf7d0" : "#fecaca",
            }}
          >
            {banner.text}
          </div>
        )}

        <div
          style={{
            ...cardShell,
            padding: "1rem 1.15rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.65rem",
            alignItems: "center",
          }}
        >
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              flex: "1 1 200px",
              maxWidth: "280px",
              padding: "0.55rem 0.65rem",
              borderRadius: "10px",
              border: `1px solid ${border}`,
              fontSize: "0.9rem",
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              flex: "1 1 160px",
              maxWidth: "200px",
              padding: "0.55rem 0.65rem",
              borderRadius: "10px",
              border: `1px solid ${border}`,
              fontSize: "0.9rem",
            }}
          >
            <option value="all">All types</option>
            <option value="instant">Instant</option>
            <option value="part-time">Part-time</option>
          </select>
          <button
            type="button"
            onClick={fetchJobs}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.55rem 1rem",
              borderRadius: "10px",
              border: `1px solid ${border}`,
              background: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <section style={{ ...cardShell, padding: "1.5rem 1.75rem 1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.1rem" }}>
            <Briefcase size={22} color="#b45309" />
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: ink }}>Available gigs</h2>
          </div>
          {loading ? (
            <p style={{ color: muted, margin: 0 }}>Loading gigs…</p>
          ) : availableGigs.length === 0 ? (
            <p style={{ color: muted, margin: 0 }}>
              {jobs.length === 0 ? "No open gigs match your filters." : "You have applied to all gigs in this list."}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {availableGigs.map((job) => (
                <GigCard key={job._id} job={job} showApply />
              ))}
            </div>
          )}
        </section>

        <section style={{ ...cardShell, padding: "1.5rem 1.75rem 1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.65rem" }}>
            <ClipboardList size={22} color="#b45309" />
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: ink }}>Applied gigs</h2>
          </div>
          <p style={{ margin: "0 0 1.1rem", color: muted, fontSize: "0.875rem" }}>
            Track status for gigs you have already applied to.
          </p>
          {loading ? null : myApplications.length === 0 ? (
            <p style={{ color: muted, margin: 0 }}>No applications yet. Apply from the list above.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {myApplications.map((job) => {
                const mine = job.applicants?.find((a) => {
                  const s = a.seeker;
                  const sid = s && typeof s === "object" && s._id ? String(s._id) : String(s);
                  return sid === String(userId);
                });
                const status = mine?.status || "pending";
                return (
                  <div
                    key={`app-${job._id}`}
                    style={{
                      padding: "1.2rem 1.35rem",
                      borderRadius: "14px",
                      border: `1px solid ${border}`,
                      background: "#fafafa",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start", minWidth: 0 }}>
                      <CheckCircle2 size={22} style={{ color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <div style={{ fontWeight: 800, color: ink }}>{job.title}</div>
                        <div style={{ color: muted, fontSize: "0.85rem", marginTop: "0.2rem" }}>
                          {job.category} · {jobPay(job)}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "999px",
                        background:
                          status === "accepted" ? "#dcfce7" : status === "rejected" ? "#fee2e2" : "#fef9c3",
                        color:
                          status === "accepted" ? "#166534" : status === "rejected" ? "#b91c1c" : "#854d0e",
                      }}
                    >
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default WorkerDashboard;
