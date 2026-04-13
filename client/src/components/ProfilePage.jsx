import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Mail,
  MapPin,
  Briefcase,
  Star,
  Settings,
  CheckCircle,
  LogOut,
  Shield,
  Clock,
  TrendingUp,
  FileText,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const SKILL_TAGS = [
  "Electrician", "Plumber", "Carpenter", "Tutor",
  "Delivery Helper", "Driver", "Cleaner", "Other",
];

// ─── component ───────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate();

  // ── 1. Read from localStorage safely ──────────────────────────────────────
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
  });
  const [token]               = useState(() => localStorage.getItem("token") || null);

  // ── 2. Component state ────────────────────────────────────────────────────
  const [loading, setLoading]       = useState(true);
  const [apiError, setApiError]     = useState("");
  const [jobs, setJobs]             = useState([]);
  const [isEditing, setIsEditing]   = useState(false);
  const [saveMsg, setSaveMsg]       = useState("");
  const [editForm, setEditForm]     = useState({
    name: "", location: "", companyName: "", skills: [], isOnline: false,
  });

  // ── 3. Fetch user from backend (fallback to localStorage) ─────────────────
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setApiError("");

      // If no token at all → redirect
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const freshUser = data.user;
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        } else {
          // Backend rejected token → fall back to localStorage user
          if (!user) {
            navigate("/login");
            return;
          }
          setApiError("Could not refresh profile — showing cached data.");
        }
      } catch {
        // Network error → fall back
        if (!user) {
          navigate("/login");
          return;
        }
        setApiError("Network error — showing cached data.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Sync edit form when user loads
  useEffect(() => {
    if (user) {
      setEditForm({
        name:        user.name        || "",
        location:    user.location    || "",
        companyName: user.companyName || "",
        skills:      user.skills      || [],
        isOnline:    user.isOnline    || false,
      });
    }
  }, [user]);

  // Fetch gig/job history (non-fatal)
  useEffect(() => {
    if (!user?.id && !user?._id) return;
    const uid = user.id || user._id;
    const fetchJobs = async () => {
      try {
        const res = await fetch(`/api/jobs/user/${uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
        }
      } catch { /* non-fatal */ }
    };
    fetchJobs();
  }, [user, token]);

  // ── 4. Save profile ───────────────────────────────────────────────────────
  const handleUpdate = async (e) => {
    e.preventDefault();
    const uid = user?.id || user?._id;
    if (!uid) return;
    try {
      const res = await fetch(`/api/profile/${uid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.user;
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        setIsEditing(false);
        setSaveMsg("Profile updated!");
        setTimeout(() => setSaveMsg(""), 3000);
      }
    } catch (err) {
      console.error("Profile update error:", err);
    }
  };

  const handleSkillToggle = (skill) => {
    setEditForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // ── 5. Derived values ─────────────────────────────────────────────────────
  const isProvider = user?.role === "provider";
  const themeColor = isProvider ? "#16a34a" : "#2563eb";   // green : blue
  const themeBg    = isProvider ? "#f0fdf4" : "#eff6ff";
  const themeBorder= isProvider ? "#bbf7d0" : "#bfdbfe";
  const roleLabel  = isProvider ? "Job Provider" : "Job Seeker";

  // ── 6. Loading screen ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#f8fafc",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: `4px solid #e2e8f0`,
            borderTopColor: themeColor,
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 1rem",
          }} />
          <p style={{ color: "#64748b", fontWeight: 500 }}>Loading your profile...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── 7. No user fallback (should not reach here — useEffect redirects) ─────
  if (!user) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#f8fafc",
      }}>
        <div style={{
          background: "white", borderRadius: 20, padding: "3rem",
          textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        }}>
          <UserIcon size={64} style={{ color: "#cbd5e1", marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b" }}>
            Not Logged In
          </h2>
          <p style={{ color: "#64748b", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
            Please sign in to view your profile.
          </p>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "0.75rem 2rem", background: "#0f172a", color: "white",
              border: "none", borderRadius: 12, fontWeight: 600, cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // ── 8. Main render ────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: "#f8fafc",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .skill-btn { transition: all 0.15s ease; }
        .skill-btn:hover { transform: translateY(-1px); }
        .action-btn { transition: all 0.15s ease; cursor: pointer; border: none; }
        .action-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        .action-btn:active { transform: translateY(0); }
        .card-hover { transition: box-shadow 0.2s ease; }
        .card-hover:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
      `}</style>

      {/* ── Top nav bar ── */}
      <nav style={{
        background: "white", borderBottom: "1px solid #e2e8f0",
        padding: "1rem 2rem", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: themeColor, display: "flex", alignItems: "center",
            justifyContent: "center",
          }}>
            <Briefcase size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>
            GigRide
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            className="action-btn"
            onClick={() => navigate(isProvider ? "/provider/dashboard" : "/seeker/dashboard")}
            style={{
              padding: "0.5rem 1.25rem", borderRadius: 10,
              background: themeBg, color: themeColor,
              fontWeight: 600, fontSize: "0.9rem", border: `1px solid ${themeBorder}`,
            }}
          >
            Dashboard
          </button>
          <button
            className="action-btn"
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1.25rem", borderRadius: 10,
              background: "#fef2f2", color: "#dc2626",
              fontWeight: 600, fontSize: "0.9rem", border: "1px solid #fecaca",
              display: "flex", alignItems: "center", gap: "0.4rem",
            }}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </nav>

      {/* ── Page content ── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* API error banner */}
        {apiError && (
          <div style={{
            background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12,
            padding: "0.75rem 1.25rem", marginBottom: "1.5rem",
            color: "#92400e", fontSize: "0.9rem", display: "flex", gap: "0.5rem",
          }}>
            ⚠️ {apiError}
          </div>
        )}

        {/* Save success banner */}
        {saveMsg && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12,
            padding: "0.75rem 1.25rem", marginBottom: "1.5rem",
            color: "#166534", fontSize: "0.9rem",
          }}>
            ✅ {saveMsg}
          </div>
        )}

        {/* ── Profile Hero Card ── */}
        <div style={{
          background: `linear-gradient(135deg, ${themeColor} 0%, ${isProvider ? "#15803d" : "#1d4ed8"} 100%)`,
          borderRadius: 24, padding: "2.5rem", color: "white",
          marginBottom: "1.5rem", position: "relative", overflow: "hidden",
        }}>
          {/* decorative circle */}
          <div style={{
            position: "absolute", right: -60, top: -60,
            width: 300, height: 300, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }} />

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", position: "relative" }}>
            {/* Avatar */}
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              border: "3px solid rgba(255,255,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", fontWeight: 800, color: "white",
              flexShrink: 0,
            }}>
              {getInitials(user?.name)}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                {user?.name || "Unknown User"}
              </h1>
              <div style={{
                display: "flex", gap: "1rem", marginTop: "0.6rem",
                flexWrap: "wrap", alignItems: "center",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", opacity: 0.85, fontSize: "0.9rem" }}>
                  <Mail size={14} /> {user?.email || "—"}
                </span>
                {user?.location && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", opacity: 0.85, fontSize: "0.9rem" }}>
                    <MapPin size={14} /> {user.location}
                  </span>
                )}
              </div>
              {/* Role badge */}
              <div style={{
                marginTop: "0.75rem", display: "inline-flex", alignItems: "center",
                gap: "0.4rem", background: "rgba(255,255,255,0.2)",
                padding: "0.3rem 0.9rem", borderRadius: 999, fontSize: "0.82rem",
                fontWeight: 700, border: "1px solid rgba(255,255,255,0.3)",
              }}>
                <Shield size={13} /> {roleLabel}
              </div>

              {/* Rating */}
              {(user?.ratings?.count || 0) > 0 && (
                <div style={{
                  marginTop: "0.5rem", display: "flex", alignItems: "center",
                  gap: "0.3rem", opacity: 0.9, fontSize: "0.85rem",
                }}>
                  <Star size={14} fill="currentColor" color="#fbbf24" />
                  <span style={{ color: "#fde68a", fontWeight: 700 }}>
                    {user.ratings.average?.toFixed(1)}
                  </span>
                  <span style={{ opacity: 0.7 }}>
                    ({user.ratings.count} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Edit button */}
            <button
              className="action-btn"
              onClick={() => setIsEditing(!isEditing)}
              style={{
                padding: "0.75rem 1.5rem", borderRadius: 12, fontWeight: 700,
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white", fontSize: "0.9rem",
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}
            >
              <Settings size={16} />
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* ── Edit Form ── */}
        {isEditing && (
          <div style={{
            background: "white", borderRadius: 20, padding: "2rem",
            marginBottom: "1.5rem", border: `1px solid ${themeBorder}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}>
            <h3 style={{ fontWeight: 700, color: "#0f172a", marginBottom: "1.5rem", fontSize: "1.1rem" }}>
              Edit Profile
            </h3>
            <form onSubmit={handleUpdate}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#64748b", marginBottom: "0.4rem" }}>
                    Full Name
                  </label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    style={{
                      width: "100%", padding: "0.65rem 1rem",
                      border: "1.5px solid #e2e8f0", borderRadius: 10,
                      fontSize: "0.95rem", outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#64748b", marginBottom: "0.4rem" }}>
                    Location
                  </label>
                  <input
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="City, State"
                    style={{
                      width: "100%", padding: "0.65rem 1rem",
                      border: "1.5px solid #e2e8f0", borderRadius: 10,
                      fontSize: "0.95rem", outline: "none",
                    }}
                  />
                </div>
              </div>

              {isProvider && (
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#64748b", marginBottom: "0.4rem" }}>
                    Company / Business Name
                  </label>
                  <input
                    value={editForm.companyName}
                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                    placeholder="Acme Corp"
                    style={{
                      width: "100%", padding: "0.65rem 1rem",
                      border: "1.5px solid #e2e8f0", borderRadius: 10,
                      fontSize: "0.95rem", outline: "none",
                    }}
                  />
                </div>
              )}

              {!isProvider && (
                <div style={{ marginBottom: "1rem" }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b", marginBottom: "0.6rem" }}>
                    Your Skills
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {SKILL_TAGS.map((skill) => {
                      const selected = editForm.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          className="skill-btn"
                          onClick={() => handleSkillToggle(skill)}
                          style={{
                            padding: "0.4rem 0.9rem", borderRadius: 999, fontSize: "0.82rem",
                            fontWeight: 600, cursor: "pointer",
                            background: selected ? themeColor : "white",
                            color: selected ? "white" : "#475569",
                            border: `1.5px solid ${selected ? themeColor : "#e2e8f0"}`,
                          }}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!isProvider && (
                <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", marginBottom: "1.25rem", fontSize: "0.9rem", fontWeight: 500, color: "#374151" }}>
                  <input
                    type="checkbox"
                    checked={editForm.isOnline}
                    onChange={(e) => setEditForm({ ...editForm, isOnline: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: themeColor }}
                  />
                  I am Available (Online for Instant Gigs)
                </label>
              )}

              <button
                type="submit"
                className="action-btn"
                style={{
                  padding: "0.75rem 2rem", background: themeColor, color: "white",
                  borderRadius: 12, fontWeight: 700, fontSize: "0.95rem",
                }}
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* ── Stats + Info grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>

          {/* Left: Details card */}
          <div>
            <div
              className="card-hover"
              style={{
                background: "white", borderRadius: 20, padding: "1.5rem",
                border: `1px solid ${themeBorder}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {isProvider
                  ? <><Briefcase size={16} color={themeColor} /> Business Details</>
                  : <><CheckCircle size={16} color={themeColor} /> Seeker Details</>
                }
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>

                {isProvider ? (
                  <>
                    <InfoRow label="Company" value={user?.companyName || "Not set"} />
                    <InfoRow label="Jobs Posted" value={jobs.length} highlight={themeColor} />
                    <InfoRow label="Total Spent" value="$0.00" />
                  </>
                ) : (
                  <>
                    <InfoRow
                      label="Status"
                      value={user?.isOnline ? "🟢 Online" : "⚪ Offline"}
                      highlight={user?.isOnline ? "#16a34a" : undefined}
                    />
                    <InfoRow label="Jobs Applied" value={jobs.length} highlight={themeColor} />
                    <div>
                      <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Skills
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                        {(user?.skills?.length > 0) ? user.skills.map((s) => (
                          <span key={s} style={{
                            padding: "0.25rem 0.65rem", borderRadius: 999,
                            background: themeBg, color: themeColor,
                            fontSize: "0.78rem", fontWeight: 600,
                            border: `1px solid ${themeBorder}`,
                          }}>
                            {s}
                          </span>
                        )) : (
                          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>No skills added yet.</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <InfoRow
                  label="Rating"
                  value={user?.ratings?.count > 0
                    ? `⭐ ${user.ratings.average?.toFixed(1)} (${user.ratings.count})`
                    : "No ratings yet"
                  }
                />
              </div>
            </div>
          </div>

          {/* Right: Gig history */}
          <div>
            <div
              className="card-hover"
              style={{
                background: "white", borderRadius: 20, padding: "1.5rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText size={16} color={themeColor} />
                {isProvider ? "Jobs Posted" : "Applied Jobs"}
              </h3>

              {jobs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                  <TrendingUp size={48} style={{ color: "#e2e8f0", marginBottom: "0.75rem" }} />
                  <p style={{ color: "#94a3b8", fontWeight: 500 }}>
                    {isProvider
                      ? "No jobs posted yet. Head to your dashboard to post one!"
                      : "No jobs applied to yet. Browse gigs and start applying!"
                    }
                  </p>
                  <button
                    className="action-btn"
                    onClick={() => navigate(isProvider ? "/provider/dashboard" : "/seeker/dashboard")}
                    style={{
                      marginTop: "1rem", padding: "0.6rem 1.5rem",
                      background: themeColor, color: "white",
                      borderRadius: 10, fontWeight: 600, fontSize: "0.9rem",
                    }}
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      style={{
                        padding: "1rem 1.25rem", borderRadius: 14,
                        border: "1px solid #f1f5f9", background: "#fafafa",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.95rem" }}>
                          {job.title}
                        </p>
                        <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                          {job.category} {job.location ? `• ${job.location}` : ""}
                        </p>
                      </div>
                      <span style={{
                        padding: "0.25rem 0.75rem", borderRadius: 999,
                        background: job.isOpen ? "#f0fdf4" : "#f1f5f9",
                        color: job.isOpen ? "#16a34a" : "#64748b",
                        fontSize: "0.78rem", fontWeight: 700,
                        border: `1px solid ${job.isOpen ? "#bbf7d0" : "#e2e8f0"}`,
                        whiteSpace: "nowrap",
                      }}>
                        {job.isOpen ? "Active" : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
              <StatTile
                icon={<Clock size={20} color={themeColor} />}
                label="Member Since"
                value={user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                  : "—"
                }
                bg={themeBg} border={themeBorder}
              />
              <StatTile
                icon={<Star size={20} color={themeColor} />}
                label="Total Reviews"
                value={user?.ratings?.count || 0}
                bg={themeBg} border={themeBorder}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, value, highlight }) {
  return (
    <div>
      <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>
        {label}
      </p>
      <p style={{ fontWeight: 600, color: highlight || "#1e293b", fontSize: "0.95rem" }}>
        {value}
      </p>
    </div>
  );
}

function StatTile({ icon, label, value, bg, border }) {
  return (
    <div style={{
      background: bg || "white", border: `1px solid ${border || "#e2e8f0"}`,
      borderRadius: 16, padding: "1.1rem 1.25rem",
      display: "flex", alignItems: "center", gap: "0.75rem",
    }}>
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
        <p style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>{value}</p>
      </div>
    </div>
  );
}
