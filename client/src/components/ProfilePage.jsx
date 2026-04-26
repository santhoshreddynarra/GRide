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
  Phone,
  Heart,
  Gift,
  HelpCircle,
  Copy,
  Share2,
  Calendar,
  Users,
} from "lucide-react";
import EarningsSection from "./EarningsSection";
import ProviderStatsSection from "./ProviderStatsSection";
import BadgeList from "./BadgeList";

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
    try {
      return JSON.parse(localStorage.getItem("user") || localStorage.getItem("gigride_user")) || null;
    }
    catch { return null; }
  });
  const [token]               = useState(() =>
    localStorage.getItem("token") || localStorage.getItem("gigride_token") || null
  );

  // ── 2. Component state ────────────────────────────────────────────────────
  const [loading, setLoading]       = useState(true);
  const [apiError, setApiError]     = useState("");
  const [jobs, setJobs]             = useState([]);
  const [reviews, setReviews]       = useState([]);
  const [isEditing, setIsEditing]   = useState(false);
  const [saveMsg, setSaveMsg]       = useState("");
  const [copiedRef, setCopiedRef]   = useState(false);
  const [editForm, setEditForm]     = useState({
    name: "", location: "", companyName: "", skills: [], isOnline: false,
    phone: "", gender: "", dob: "", emergencyContact: "",
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
        name:             user.name             || "",
        location:         user.location         || "",
        companyName:      user.companyName      || "",
        skills:           user.skills           || [],
        isOnline:         user.isOnline         || false,
        phone:            user.phone            || "",
        gender:           user.gender           || "",
        dob:              user.dob              || "",
        emergencyContact: user.emergencyContact || "",
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

  // Fetch reviews received by this user (non-fatal)
  useEffect(() => {
    if (!token) return;
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/reviews/about-me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
        }
      } catch { /* non-fatal */ }
    };
    fetchReviews();
  }, [token]);

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
    ["token", "user", "role", "gigride_token", "gigride_user", "gigride_role"].forEach(k =>
      localStorage.removeItem(k)
    );
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
            onClick={() => navigate("/reviews/me")}
            style={{
              padding: "0.5rem 1.25rem", borderRadius: 10,
              background: "#fffbeb", color: "#b45309",
              fontWeight: 600, fontSize: "0.9rem", border: "1px solid #fde68a",
              display: "flex", alignItems: "center", gap: "0.4rem",
            }}
          >
            <Star size={15} /> My Reviews
          </button>
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

        {/* ── Earned Badges ── */}
        {BadgeList && (
          <div style={{ marginBottom: '1.5rem' }}>
            <BadgeList
              user={user}
              jobsPosted={isProvider ? jobs.length : 0}
            />
          </div>
        )}

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

        {/* ── Reviews Section ── */}
        <div style={{ marginTop: "1.5rem" }}>
          <div
            className="card-hover"
            style={{
              background: "white", borderRadius: 20, padding: "1.5rem",
              border: `1px solid ${themeBorder}`,
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Star size={16} color={themeColor} />
                Reviews I've Received
              </h3>
              {reviews.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "#fefce8", border: "1px solid #fde68a", borderRadius: 999, padding: "0.25rem 0.75rem" }}>
                  <Star size={14} fill="#eab308" color="#eab308" />
                  <span style={{ fontWeight: 800, color: "#92400e", fontSize: "0.9rem" }}>
                    {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                  </span>
                  <span style={{ color: "#a16207", fontSize: "0.8rem" }}>/ 5 ({reviews.length})</span>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <Star size={40} style={{ color: "#e2e8f0", marginBottom: "0.5rem" }} />
                <p style={{ color: "#94a3b8", fontWeight: 500 }}>
                  No reviews yet. Complete jobs to get reviewed!
                </p>
                <button
                  className="action-btn"
                  onClick={() => navigate("/reviews/me")}
                  style={{ marginTop: "0.75rem", padding: "0.5rem 1.25rem", background: themeColor, color: "white", borderRadius: 10, fontWeight: 600, fontSize: "0.85rem" }}
                >
                  View Full Reviews Page
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {reviews.slice(0, 3).map((review) => (
                  <div
                    key={review._id}
                    style={{
                      padding: "1rem 1.25rem", borderRadius: 14,
                      border: `1px solid ${themeBorder}`, background: themeBg,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div>
                        <p style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                          {review.reviewer?.name || "Anonymous"}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          {review.job?.title || "Job"}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={13} fill={s <= review.rating ? "#eab308" : "transparent"} color={s <= review.rating ? "#eab308" : "#d1d5db"} />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p style={{ fontSize: "0.85rem", color: "#475569", fontStyle: "italic", borderLeft: `3px solid ${themeColor}`, paddingLeft: "0.6rem" }}>
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))}
                {reviews.length > 3 && (
                  <button
                    className="action-btn"
                    onClick={() => navigate("/reviews/me")}
                    style={{ padding: "0.6rem", background: themeBg, color: themeColor, borderRadius: 10, fontWeight: 600, fontSize: "0.85rem", border: `1px solid ${themeBorder}` }}
                  >
                    View all {reviews.length} reviews →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            SECTION: Earnings Overview (seeker only)
        ═══════════════════════════════════════════════════════ */}
        {!isProvider && (
          <div style={{ marginTop: "1.5rem" }}>
            <EarningsSection token={token} />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION: Jobs Overview (provider only)
        ═══════════════════════════════════════════════════════ */}
        {isProvider && (
          <div style={{ marginTop: "1.5rem" }}>
            <ProviderStatsSection token={token} />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION: Personal Details
        ═══════════════════════════════════════════════════════ */}
        <div style={{ marginTop: "1.5rem" }}>
          <SectionCard title="Personal Details" icon={<UserIcon size={16} color={themeColor} />} themeColor={themeColor} themeBorder={themeBorder}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
              <PersonalRow icon={<Mail size={14} />} label="Email" value={user?.email || "—"} />
              <PersonalRow icon={<Phone size={14} />} label="Phone" value={user?.phone || "Not set"} />
              <PersonalRow icon={<MapPin size={14} />} label="Location" value={user?.location || "Not set"} />
              <PersonalRow icon={<Users size={14} />} label="Gender" value={user?.gender || "Not specified"} />
              <PersonalRow icon={<Calendar size={14} />} label="Date of Birth" value={user?.dob ? new Date(user.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not set"} />
              <PersonalRow icon={<Heart size={14} />} label="Emergency Contact" value={user?.emergencyContact || "Not set"} />
            </div>

            {/* Edit extended fields */}
            {isEditing && (
              <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid #f1f5f9" }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Extended Details</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {[
                    { key: "phone",            placeholder: "+91 98765 43210",  label: "Phone" },
                    { key: "emergencyContact",  placeholder: "Name · Number",   label: "Emergency Contact" },
                  ].map(({ key, placeholder, label }) => (
                    <div key={key}>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#64748b", marginBottom: "0.3rem" }}>{label}</label>
                      <input
                        value={editForm[key]}
                        onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                        placeholder={placeholder}
                        style={{ width: "100%", padding: "0.6rem 0.9rem", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#64748b", marginBottom: "0.3rem" }}>Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem 0.9rem", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: "0.9rem", outline: "none", background: "white" }}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#64748b", marginBottom: "0.3rem" }}>Date of Birth</label>
                    <input
                      type="date"
                      value={editForm.dob}
                      onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem 0.9rem", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ═══════════════════════════════════════════════════════
            SECTION: Previous Works
        ═══════════════════════════════════════════════════════ */}
        <div style={{ marginTop: "1.5rem" }}>
          <SectionCard title="Previous Works" icon={<Briefcase size={16} color={themeColor} />} themeColor={themeColor} themeBorder={themeBorder}>
            {jobs.filter(j => !j.isOpen || j.status === "completed").length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <TrendingUp size={40} style={{ color: "#e2e8f0", marginBottom: "0.75rem" }} />
                <p style={{ color: "#94a3b8", fontWeight: 500, marginBottom: "1rem" }}>
                  No completed jobs yet. Start applying!
                </p>
                <button
                  className="action-btn"
                  onClick={() => navigate(isProvider ? "/provider/dashboard" : "/seeker/dashboard")}
                  style={{ padding: "0.5rem 1.25rem", background: themeColor, color: "white", borderRadius: 10, fontWeight: 600, fontSize: "0.85rem" }}
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {jobs.slice(0, 6).map((job) => (
                  <div key={job._id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "0.85rem 1.1rem", borderRadius: 12,
                    background: "#fafafa", border: "1px solid #f1f5f9",
                  }}>
                    <div>
                      <p style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.92rem" }}>{job.title}</p>
                      <p style={{ fontSize: "0.77rem", color: "#94a3b8", marginTop: 2 }}>
                        {job.category}{job.location ? ` · ${job.location}` : ""}
                        {(job.payAmount || job.price) ? ` · ₹${job.payAmount || job.price}/${job.payRate || "hr"}` : ""}
                      </p>
                    </div>
                    <span style={{
                      padding: "0.22rem 0.7rem", borderRadius: 999, fontSize: "0.73rem", fontWeight: 700,
                      background: job.status === "completed" ? "#f0fdf4" : job.isOpen ? themeBg : "#f1f5f9",
                      color: job.status === "completed" ? "#16a34a" : job.isOpen ? themeColor : "#64748b",
                      border: `1px solid ${job.status === "completed" ? "#bbf7d0" : job.isOpen ? themeBorder : "#e2e8f0"}`,
                      whiteSpace: "nowrap",
                    }}>
                      {job.status === "completed" ? "Completed" : job.isOpen ? "Active" : "Closed"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ═══════════════════════════════════════════════════════
            SECTION: Help + Refer & Earn (side by side)
        ═══════════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>

          {/* Help */}
          <SectionCard title="Help & Support" icon={<HelpCircle size={16} color={themeColor} />} themeColor={themeColor} themeBorder={themeBorder}>
            <p style={{ fontSize: "0.88rem", color: "#64748b", marginBottom: "1.25rem", lineHeight: 1.6 }}>
              Having trouble? Our support team is here to help you 24/7.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <HelpItem q="How do I apply for a job?" />
              <HelpItem q="When do I get paid?" />
              <HelpItem q="How does the rating system work?" />
            </div>
            <a
              href={`mailto:support@gigride.in?subject=Support Request from ${encodeURIComponent(user?.name || 'User')}`}
              className="action-btn"
              style={{
                marginTop: "1.25rem", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "0.5rem",
                padding: "0.65rem 1.25rem", borderRadius: 12,
                background: themeColor, color: "white",
                fontWeight: 700, fontSize: "0.88rem",
                textDecoration: "none",
              }}
            >
              <HelpCircle size={15} /> Need Help?
            </a>
          </SectionCard>

          {/* Refer & Earn */}
          <SectionCard title="Refer & Earn" icon={<Gift size={16} color={themeColor} />} themeColor={themeColor} themeBorder={themeBorder}>
            <p style={{ fontSize: "0.88rem", color: "#64748b", marginBottom: "1.25rem", lineHeight: 1.6 }}>
              Invite friends to GigRide and earn ₹100 for each successful referral!
            </p>

            {/* Referral code box */}
            <div style={{
              background: themeBg, border: `1.5px dashed ${themeColor}55`,
              borderRadius: 12, padding: "0.85rem 1rem",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "1rem",
            }}>
              <div>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Your Code</p>
                <p style={{ fontWeight: 900, fontSize: "1.2rem", color: themeColor, letterSpacing: 2, marginTop: 2 }}>
                  {`GR${(user?.name || "USER").replace(/\s/g, "").toUpperCase().slice(0, 4)}${String(user?._id || user?.id || "0").slice(-4).toUpperCase()}`}
                </p>
              </div>
              <button
                className="action-btn"
                onClick={() => {
                  const code = `GR${(user?.name || "USER").replace(/\s/g, "").toUpperCase().slice(0, 4)}${String(user?._id || user?.id || "0").slice(-4).toUpperCase()}`;
                  navigator.clipboard.writeText(code).catch(() => {});
                  setCopiedRef(true);
                  setTimeout(() => setCopiedRef(false), 2000);
                }}
                style={{
                  padding: "0.4rem 0.85rem", borderRadius: 8, fontSize: "0.78rem",
                  background: copiedRef ? "#16a34a" : themeColor, color: "white",
                  fontWeight: 700, display: "flex", alignItems: "center", gap: "0.35rem",
                  transition: "background 0.2s",
                }}
              >
                <Copy size={13} /> {copiedRef ? "Copied!" : "Copy"}
              </button>
            </div>

            <button
              className="action-btn"
              onClick={() => {
                const code = `GR${(user?.name || "USER").replace(/\s/g, "").toUpperCase().slice(0, 4)}${String(user?._id || user?.id || "0").slice(-4).toUpperCase()}`;
                if (navigator.share) {
                  navigator.share({ title: "Join GigRide!", text: `Use my code ${code} to sign up on GigRide and earn ₹50 bonus!`, url: window.location.origin });
                }
              }}
              style={{
                width: "100%", padding: "0.65rem 1.25rem", borderRadius: 12,
                background: "white", color: themeColor,
                fontWeight: 700, fontSize: "0.88rem",
                border: `1.5px solid ${themeColor}`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              }}
            >
              <Share2 size={15} /> Invite a Friend
            </button>
          </SectionCard>
        </div>

        {/* Bottom padding */}
        <div style={{ height: "2rem" }} />

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

// ── SectionCard ───────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children, themeColor, themeBorder }) {
  return (
    <div
      style={{
        background: "white", borderRadius: 20, padding: "1.5rem",
        border: `1px solid ${themeBorder || "#e2e8f0"}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; }}
    >
      <h3 style={{
        fontWeight: 700, fontSize: "1rem", color: "#0f172a",
        marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem",
      }}>
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

// ── PersonalRow ───────────────────────────────────────────────────────────────
function PersonalRow({ icon, label, value }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "0.2rem",
      padding: "0.75rem 1rem", background: "#f8fafc", borderRadius: 12,
      border: "1px solid #f1f5f9",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "0.4rem",
        fontSize: "0.72rem", fontWeight: 700,
        color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em",
      }}>
        <span style={{ color: "#cbd5e1" }}>{icon}</span>
        {label}
      </div>
      <p style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.9rem" }}>{value}</p>
    </div>
  );
}

// ── HelpItem ──────────────────────────────────────────────────────────────────
function HelpItem({ q }) {
  return (
    <div style={{
      padding: "0.6rem 0.9rem", background: "#f8fafc",
      borderRadius: 10, border: "1px solid #f1f5f9",
      fontSize: "0.82rem", fontWeight: 500, color: "#475569",
      cursor: "default",
    }}>
      ❓ {q}
    </div>
  );
}

