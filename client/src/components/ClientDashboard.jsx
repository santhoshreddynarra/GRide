import React, { useState, useEffect } from "react";
import {
  Plus,
  Briefcase,
  MapPin,
  AlertCircle,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const CATEGORIES = [
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

function jobPay(job) {
  const amt = job.payAmount ?? job.price ?? "—";
  const rate = job.payRate ?? "";
  return rate ? `$${amt}/${rate}` : `$${amt}`;
}

const ClientDashboard = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    urgency: "part-time",
    location: "",
    payAmount: "",
    payRate: "hour",
  });

  const fetchMyJobs = async () => {
    try {
      const token = localStorage.getItem("gigride_token");
      const res = await fetch("/api/jobs/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      const token = localStorage.getItem("gigride_token");
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowPostForm(false);
        setFormData({
          title: "",
          description: "",
          category: CATEGORIES[0],
          urgency: "part-time",
          location: "",
          payAmount: "",
          payRate: "hour",
        });
        fetchMyJobs();
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.message || "Could not post gig.");
      }
    } catch (err) {
      console.error(err);
      setFormError("Something went wrong. Try again.");
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
      if (res.ok) fetchMyJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const totalApplicants = jobs.reduce((n, j) => n + (j.applicants?.length || 0), 0);

  const cardBase = {
    background: "#fff",
    borderRadius: "16px",
    border: `1px solid ${border}`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(15,23,42,0.06)",
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        padding: "clamp(1rem, 3vw, 2rem)",
        background: "linear-gradient(165deg, #f8fafc 0%, #eef2f7 50%, #fffbeb 100%)",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Header card */}
        <div
          style={{
            ...cardBase,
            padding: "1.5rem 1.75rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1.25rem",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.2em",
                color: "#b45309",
              }}
            >
              CLIENT
            </p>
            <h1
              style={{
                margin: "0.35rem 0 0",
                fontSize: "clamp(1.5rem, 3vw, 1.85rem)",
                fontWeight: 800,
                color: ink,
                letterSpacing: "-0.02em",
              }}
            >
              Hi, {user.name}
            </h1>
            <p style={{ margin: "0.4rem 0 0", color: muted, fontSize: "0.95rem", maxWidth: "32rem" }}>
              Post gigs, review interest, and close the loop when work is done.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowPostForm((v) => !v);
              setFormError("");
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.85rem 1.4rem",
              borderRadius: "12px",
              border: "none",
              background: ink,
              color: yellow,
              fontWeight: 800,
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(15,23,42,0.2)",
              transition: "transform 0.15s ease, box-shadow 0.2s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Plus size={20} strokeWidth={2.5} />
            Post New Gig
          </button>
        </div>

        {!showPostForm && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              { label: "Active gigs", value: jobs.length, icon: Briefcase, tint: "#fef3c7", iconColor: "#854d0e" },
              { label: "Total applicants", value: totalApplicants, icon: Users, tint: "#e0f2fe", iconColor: "#0369a1" },
              {
                label: "Your rating",
                value: user.ratings?.average != null ? Number(user.ratings.average).toFixed(1) : "—",
                icon: TrendingUp,
                tint: "#f0fdf4",
                iconColor: "#166534",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  ...cardBase,
                  padding: "1.15rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: s.tint,
                    color: s.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <s.icon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: muted, letterSpacing: "0.06em" }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: ink, lineHeight: 1.2 }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showPostForm && (
          <div style={{ ...cardBase, padding: "1.5rem 1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Sparkles size={22} color="#b45309" />
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: ink }}>Create a new gig</h2>
            </div>
            {formError && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  background: "#fef2f2",
                  color: "#b91c1c",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                {formError}
              </div>
            )}
            <form onSubmit={handlePostJob} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ fontWeight: 700, fontSize: "0.8rem", color: muted }}>Title</label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Same-day plumbing fix"
                    style={{
                      width: "100%",
                      marginTop: "0.35rem",
                      padding: "0.65rem 0.75rem",
                      borderRadius: "10px",
                      border: `1px solid ${border}`,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 700, fontSize: "0.8rem", color: muted }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: "100%",
                      marginTop: "0.35rem",
                      padding: "0.65rem 0.75rem",
                      borderRadius: "10px",
                      border: `1px solid ${border}`,
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontWeight: 700, fontSize: "0.8rem", color: muted }}>Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  style={{
                    width: "100%",
                    marginTop: "0.35rem",
                    padding: "0.65rem 0.75rem",
                    borderRadius: "10px",
                    border: `1px solid ${border}`,
                    resize: "vertical",
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ fontWeight: 700, fontSize: "0.8rem", color: muted }}>Location</label>
                  <div style={{ position: "relative", marginTop: "0.35rem" }}>
                    <MapPin
                      size={16}
                      style={{
                        position: "absolute",
                        left: "0.65rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8",
                      }}
                    />
                    <input
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "0.65rem 0.75rem 0.65rem 2rem",
                        borderRadius: "10px",
                        border: `1px solid ${border}`,
                      }}
                      placeholder="City or area"
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontWeight: 700, fontSize: "0.8rem", color: muted }}>Urgency</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    style={{
                      width: "100%",
                      marginTop: "0.35rem",
                      padding: "0.65rem 0.75rem",
                      borderRadius: "10px",
                      border: `1px solid ${border}`,
                    }}
                  >
                    <option value="instant">Instant</option>
                    <option value="part-time">Standard</option>
                    <option value="full-time">Ongoing</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 700, fontSize: "0.8rem", color: muted }}>Pay</label>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.35rem" }}>
                    <input
                      type="number"
                      required
                      value={formData.payAmount}
                      onChange={(e) => setFormData({ ...formData, payAmount: e.target.value })}
                      style={{ flex: 1, padding: "0.65rem 0.75rem", borderRadius: "10px", border: `1px solid ${border}` }}
                      placeholder="Amount"
                    />
                    <select
                      value={formData.payRate}
                      onChange={(e) => setFormData({ ...formData, payRate: e.target.value })}
                      style={{ flex: 1, padding: "0.65rem 0.75rem", borderRadius: "10px", border: `1px solid ${border}` }}
                    >
                      <option value="hour">/ hr</option>
                      <option value="day">/ day</option>
                      <option value="project">/ project</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>
                  Publish gig
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPostForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Gigs list */}
        <section style={{ ...cardBase, padding: "1.5rem 1.75rem 1.75rem" }}>
          <h2 style={{ margin: "0 0 1.25rem", fontSize: "1.1rem", fontWeight: 800, color: ink }}>Your gigs</h2>
          {loading ? (
            <p style={{ color: muted, margin: 0 }}>Loading your listings…</p>
          ) : jobs.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2.5rem 1.25rem",
                background: "#f8fafc",
                borderRadius: "14px",
                border: `2px dashed ${border}`,
              }}
            >
              <AlertCircle size={40} style={{ color: "#cbd5e1", marginBottom: "0.75rem" }} />
              <p style={{ color: muted, fontWeight: 600, margin: 0 }}>
                No gigs yet. Tap <strong>Post New Gig</strong> to get started.
              </p>
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {jobs.map((job) => {
                const applicants = job.applicants?.length || 0;
                return (
                  <li
                    key={job._id}
                    style={{
                      padding: "1.25rem 1.35rem",
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
                    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", minWidth: 0 }}>
                      <div
                        style={{
                          flexShrink: 0,
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          background: ink,
                          color: yellow,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Briefcase size={22} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: "1.05rem", color: ink }}>{job.title}</div>
                        <div style={{ color: muted, fontSize: "0.875rem", marginTop: "0.2rem" }}>
                          {job.category} · {job.location}
                        </div>
                        <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#b45309" }}>{jobPay(job)}</span>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              padding: "0.2rem 0.55rem",
                              borderRadius: "6px",
                              background: job.status === "open" ? "#dcfce7" : "#f1f5f9",
                              color: job.status === "open" ? "#166534" : muted,
                            }}
                          >
                            {job.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          padding: "0.45rem 0.85rem",
                          borderRadius: "999px",
                          background: "#fff",
                          border: `1px solid ${border}`,
                          fontWeight: 800,
                          fontSize: "0.85rem",
                          color: ink,
                        }}
                      >
                        <Users size={16} style={{ color: "#0369a1" }} />
                        {applicants} {applicants === 1 ? "applicant" : "applicants"}
                      </div>
                      {job.status === "filled" && (
                        <button type="button" className="btn btn-primary" onClick={() => handleCompleteJob(job._id)} style={{ fontWeight: 700 }}>
                          Complete
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default ClientDashboard;
