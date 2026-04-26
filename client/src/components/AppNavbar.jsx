import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Menu, X } from 'lucide-react';
import AvatarDropdown from './AvatarDropdown';
import NotificationBell from './NotificationBell';

// ─── helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

// ─── component ────────────────────────────────────────────────────────────────
/**
 * AppNavbar — minimal startup-style top bar
 * Props: role ("seeker"|"provider"), user (object)
 */
const AppNavbar = ({ role, user }) => {
  const navigate  = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  const isProvider  = role === 'provider';
  const accent      = isProvider ? '#2e7d32' : '#0277bd';
  const dashboard   = isProvider ? '/provider/dashboard' : '/seeker/dashboard';

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  return (
    <nav
      className="sticky top-0 z-40 bg-white border-b border-gray-200"
      style={{ fontFamily: "'Inter', sans-serif", boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── LEFT: Logo ── */}
          <button
            onClick={() => navigate(dashboard)}
            className="flex items-center gap-2.5 flex-shrink-0 focus:outline-none rounded-lg"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: accent }}
            >
              <Briefcase size={16} color="white" />
            </div>
            <span className="font-black text-xl text-gray-900 tracking-tight">
              Gig<span style={{ color: accent }}>Ride</span>
            </span>
          </button>

          {/* ── RIGHT: Greeting + Avatar + Hamburger ── */}
          <div className="flex items-center gap-3">

            {/* Greeting (sm+) */}
            <span className="hidden sm:block text-sm font-semibold text-gray-500 truncate max-w-[140px]">
              Hey, {user?.name?.split(' ')[0] || 'there'} 👋
            </span>

            {/* Notification bell */}
            <NotificationBell accent={accent} />

            {/* Avatar button */}
            <div className="relative">
              <button
                id="navbar-avatar-btn"
                onClick={() => setDropdownOpen((v) => !v)}
                className="w-9 h-9 rounded-full flex items-center justify-center
                           text-sm font-black text-white transition-transform
                           hover:scale-110 active:scale-95 focus:outline-none"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${isProvider ? '#1b5e20' : '#01579b'})`,
                  boxShadow: `0 2px 8px ${accent}55`,
                }}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                title="Account menu"
              >
                {getInitials(user?.name)}
              </button>

              {dropdownOpen && (
                <AvatarDropdown
                  user={user}
                  role={role}
                  onClose={closeDropdown}
                />
              )}
            </div>

            {/* Hamburger (mobile) */}
            <button
              className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-gray-100 bg-white"
          style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
        >
          <div className="px-4 py-3 space-y-1">
            <button
              onClick={() => { navigate(dashboard); setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => { navigate('/profile'); setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left text-gray-700 hover:bg-gray-50 transition-colors"
            >
              My Profile
            </button>
            <button
              onClick={() => {
                ['token','user','role','gigride_token','gigride_user','gigride_role']
                  .forEach((k) => localStorage.removeItem(k));
                navigate('/login');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors mt-1"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AppNavbar;
