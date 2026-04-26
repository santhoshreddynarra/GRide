import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, IndianRupee, Calendar, Zap } from 'lucide-react';

// ─── Chart data (illustrative trend shape) ───────────────────────────────────
const DAILY_DATA = [
  { label: 'Mon', amount: 0 },
  { label: 'Tue', amount: 0 },
  { label: 'Wed', amount: 0 },
  { label: 'Thu', amount: 0 },
  { label: 'Fri', amount: 0 },
  { label: 'Sat', amount: 0 },
  { label: 'Sun', amount: 0 },
];
const WEEKLY_DATA = [
  { label: 'Wk 1', amount: 0 },
  { label: 'Wk 2', amount: 0 },
  { label: 'Wk 3', amount: 0 },
  { label: 'Wk 4', amount: 0 },
];
const MONTHLY_DATA = [
  { label: 'Jan', amount: 0 },
  { label: 'Feb', amount: 0 },
  { label: 'Mar', amount: 0 },
  { label: 'Apr', amount: 0 },
  { label: 'May', amount: 0 },
  { label: 'Jun', amount: 0 },
];

const VIEWS = { Daily: DAILY_DATA, Weekly: WEEKLY_DATA, Monthly: MONTHLY_DATA };

// ─── Custom tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white', border: '1px solid #e2e8f0', borderRadius: 12,
      padding: '0.6rem 1rem', boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
    }}>
      <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: '1rem', fontWeight: 800, color: '#2563eb' }}>
        ₹{(payload[0].value || 0).toLocaleString('en-IN')}
      </p>
    </div>
  );
}

// ─── Earnings card ───────────────────────────────────────────────────────────
function EarningCard({ icon, label, amount, accent, bg, border, badge }) {
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
        ₹{(amount || 0).toLocaleString('en-IN')}
      </p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function EarningsSection({ token }) {
  const [view, setView]         = useState('Weekly');
  const [earnings, setEarnings] = useState({ total: 0, thisWeek: 0, today: 0 });
  const [chartData, setChartData] = useState(VIEWS['Weekly']);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setEarnings({
            total:    json.financialTotal    ?? 0,
            thisWeek: json.thisWeekEarnings  ?? 0,
            today:    json.todayEarnings     ?? 0,
          });
        }
      } catch {
        // network error — keep ₹0 defaults
      }
    };
    load();
  }, [token]);

  // Update chart when view toggles
  useEffect(() => {
    setChartData(VIEWS[view]);
  }, [view]);

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* ── Section Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: '#eff6ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TrendingUp size={18} color="#2563eb" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Earnings Overview
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Your income at a glance
          </p>
        </div>
      </div>

      {/* ── 3 stat cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '1rem', marginBottom: '1.5rem',
      }}>
        <EarningCard
          icon={<IndianRupee />} label="Total Earnings"
          amount={earnings.total}  accent="#2563eb" bg="#eff6ff" border="#bfdbfe" badge="All Time"
        />
        <EarningCard
          icon={<Calendar />} label="This Week"
          amount={earnings.thisWeek} accent="#7c3aed" bg="#f5f3ff" border="#ddd6fe" badge="This Week"
        />
        <EarningCard
          icon={<Zap />} label="Today"
          amount={earnings.today}  accent="#0891b2" bg="#ecfeff" border="#a5f3fc" badge="Today"
        />
      </div>

      {/* ── Graph card ── */}
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
              Earnings Trend
            </p>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              {view} breakdown
            </p>
          </div>
          {/* Toggle pills */}
          <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', borderRadius: 12, padding: '0.25rem' }}>
            {Object.keys(VIEWS).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '0.35rem 0.9rem', borderRadius: 9, fontSize: '0.8rem',
                  fontWeight: 700, border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: view === v ? '#2563eb' : 'transparent',
                  color: view === v ? 'white' : '#64748b',
                  boxShadow: view === v ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="amount"
              stroke="#2563eb" strokeWidth={2.5}
              fill="url(#earningsGrad)"
              dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: 'white' }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Empty state hint */}
        {earnings.total === 0 && (
          <p style={{ textAlign: 'center', color: '#cbd5e1', fontSize: '0.82rem', marginTop: '0.5rem', fontWeight: 500 }}>
            Complete jobs to start tracking your earnings 🚀
          </p>
        )}
      </div>
    </div>
  );
}
