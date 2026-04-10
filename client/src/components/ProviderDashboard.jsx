import React from 'react';
import { PlusCircle, Users, CheckCircle, BarChart, Settings } from 'lucide-react';

const ProviderDashboard = ({ user }) => {
  return (
    <div className="view-container" style={{ maxWidth: '1000px' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem' }}>Welcome, {user.name}</h2>
          <p style={{ color: 'var(--gray)' }}>Manage your posted jobs and applicants</p>
        </div>
        <button className="btn btn-primary">
          <PlusCircle size={20} /> Post a New Job
        </button>
      </header>

      <div className="dashboard-grid">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#e0f2fe', p: '0.75rem', borderRadius: '50%', color: '#0369a1' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.5rem' }}>12</p>
            <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Active Applicants</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#f0fdf4', p: '0.75rem', borderRadius: '50%', color: '#15803d' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.5rem' }}>4</p>
            <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Jobs Completed</p>
          </div>
        </div>
      </div>

      <div className="requests-list" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Recent Job Postings</h3>
          <span style={{ color: 'var(--teal)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>View All</span>
        </div>

        <div className="request-item card" style={{ marginBottom: '1rem' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Experienced React Developer</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>Posted 2 days ago • 5 applicants</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', background: '#dcfce7', color: '#166534', fontSize: '0.8rem', fontWeight: 600 }}>Active</span>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Manage</button>
          </div>
        </div>

        <div className="request-item card">
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>UI/UX Designer for Landing Page</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>Posted 5 days ago • 8 applicants</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', background: '#fef3c7', color: '#92400e', fontSize: '0.8rem', fontWeight: 600 }}>Reviewing</span>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Manage</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
