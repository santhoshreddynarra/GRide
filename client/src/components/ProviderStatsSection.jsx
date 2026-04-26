import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Briefcase, Activity, CheckCircle, Star, TrendingUp } from 'lucide-react';

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white', border: '1px solid #e2e8f0', borderRadius: 12,
      padding: '0.6rem 1rem', boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
    }}>
      <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: '1rem', fontWeight: 800, color: '#2e7d32' }}>
        {payload[0].value} job{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

// ─── Stat card (mirrors EarningsSection EarningCard) ─────────────────────────
function StatCard({ icon, label, value, accent, bg, border, badge }) {
  return (
    <div
      style={{
        background: bg || 'white', borderRadius: 20,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '1.5rem',
        border: `1px solid ${border || '#e2e8f0'}`,
        display: 'flex', flexDirection: 'column', gap: '0.6rem',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.10)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: accent + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {React.cloneElement(icon, { size: 20, color: accent })}
        </div>
        {badge && (
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, color: accent,
            background: accent + '15', padding: '0.2rem 0.6rem',
            borderRadius: 999, border: `1px solid ${accent}25`,
          }}>{badge}</span>
        )}
      </div>
      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </p>
    </div>
  );
}

// ─── Build chart data from job list ─────────────────────────────────────────
function buildChartData(view, jobs) {
  if (view === 'Weekly') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = Object.fromEntries(days.map(d => [d, 0]));
    jobs.forEach(j => {
      const dayName = new Date(j.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      if (counts[dayName] !== undefined) counts[dayName]++;
    });
    return days.map(d => ({ label: d, jobs: counts[d] }));
  }
  if (view === 'Monthly') {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const counts = Object.fromEntries(months.map(m => [m, 0]));
    jobs.forEach(j => {
      const m = new Date(j.createdAt).toLocaleDateString('en-US', { month: 'short' });
      if (counts[m] !== undefined) counts[m]++;
    });
    return months.slice(0, new Date().getMonth() + 1).map(m => ({ label: m, jobs: counts[m] }));
  }
  // Daily — last 7 days
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const count = jobs.filter(j => new Date(j.createdAt).toDateString() === d.toDateString()).length;
    result.push({ label: key, jobs: count });
  }
  return result;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProviderStatsSection({ token }) {
  const [view, setView]   = useState('Weekly');
  const [jobs, setJobs]   = useState([]);
  const [stats, setStats] = useState({
    total: 0, active: 0, completed: 0, avgRating: null,
  });

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetch('/api/jobs/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const list = json.jobs || [];
          setJobs(list);
          setStats({
            total:     list.length,
            active:    list.filter(j => j.isOpen && j.status !== 'completed').length,
            completed: list.filter(j => j.status === 'completed').length,
            avgRating: null, // pulled from user object in parent
          });
        }
      } catch {
        // network error — keep zeros
      }
    };
    load();
  }, [token]);

  // Also fetch analytics for avg rating
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const ratings = json.user?.ratings;
          if (ratings?.count > 0) {
            setStats(prev => ({ ...prev, avgRating: ratings.average?.toFixed(1) }));
          }
        }
      } catch { /* silent */ }
    };
    load();
  }, [token]);

  const chartData  = buildChartData(view, jobs);
  const hasAnyJobs = jobs.length > 0;

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* ── Section Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: '#f0fdf4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TrendingUp size={18} color="#2e7d32" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Jobs Overview
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Your activity at a glance
          </p>
        </div>
      </div>

      {/* ── Stat cards (same layout as EarningsSection) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: stats.avgRating != null
          ? 'repeat(auto-fit, minmax(175px, 1fr))'
          : 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '1rem', marginBottom: '1.5rem',
      }}>
        <StatCard
          icon={<Briefcase />} label="Total Posted"
          value={stats.total} accent="#2e7d32" bg="#f0fdf4" border="#bbf7d0" badge="All Time"
        />
        <StatCard
          icon={<Activity />} label="Active Jobs"
          value={stats.active} accent="#0891b2" bg="#ecfeff" border="#a5f3fc" badge="Live"
        />
        <StatCard
          icon={<CheckCircle />} label="Completed"
          value={stats.completed} accent="#7c3aed" bg="#f5f3ff" border="#ddd6fe" badge="Done"
        />
        {stats.avgRating != null && (
          <StatCard
            icon={<Star />} label="Avg Rating"
            value={`⭐ ${stats.avgRating}`} accent="#d97706" bg="#fffbeb" border="#fde68a" badge="Score"
          />
        )}
      </div>

      {/* ── Bar chart ── */}
      <div style={{
        background: 'white', borderRadius: 20,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0', padding: '1.5rem',
      }}>
        {/* Header + toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div>
            <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', margin: 0 }}>
              Jobs Posted Over Time
            </p>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              {view} breakdown
            </p>
          </div>
          {/* Toggle pills — identical style to EarningsSection */}
          <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', borderRadius: 12, padding: '0.25rem' }}>
            {['Daily', 'Weekly', 'Monthly'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '0.35rem 0.9rem', borderRadius: 9, fontSize: '0.8rem',
                  fontWeight: 700, border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: view === v ? '#2e7d32' : 'transparent',
                  color: view === v ? 'white' : '#64748b',
                  boxShadow: view === v ? '0 2px 8px rgba(46,125,50,0.3)' : 'none',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
              allowDecimals={false} width={28}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdf4' }} />
            <Bar dataKey="jobs" fill="#2e7d32" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Empty state */}
        {!hasAnyJobs && (
          <p style={{ textAlign: 'center', color: '#cbd5e1', fontSize: '0.82rem', marginTop: '0.5rem', fontWeight: 500 }}>
            Post your first job to start tracking activity 🚀
          </p>
        )}
      </div>
    </div>
  );
}
