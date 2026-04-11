import React from 'react';
import { Briefcase, Users, ArrowRight } from 'lucide-react';

const LandingPage = ({ onSelectProvider, onSelectSeeker }) => {
  return (
    <main className="hero fade-in" style={{ padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--white)' }}>The Future of Gigs.</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--gray)', maxWidth: '600px', textAlign: 'center', marginBottom: '3rem' }}>
        Connect with reliable jobs and workers in seconds. GigRide is your on-demand solution for short-duration work.
      </p>
      
      <div className="split-layout" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '1000px' }}>
        
        {/* Provider Card */}
        <div 
          className="role-card bounce-in" 
          onClick={onSelectProvider}
          style={{
            flex: '1 1 400px',
            background: 'white',
            borderRadius: '1rem',
            padding: '3rem 2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            border: '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ background: '#fef3c7', padding: '1.5rem', borderRadius: '50%', color: 'var(--black)', marginBottom: '1.5rem', transition: 'transform 0.3s ease' }} className="icon-wrapper">
            <Briefcase size={48} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--black)', marginBottom: '1rem' }}>Login as Job Provider (Client)</h2>
          <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>Clients post jobs instantly. Review applicants and securely assign reliable workers.</p>
          <div className="btn-text" style={{ color: 'var(--yellow)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Get Started <ArrowRight size={18} />
          </div>
        </div>

        {/* Seeker Card */}
        <div 
          className="role-card bounce-in" 
          onClick={onSelectSeeker}
          style={{
            flex: '1 1 400px',
            background: 'white',
            borderRadius: '1rem',
            padding: '3rem 2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            border: '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ background: '#fef3c7', padding: '1.5rem', borderRadius: '50%', color: 'var(--yellow-hover)', marginBottom: '1.5rem', transition: 'transform 0.3s ease' }} className="icon-wrapper">
            <Users size={48} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--black)', marginBottom: '1rem' }}>Login as Job Seeker (Partner)</h2>
          <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>Partners find gigs instantly. Browse open opportunities and get assigned to urgent jobs.</p>
          <div className="btn-text" style={{ color: 'var(--yellow)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Find Gigs <ArrowRight size={18} />
          </div>
        </div>

      </div>
    </main>
  );
};

export default LandingPage;
