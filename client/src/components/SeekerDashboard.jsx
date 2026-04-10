import React from 'react';
import { Search, Briefcase, Clock, Star, Send } from 'lucide-react';

const SeekerDashboard = ({ user }) => {
  return (
    <div className="view-container" style={{ maxWidth: '1000px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem' }}>Hello, {user.name}</h2>
        <p style={{ color: 'var(--gray)' }}>Find and apply for your next gig</p>
      </header>

      <div className="form-group" style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
          <input 
            type="text" 
            placeholder="Search for jobs (e.g. Designer, Developer)" 
            style={{ paddingLeft: '3rem' }}
          />
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#f5f3ff', p: '0.75rem', borderRadius: '50%', color: '#6d28d9' }}>
            <Send size={24} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.5rem' }}>5</p>
            <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Applications Sent</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#fff7ed', p: '0.75rem', borderRadius: '50%', color: '#c2410c' }}>
            <Star size={24} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.5rem' }}>2</p>
            <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Interviews Pending</p>
          </div>
        </div>
      </div>

      <div className="requests-list" style={{ marginTop: '2.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Recommended for You</h3>
        
        <div className="request-item card" style={{ marginBottom: '1rem' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Frontend Developer (React)</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>TechCorp Inc. • $45-$60/hr • Remote</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={14} /> Part-time
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={14} /> 4.8 Rating
              </span>
            </div>
          </div>
          <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>Apply Now</button>
        </div>

        <div className="request-item card">
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Product Designer (Figma)</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>Creative Lab • $50/hr • Remote</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={14} /> Project-based
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={14} /> 4.9 Rating
              </span>
            </div>
          </div>
          <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>Apply Now</button>
        </div>
      </div>
    </div>
  );
};

export default SeekerDashboard;
