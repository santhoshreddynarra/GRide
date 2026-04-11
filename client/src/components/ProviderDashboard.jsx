import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, MapPin, Clock, DollarSign, Send, Users, TrendingUp, Filter, AlertCircle } from 'lucide-react';

const CATEGORIES = ["Electrician", "Plumber", "Carpenter", "Tutor", "Delivery helper", "Other skilled trades", "Other"];

const ProviderDashboard = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    urgency: 'part-time', // formerly 'type'
    location: '',
    payAmount: '',
    payRate: 'hour'
  });

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('gigride_token');
      const res = await fetch('/api/jobs/my', {
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
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('gigride_token');
      
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert("Job posted successfully! 🚀");
        setShowForm(false);
        setFormData({ title: '', description: '', category: CATEGORIES[0], urgency: 'part-time', location: '', payAmount: '', payRate: 'hour' });
        fetchJobs();
      } else {
        const data = await res.json();
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleCompleteJob = async (jobId) => {
    if (!window.confirm("Mark this gig as filled/completed?")) return;
    try {
      const token = localStorage.getItem('gigride_token');
      const res = await fetch(`/api/jobs/${jobId}/complete`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Gig status updated! You can now rate your partner.");
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '2rem 1rem', background: 'linear-gradient(135deg, #FFD700 0%, #000000 100%)', minHeight: '100vh' }}>
      <div className="view-container fade-in" style={{ maxWidth: '1100px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.95)', padding: '3rem', borderRadius: '2rem', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', color: '#000000', fontWeight: 900, marginBottom: '0.5rem' }}>👋 Welcome back, {user.name}</h2>
            <p style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 500 }}>Ready to post your next gig?</p>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ padding: '1rem 2rem', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 15px -3px rgba(255, 215, 0, 0.3)' }}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <Briefcase size={20} /> : <Plus size={20} />} 
            {showForm ? 'View My Gigs' : 'Post New Gig'}
          </button>
        </div>

        {/* Analytics Snapshot */}
        {!showForm && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
             {[
               { label: 'Total Posts', value: jobs.length, icon: <Briefcase /> },
               { label: 'Applicants', value: jobs.reduce((acc, j) => acc + (j.applicants?.length || 0), 0), icon: <Users /> },
               { label: 'Avg Rating', value: user.ratings?.average || '0.0', icon: <TrendingUp /> }
             ].map((stat, i) => (
               <div key={i} className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '1rem', color: '#b45309' }}>{stat.icon}</div>
                 <div>
                   <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>{stat.label}</p>
                   <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stat.value}</h3>
                 </div>
               </div>
             ))}
          </div>
        )}

        {/* Job Posting Form */}
        {showForm ? (
          <div className="card fade-in" style={{ padding: '3rem', borderRadius: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Plus size={24} style={{ color: '#FFD700' }} /> Create New Dispatch
            </h3>
            <form onSubmit={handlePostJob} style={{ display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: '#334155' }}>Job Title</label>
                  <input 
                    placeholder="e.g. Electrician for Home Wiring" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: '#334155' }}>Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: '#334155' }}>Detailed Description</label>
                <textarea 
                  placeholder="What needs to be done?" 
                  style={{ minHeight: '120px' }}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: '#334155' }}>Location</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input 
                      style={{ paddingLeft: '3rem' }} 
                      placeholder="Street, City" 
                      value={formData.location} 
                      onChange={e => setFormData({...formData, location: e.target.value})} 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: '#334155' }}>Urgency Level</label>
                  <select value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}>
                    <option value="instant">Instant ⚡ (Emergency)</option>
                    <option value="part-time">Standard (Scheduled)</option>
                    <option value="full-time">Contract (Ongoing)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: '#334155' }}>Pay Rate</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="number" 
                      placeholder="Amt" 
                      style={{ flex: 1 }}
                      value={formData.payAmount} 
                      onChange={e => setFormData({...formData, payAmount: e.target.value})} 
                      required 
                    />
                    <select style={{ flex: 1.2 }} value={formData.payRate} onChange={e => setFormData({...formData, payRate: e.target.value})}>
                      <option value="hour">/ Hour</option>
                      <option value="day">/ Day</option>
                      <option value="project">/ Project</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary btn-full" style={{ fontSize: '1.1rem', fontWeight: 800 }}>Publish Dispatch</button>
                <button type="button" className="btn btn-secondary" style={{ padding: '1rem 2.5rem' }} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          /* My Jobs List */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Active Dispatches</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '1rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 700 }}>Open: {jobs.filter(j => j.status === 'open').length}</div>
                <div style={{ background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '1rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 700 }}>Filled: {jobs.filter(j => j.status === 'filled').length}</div>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}>Loading dispatches...</div>
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem', background: '#f8fafc', borderRadius: '1.5rem', border: '2px dashed #e2e8f0' }}>
                <AlertCircle size={48} style={{ color: '#cbd5e1', marginBottom: '1.5rem' }} />
                <p style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 500 }}>No jobs posted yet. Start by clicking "Post New Gig".</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {jobs.map(job => (
                  <div key={job._id} className="card" style={{ padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ background: '#000000', color: '#FFD700', padding: '1rem', borderRadius: '1.25rem' }}>
                        <Briefcase size={24} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.25rem' }}>{job.title}</h4>
                        <p style={{ color: '#64748b', fontWeight: 600 }}>{job.category} • {job.location}</p>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#b45309', background: '#fffbeb', padding: '0.25rem 0.75rem', borderRadius: '0.5rem' }}>
                             ${job.payAmount}/{job.payRate}
                          </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: job.status === 'open' ? '#166534' : '#64748b', background: job.status === 'open' ? '#dcfce7' : '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', textTransform: 'uppercase' }}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ textAlign: 'right', marginRight: '1rem' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>APPLICANTS</p>
                        <h5 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{job.applicants?.length || 0}</h5>
                      </div>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.8rem 1.5rem' }}
                        onClick={() => window.location.href = '/gigs'} // Shortcut to view applications
                      >
                        Manage
                      </button>
                      {job.status === 'filled' && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleCompleteJob(job._id)}
                        >
                          Finish
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
