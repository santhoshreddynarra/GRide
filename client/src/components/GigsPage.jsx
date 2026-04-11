import React, { useState, useEffect } from 'react';
import { Search, Briefcase, MapPin, Zap, Users, CheckCircle, XCircle, Star, Filter, X, DollarSign } from 'lucide-react';

const CATEGORIES = ["All Categories", "Electrician", "Plumber", "Carpenter", "Tutor", "Delivery helper", "Other skilled trades", "Other"];

// --- Rating Modal Component ---
const RatingModal = ({ isOpen, onClose, onSubmit, targetName }) => {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(10px)'
    }}>
      <div className="card fade-in" style={{ 
        width: '100%', maxWidth: '500px', padding: '3rem', 
        background: 'white', borderRadius: '2rem', textAlign: 'center' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Rate {targetName}</h3>
        <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>How was your experience working together?</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
          {[1, 2, 3, 4, 5].map(num => (
            <Star 
              key={num} 
              size={40} 
              fill={num <= score ? 'var(--yellow)' : 'none'} 
              stroke={num <= score ? 'var(--yellow)' : '#cbd5e1'}
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => setScore(num)}
            />
          ))}
        </div>

        <textarea 
          placeholder="Add a comment (optional)..."
          style={{ 
            width: '100%', padding: '1rem', borderRadius: '1rem', 
            border: '2px solid #e2e8f0', marginBottom: '2rem', outline: 'none',
            fontSize: '1rem', minHeight: '100px'
          }}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button 
          className="btn btn-primary btn-full"
          onClick={() => onSubmit({ score, comment })}
        >
          Submit Rating
        </button>
      </div>
    </div>
  );
};

