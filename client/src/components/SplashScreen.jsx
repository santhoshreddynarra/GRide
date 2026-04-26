import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── SplashScreen ────────────────────────────────────────────────────────────
   4-phase animated splash:
     Phase 0 (0-0.9s)  : Logo fades + scales in
     Phase 1 (0.9-2.2s): Tagline slides up
     Phase 2 (2.2-3.5s): Seeker → Job → Provider flow animates in
     Phase 3 (3.5-4.8s): Progress bar + loading text
     After  ~4.8s       : redirect based on stored role
──────────────────────────────────────────────────────────────────────────────*/

const PHASE_TIMES = [900, 1300, 1300, 1300]; // ms each phase lasts

const SplashScreen = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);   // 0-3
  const [done,  setDone]  = useState(false);

  // Advance through phases
  useEffect(() => {
    let elapsed = 0;
    const timers = PHASE_TIMES.map((duration, idx) => {
      elapsed += duration;
      return setTimeout(() => setPhase(idx + 1), elapsed);
    });
    const exitTimer = setTimeout(() => setDone(true), elapsed + 400);
    return () => { [...timers, exitTimer].forEach(clearTimeout); };
  }, []);

  // Redirect once done
  useEffect(() => {
    if (!done) return;
    const token = localStorage.getItem('token') || localStorage.getItem('gigride_token');
    const role  = localStorage.getItem('role')  || localStorage.getItem('gigride_role');
    if (!token) { navigate('/login'); return; }
    navigate(role === 'provider' ? '/provider/dashboard' : '/seeker/dashboard');
  }, [done, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f2a1a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <style>{`
        @keyframes splashFadeScaleIn {
          from { opacity: 0; transform: scale(0.72); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes splashSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashNodeBounce {
          0%,100% { transform: translateY(0) scale(1); }
          50%     { transform: translateY(-8px) scale(1.08); }
        }
        @keyframes splashArrowDraw {
          from { opacity: 0; transform: scaleX(0); transform-origin: left; }
          to   { opacity: 1; transform: scaleX(1); transform-origin: left; }
        }
        @keyframes splashBarFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes splashGlowPulse {
          0%,100% { opacity: 0.15; transform: scale(1); }
          50%     { opacity: 0.3;  transform: scale(1.1); }
        }
        @keyframes splashDotBlink {
          0%,80%,100% { opacity: 0; }
          40%         { opacity: 1; }
        }
        .splash-fade-scale { animation: splashFadeScaleIn 0.75s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .splash-slide-up   { animation: splashSlideUp 0.6s ease forwards; }
        .splash-node       { animation: splashNodeBounce 1.8s ease-in-out infinite; }
        .splash-arrow      { animation: splashArrowDraw 0.5s ease forwards; }
        .splash-bar        { animation: splashBarFill 1.1s ease forwards; }
        .splash-dot-1      { animation: splashDotBlink 1.4s 0.0s infinite; }
        .splash-dot-2      { animation: splashDotBlink 1.4s 0.2s infinite; }
        .splash-dot-3      { animation: splashDotBlink 1.4s 0.4s infinite; }
      `}</style>

      {/* ── Decorative background blobs ── */}
      <div style={{
        position:'absolute', top:'-15%', left:'-10%',
        width:480, height:480, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)',
        animation:'splashGlowPulse 4s ease-in-out infinite',
        pointerEvents:'none',
      }} />
      <div style={{
        position:'absolute', bottom:'-10%', right:'-8%',
        width:400, height:400, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
        animation:'splashGlowPulse 4s 2s ease-in-out infinite',
        pointerEvents:'none',
      }} />

      {/* ╔══════════════════════════════╗
          ║   PHASE 0 — Logo             ║
          ╚══════════════════════════════╝ */}
      <div className="splash-fade-scale" style={{ textAlign:'center', marginBottom:0 }}>
        {/* Icon */}
        <div style={{
          width:88, height:88, borderRadius:24,
          background:'linear-gradient(135deg, #2563eb, #16a34a)',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 20px',
          boxShadow:'0 16px 48px rgba(37,99,235,0.35)',
        }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
               stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            <line x1="12" y1="12" x2="12" y2="16"/>
            <line x1="10" y1="14" x2="14" y2="14"/>
          </svg>
        </div>

        {/* Brand name */}
        <h1 style={{ fontSize:48, fontWeight:900, letterSpacing:-1.5, margin:0, lineHeight:1 }}>
          <span style={{ color:'#ffffff' }}>Gig</span>
          <span style={{
            background:'linear-gradient(90deg, #3b82f6, #22c55e)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>Ride</span>
        </h1>
      </div>

      {/* ╔══════════════════════════════╗
          ║   PHASE 1 — Tagline          ║
          ╚══════════════════════════════╝ */}
      {phase >= 1 && (
        <div className="splash-slide-up" style={{ textAlign:'center', marginTop:20 }}>
          <p style={{
            fontSize:20, fontWeight:600, letterSpacing:0.4,
            color:'rgba(255,255,255,0.85)', margin:0,
          }}>
            Find Gigs.&nbsp;
            <span style={{ color:'#60a5fa' }}>Hire Talent.</span>&nbsp;
            <span style={{ color:'#4ade80' }}>Get Paid.</span>
          </p>
        </div>
      )}

      {/* ╔══════════════════════════════╗
          ║   PHASE 2 — Flow diagram     ║
          ╚══════════════════════════════╝ */}
      {phase >= 2 && (
        <div
          className="splash-slide-up"
          style={{
            display:'flex', alignItems:'center', justifyContent:'center',
            gap:16, marginTop:52,
          }}
        >
          <FlowNode
            icon="👤" label="Seeker" color="#3b82f6"
            delay="0s" phase={phase}
          />
          <FlowArrow delay="0.25s" />
          <FlowNode
            icon="💼" label="Job" color="#8b5cf6"
            delay="0.4s" phase={phase}
          />
          <FlowArrow delay="0.65s" />
          <FlowNode
            icon="🏢" label="Provider" color="#22c55e"
            delay="0.8s" phase={phase}
          />
        </div>
      )}

      {/* ╔══════════════════════════════╗
          ║   PHASE 3 — Progress bar     ║
          ╚══════════════════════════════╝ */}
      {phase >= 3 && (
        <div
          className="splash-slide-up"
          style={{ width:'min(320px, 84vw)', marginTop:52, textAlign:'center' }}
        >
          {/* Bar track */}
          <div style={{
            height:5, borderRadius:99,
            background:'rgba(255,255,255,0.12)',
            overflow:'hidden', marginBottom:18,
          }}>
            <div
              className="splash-bar"
              style={{
                height:'100%', borderRadius:99,
                background:'linear-gradient(90deg, #3b82f6, #22c55e)',
              }}
            />
          </div>

          {/* Loading text */}
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:14, fontWeight:500 }}>
            Loading your opportunities
            <span className="splash-dot-1">.</span>
            <span className="splash-dot-2">.</span>
            <span className="splash-dot-3">.</span>
          </p>
        </div>
      )}
    </div>
  );
};

/* ─── Sub-components ──────────────────────────────────────────────────────── */

const FlowNode = ({ icon, label, color, delay }) => (
  <div
    className="splash-node"
    style={{ animationDelay: delay, textAlign:'center' }}
  >
    <div style={{
      width:68, height:68, borderRadius:20,
      background:`linear-gradient(135deg, ${color}33, ${color}11)`,
      border:`2px solid ${color}55`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:26, marginBottom:8,
      boxShadow:`0 8px 24px ${color}30`,
    }}>
      {icon}
    </div>
    <span style={{
      fontSize:12, fontWeight:700, letterSpacing:0.5,
      color:'rgba(255,255,255,0.75)', textTransform:'uppercase',
    }}>
      {label}
    </span>
  </div>
);

const FlowArrow = ({ delay }) => (
  <div
    className="splash-arrow"
    style={{ animationDelay: delay, display:'flex', alignItems:'center', gap:4 }}
  >
    <div style={{ width:36, height:2, background:'rgba(255,255,255,0.25)', borderRadius:1 }} />
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M1 5H9M9 5L5 1M9 5L5 9" stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

export default SplashScreen;
