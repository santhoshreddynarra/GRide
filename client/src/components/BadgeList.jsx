/**
 * BadgeList — shows earned badges as pill chips
 *
 * Props:
 *   user        — { role, ratings: { count, average }, completedJobs: number }
 *   jobsPosted  — number (provider only, pass in from context)
 *   className   — extra tailwind classes
 */
export function computeBadges(user = {}, jobsPosted = 0) {
  const badges = [];
  const role        = user?.role;
  const avgRating   = user?.ratings?.average || 0;
  const completed   = user?.completedJobs || 0;

  if (role === 'seeker') {
    if (completed >= 5)   badges.push({ label: 'Top Performer 🏆', color: '#d97706', bg: '#fffbeb', border: '#fde68a' });
    if (avgRating >= 4.5) badges.push({ label: 'Highly Rated ⭐', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' });
    if (completed >= 1)   badges.push({ label: 'Active Worker 💼', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' });
  }

  if (role === 'provider') {
    if (jobsPosted >= 5) badges.push({ label: 'Active Recruiter 📋', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' });
    if (jobsPosted >= 1) badges.push({ label: 'Job Poster 🚀',       color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' });
    if (avgRating >= 4.5) badges.push({ label: 'Top Employer ⭐',    color: '#d97706', bg: '#fffbeb', border: '#fde68a' });
  }

  return badges;
}

export default function BadgeList({ user, jobsPosted = 0 }) {
  const badges = computeBadges(user, jobsPosted);
  if (badges.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
      {badges.map(b => (
        <span
          key={b.label}
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: 999,
            fontSize: '0.78rem',
            fontWeight: 700,
            color: b.color,
            background: b.bg,
            border: `1px solid ${b.border}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}