// --- Main GigsPage Component ---
const GigsPage = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  
  // Rating Modal State
  const [ratingModal, setRatingModal] = useState({ isOpen: false, jobId: null, targetId: null, targetName: '', role: '' });

  const isProvider = user.role === 'provider';

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('gigride_token');
      let url = isProvider ? '/api/jobs/my' : '/api/jobs?';
      
      if (!isProvider) {
        if (filterUrgency !== 'all') url += `urgency=${filterUrgency}&`;
        if (filterCategory !== 'All Categories') url += `category=${filterCategory}&`;
        if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      }

      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
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
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [filterUrgency, filterCategory, isProvider, searchQuery]);

  const handleApply = async (jobId, urgency) => {
    const isInstant = urgency === 'instant';
    if (isInstant && !window.confirm("CONFIRM INSTANT CLAIM: You acknowledge that you will handle this gig immediately!")) return;

    try {
      const token = localStorage.getItem('gigride_token');
      const endpoint = isInstant ? `/api/jobs/${jobId}/claim` : `/api/jobs/${jobId}/apply`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(isInstant ? "⚡ GIG CLAIMED! You are now assigned to this task." : "Application sent! You will be notified if selected.");
        fetchJobs();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplicantAction = async (jobId, seekerId, action) => {
    try {
      const token = localStorage.getItem('gigride_token');
      const res = await fetch(`/api/jobs/${jobId}/${action}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ seekerId })
      });
      const data = await res.json();
      if (res.ok) {
        alert(action === 'accept' ? "Partner hired!" : "Application rejected.");
        fetchJobs();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteJob = async (jobId) => {
    if (!window.confirm("Is this job completed?")) return;
    try {
      const token = localStorage.getItem('gigride_token');
      const res = await fetch(`/api/jobs/${jobId}/complete`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Success! You and your partner can now rate each other.");
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitRating = async ({ score, comment }) => {
    try {
      const token = localStorage.getItem('gigride_token');
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          to: ratingModal.targetId,
          job: ratingModal.jobId,
          score,
          comment,
          role: ratingModal.role
        })
      });
      if (res.ok) {
        alert("Rating submitted! Thank you.");
        setRatingModal({ ...ratingModal, isOpen: false });
        fetchJobs();
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFD700 0%, #000000 100%)',
      padding: '4rem 1rem'
    }}>
      <div className="view-container fade-in" style={{ 
        maxWidth: '1200px', 
        width: '100%', 
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        margin: '0 auto',
        padding: '3rem',
        borderRadius: '2rem',
        boxShadow: '0 40px 100px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', color: '#000000', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px' }}>
            Gig Marketplace
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 500 }}>
            {isProvider ? 'Manage your open dispatch board' : 'Find your next task and earn instantly'}
          </p>
        </div>

        <RatingModal 
          isOpen={ratingModal.isOpen} 
          onClose={() => setRatingModal({ ...ratingModal, isOpen: false })}
          targetName={ratingModal.targetName}
          onSubmit={handleSubmitRating}
        />

        {/* Global Control Bar */}
        <div style={{ 
          marginBottom: '3rem', 
          display: 'flex', 
          flexDirection: isProvider ? 'row-reverse' : 'row',
          flexWrap: 'wrap', 
          gap: '1.5rem', 
          background: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: '1.5rem', 
          border: '1px solid #e2e8f0',
          alignItems: 'center'
        }}>
          {!isProvider ? (
            <>
              <div style={{ flex: '2 1 400px', position: 'relative' }}>
                <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text" 
                  placeholder="Search gigs..." 
                  style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', borderRadius: '1rem', border: '2px solid #e2e8f0', outline: 'none', fontSize: '1.1rem' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div style={{ flex: '1 1 200px', display: 'flex', gap: '1rem' }}>
                <select 
                  style={{ flex: 1, padding: '1.2rem', borderRadius: '1rem', border: '2px solid #e2e8f0', outline: 'none', fontWeight: 600 }} 
                  value={filterCategory} 
                  onChange={e => setFilterCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                  style={{ flex: 1, padding: '1.2rem', borderRadius: '1rem', border: '2px solid #e2e8f0', outline: 'none', fontWeight: 600 }} 
                  value={filterUrgency} 
                  onChange={e => setFilterUrgency(e.target.value)}
                >
                  <option value="all">Any Urgency</option>
                  <option value="instant">Instant ⚡</option>
                  <option value="part-time">Standard</option>
                </select>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--black)', fontWeight: 700 }}>
              <Filter size={20} /> Application Management Dashboard
            </div>
          )}
        </div>

        {/* Dynamic List / Grid */}
        {loading && jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem' }}>Loading...</div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', background: '#f8fafc', borderRadius: '2rem' }}>
            <Briefcase size={80} style={{ color: '#cbd5e1', marginBottom: '2rem' }} />
            <h3 style={{ fontSize: '2rem', color: '#000000', fontWeight: 800 }}>No Active Gigs</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isProvider ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
            {jobs.map(job => (
              <div key={job._id} className="card bounce-in" style={{ 
                background: '#ffffff',
                borderRadius: '1.5rem',
                border: '1px solid #e2e8f0',
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '1rem', color: '#b45309' }}>
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#000000' }}>{job.title}</h3>
                      <p style={{ color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={16} /> {job.location}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span style={{ 
                      padding: '0.5rem 1rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.85rem', 
                      fontWeight: 800, 
                      background: job.status === 'open' ? '#dcfce7' : '#fffbeb', 
                      color: job.status === 'open' ? '#166534' : '#b45309' 
                    }}>
                      {job.status === 'open' ? '🟢 Open' : '🟡 ' + job.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', background: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '0.75rem', fontWeight: 700 }}>{job.category}</span>
                  {job.urgency === 'instant' && <span style={{ fontSize: '0.9rem', background: '#fee2e2', color: '#b91c1c', padding: '0.4rem 0.8rem', borderRadius: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Zap size={16} /> INSTANT
                  </span>}
                </div>

                <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.6, flex: 1 }}>{job.description}</p>

                <div style={{ padding: '1.5rem', background: '#fffbeb', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <DollarSign size={24} style={{ color: '#b45309' }} />
                    <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#000000' }}>{job.payAmount}</span>
                    <span style={{ fontSize: '1rem', color: '#b45309', fontWeight: 700 }}>/{job.payRate}</span>
                  </div>
                  
                  {!isProvider && (
                    <div>
                      {job.status === 'open' ? (
                        <button 
                          className={`btn ${job.urgency === 'instant' ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => handleApply(job._id, job.urgency)}
                        >
                          {job.urgency === 'instant' ? 'Claim Now ⚡' : 'Apply Now'}
                        </button>
                      ) : job.status === 'completed' ? (
                        <button 
                          className="btn btn-primary"
                          onClick={() => setRatingModal({ 
                            isOpen: true, 
                            jobId: job._id, 
                            targetId: job.providerId._id, 
                            targetName: job.providerId.name, 
                            role: 'provider' 
                          })}
                        >
                          Rate Provider
                        </button>
                      ) : (
                        <span style={{ fontWeight: 700, color: 'var(--gray)' }}>Active</span>
                      )}
                    </div>
                  )}

                  {isProvider && job.status === 'filled' && (
                    <button className="btn btn-primary" onClick={() => handleCompleteJob(job._id)}>Finish</button>
                  )}
                </div>

                {isProvider && job.status !== 'completed' && job.applicants?.length > 0 && (
                  <div style={{ marginTop: '1.5rem', borderTop: '2px dashed #e2e8f0', paddingTop: '1.5rem' }}>
                    <h4 style={{ fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Users size={20} /> Applicant Pool
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                      {job.applicants.map((app, idx) => (
                        <div key={idx} style={{ padding: '1.2rem', background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontWeight: 800 }}>{app.seeker?.name}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#b45309', fontWeight: 700 }}>
                              <Star size={14} fill="#b45309" /> {app.seeker?.ratings?.average || '0.0'}
                            </span>
                          </div>
                          {app.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => handleApplicantAction(job._id, app.seeker._id, 'accept')} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', background: '#000000', color: '#FFD700', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Hire</button>
                              <button onClick={() => handleApplicantAction(job._id, app.seeker._id, 'reject')} style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#fee2e2', color: '#b91c1c', border: 'none', cursor: 'pointer' }}>Reject</button>
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center', fontWeight: 800, textTransform: 'uppercase', color: app.status === 'accepted' ? '#166534' : '#64748b' }}>{app.status}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {isProvider && job.status === 'completed' && job.applicants?.find(a => a.status === 'accepted') && (
                  <button 
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                    onClick={() => {
                      const hired = job.applicants.find(a => a.status === 'accepted');
                      setRatingModal({ 
                        isOpen: true, 
                        jobId: job._id, 
                        targetId: hired.seeker._id, 
                        targetName: hired.seeker.name, 
                        role: 'seeker' 
                      });
                    }}
                  >
                    Rate Seeker
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GigsPage;
