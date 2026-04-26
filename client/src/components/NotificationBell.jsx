import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';

const getToken = () => localStorage.getItem('token') || localStorage.getItem('gigride_token') || '';

// ─── Time ago formatter ───────────────────────────────────────────────────────
function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Type → icon/color map ────────────────────────────────────────────────────
const TYPE_META = {
  apply:   { emoji: '📩', color: '#2563eb', bg: '#eff6ff' },
  accept:  { emoji: '✅', color: '#16a34a', bg: '#f0fdf4' },
  reject:  { emoji: '❌', color: '#dc2626', bg: '#fef2f2' },
  payment: { emoji: '💳', color: '#7c3aed', bg: '#f5f3ff' },
  review:  { emoji: '⭐', color: '#d97706', bg: '#fffbeb' },
  badge:   { emoji: '🏆', color: '#0891b2', bg: '#ecfeff' },
};

export default function NotificationBell({ accent = '#0277bd' }) {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(false);
  const ref                               = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 s for a "real-time feel" without WebSockets
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Mark single as read ────────────────────────────────────────────────────
  const markRead = async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch { /* silent */ }
  };

  // ── Mark all as read ───────────────────────────────────────────────────────
  const markAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch { /* silent */ }
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* ── Bell button ── */}
      <button
        id="notification-bell-btn"
        onClick={() => { setOpen(v => !v); if (!open) fetchNotifications(); }}
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: '0.4rem',
          borderRadius: 10, transition: 'background 0.15s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        title="Notifications"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell size={20} color={unreadCount > 0 ? accent : '#64748b'} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            minWidth: 18, height: 18, borderRadius: 999,
            background: '#ef4444', color: 'white',
            fontSize: '0.65rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', border: '2px solid white',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: 340, maxHeight: 440,
              background: 'white', borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.14)',
              border: '1px solid #e2e8f0',
              zIndex: 50, overflow: 'hidden',
              animation: 'dropIn 0.15s ease',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <style>{`
              @keyframes dropIn {
                from { opacity:0; transform:translateY(-6px) scale(0.98); }
                to   { opacity:1; transform:translateY(0) scale(1); }
              }
            `}</style>

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1rem', borderBottom: '1px solid #f1f5f9',
            }}>
              <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', margin: 0 }}>
                Notifications {unreadCount > 0 && (
                  <span style={{
                    marginLeft: 6, padding: '0.1rem 0.5rem',
                    background: accent + '15', color: accent,
                    borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                  }}>{unreadCount} new</span>
                )}
              </p>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAll}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: accent, fontSize: '0.78rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 3,
                    }}
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} /> All read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Loading…
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
                    No notifications yet
                  </p>
                </div>
              ) : notifications.map(n => {
                const meta = TYPE_META[n.type] || TYPE_META.apply;
                return (
                  <button
                    key={n._id}
                    onClick={() => markRead(n._id)}
                    style={{
                      width: '100%', textAlign: 'left', border: 'none',
                      cursor: 'pointer', padding: '0.85rem 1rem',
                      background: n.isRead ? 'white' : meta.bg,
                      borderBottom: '1px solid #f8fafc',
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={e => { if (n.isRead) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (n.isRead) e.currentTarget.style.background = 'white'; else e.currentTarget.style.background = meta.bg; }}
                  >
                    <span style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: meta.bg, border: `1px solid ${meta.color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem',
                    }}>
                      {meta.emoji}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0, fontSize: '0.84rem',
                        color: n.isRead ? '#475569' : '#0f172a',
                        fontWeight: n.isRead ? 500 : 700,
                        lineHeight: 1.4,
                      }}>
                        {n.message}
                      </p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: meta.color, flexShrink: 0, marginTop: 4,
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
