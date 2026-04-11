import React, { useState, useEffect } from 'react';
import { Search, Briefcase, Clock, Star, Send, MapPin, Zap } from 'lucide-react';

const CATEGORIES = ["All Categories", "Electrician", "Plumber", "Carpenter", "Tutor", "Delivery helper", "Other skilled trades", "Other"];

const SeekerDashboard = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('All Categories');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('gigride_token');
      
      let query = '/api/jobs?';
      if (filterType !== 'all') query += `type=${filterType}&`;
      if (filterCategory !== 'All Categories') query += `category=${filterCategory}&`;

      const res = await fetch(query, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filterType, filterCategory]);

  const handleApply = async (jobId, type) => {
    const isInstant = type === 'instant';
    if (isInstant && !window.confirm("Are you sure you want to instantly accept and claim this gig?")) return;

    try {
      const token = localStorage.getItem('gigride_token');
      const res = await fetch(`http://127.0.0.1:5000/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message);
        fetchJobs(); // Refresh feed
      } else {
        alert(data.message || 'Failed to apply');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="view-container" style={{ maxWidth: '1000px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem' }}>Hello, {user.name}</h2>
        <p style={{ color: 'var(--gray)' }}>Find and claim your next gig instantly</p>
      </header>

      {/* Filters */}
      <div className="form-group" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <select 
          style={{ flex: 1, minWidth: '200px' }} 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        <select 
          style={{ flex: 1, minWidth: '200px' }} 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Gig Types</option>
          <option value="instant">Instant Action ⚡</option>
          <option value="part-time">Part-Time Jobs</option>
        </select>
        <button className="btn btn-secondary" onClick={fetchJobs}>Refresh</button>
      </div>

      <div className="requests-list" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Available Opportunities</h3>
        
        {loading ? <p>Loading gigs...</p> : jobs.length === 0 ? <p>No open gigs found for these filters.</p> : null}

        {jobs.map(job => (
          <div key={job._id} className="request-item card" style={{ marginBottom: '1rem', borderLeft: job.type === 'instant' ? '4px solid #ef4444' : 'none' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{job.title}</p>
                {job.type === 'instant' && <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>URGENT</span>}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                {job.provider?.name || 'Unknown'} • {job.category}
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={14} /> {job.location}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Briefcase size={14} /> ${job.pay.amount} per {job.pay.per}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={14} /> {job.type}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', marginTop: '0.75rem' }}>{job.description}</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <button 
                className="btn btn-primary" 
                style={{ padding: '0.6rem 1.2rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => handleApply(job._id, job.type)}
              >
                {job.type === 'instant' ? <><Zap size={16} /> Accept Instantly</> : 'Apply Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeekerDashboard;
