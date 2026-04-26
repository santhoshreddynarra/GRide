import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

// ─── component ────────────────────────────────────────────────────────────────
/**
 * AvatarDropdown
 * Props:
 *   user    — { name, email, phone?, role }
 *   role    — "seeker" | "provider"
 *   onClose — called when dropdown should close
 */
const AvatarDropdown = ({ user, role, onClose }) => {
  const navigate = useNavigate();
  const ref = useRef(null);

  const isProvider  = role === 'provider';
  const accent      = isProvider ? '#2e7d32' : '#0277bd';
  const accentLight = isProvider ? '#e8f5e9' : '#e0f7fa';
  const roleName    = isProvider ? 'Job Provider' : 'Job Seeker';

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleLogout = () => {
    ['token', 'user', 'role', 'gigride_token', 'gigride_user', 'gigride_role']
      .forEach((k) => localStorage.removeItem(k));
    onClose();
    navigate('/login');
  };

  const go = (path) => { onClose(); navigate(path); };

  return (
    <>
      {/* Transparent backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />

      {/* Dropdown card */}
      <div
        ref={ref}
        className="absolute right-0 top-full mt-2 w-68 z-50
                   bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{
          width: 268,
          boxShadow: '0 20px 60px rgba(0,0,0,0.13)',
          animation: 'dropIn 0.15s ease',
        }}
      >
        <style>{`
          @keyframes dropIn {
            from { opacity: 0; transform: translateY(-6px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* ── Header ── */}
        <div
          className="p-4 flex items-center gap-3"
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, ${isProvider ? '#1b5e20' : '#01579b'} 100%)`,
          }}
        >
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center
                       text-lg font-black flex-shrink-0 border-2 border-white/30"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
          >
            {getInitials(user?.name)}
          </div>

          {/* Name + role */}
          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-white/70 text-xs truncate mt-0.5">
              {user?.email || '—'}
            </p>
            <span
              className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              <Shield size={9} />
              {roleName}
            </span>
          </div>
        </div>

        {/* ── Contact details ── */}
        {(user?.email || user?.phone) && (
          <div className="px-4 py-2.5 border-b border-gray-100 space-y-1.5">
            {user?.email && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail size={13} className="text-gray-400 flex-shrink-0" />
                <span className="truncate text-xs">{user.email}</span>
              </div>
            )}
            {user?.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone size={13} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs">{user.phone}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation links ── */}
        <div className="py-1.5">
          <DropdownLink
            icon={<UserIcon size={15} />}
            label="My Profile"
            onClick={() => go('/profile')}
            accent={accent}
            accentLight={accentLight}
          />
        </div>

        {/* ── Sign out ── */}
        <div className="border-t border-gray-100 py-1.5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold
                       text-red-600 hover:bg-red-50 transition-colors duration-150 group"
          >
            <LogOut size={15} className="flex-shrink-0" />
            <span className="flex-1 text-left">Sign Out</span>
            <ChevronRight
              size={13}
              className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Sub-component ────────────────────────────────────────────────────────────
const DropdownLink = ({ icon, label, onClick, accent, accentLight }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold
               text-gray-700 hover:text-gray-900 transition-colors duration-150 group"
    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accentLight; }}
    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
  >
    <span style={{ color: accent }}>{icon}</span>
    <span className="flex-1 text-left">{label}</span>
    <ChevronRight
      size={13}
      className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
    />
  </button>
);

export default AvatarDropdown;
