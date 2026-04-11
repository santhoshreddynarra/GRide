import React, { useState, useEffect } from 'react';
import { User as UserIcon, MapPin, Briefcase, Star, Settings, CheckCircle } from 'lucide-react';

const CATEGORIES = ["Electrician", "Plumber", "Carpenter", "Tutor", "Delivery helper", "Other skilled trades"];

const ProfilePage = ({ user, onUpdateSession }) => {
  const [profile, setProfile] = useState(user);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    location: user.location || '',
    companyName: user.companyName || '',
    skills: user.skills || [],
    isOnline: user.isOnline || false,
  });

  const fetchProfileAndJobs = async () => {
    setLoading(true);
    const token = localStorage.getItem('gigride_token');
    
    try {
      const [profileRes, jobsRes] = await Promise.all([
        fetch(`/api/profile/${user._id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/jobs/user/${user._id}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (profileRes.ok) {
        const pData = await profileRes.json();
        setProfile(pData.user);
        onUpdateSession(pData.user);
      }
      if (jobsRes.ok) {
        const jData = await jobsRes.json();
        setJobs(jData.jobs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndJobs();
    // eslint-disable-next-line
  }, [user._id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('gigride_token');
    try {
      const res = await fetch(`/api/profile/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        onUpdateSession(data.user);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkillToggle = (skill) => {
    setEditForm(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  if (loading) return <div className="view-container">Loading profile...</div>;

  const isProvider = profile.role === 'provider';

  return (
    <div className="view-container" style={{ maxWidth: '900px' }}>
      
      {/* Profile Header */}
      <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', background: 'var(--navy)', color: 'white' }}>
        <div style={{ background: '#e2e8f0', color: 'var(--navy)', borderRadius: '50%', padding: '1.5rem' }}>
          <UserIcon size={64} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'white' }}>{profile.name}</h2>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
            <MapPin size={16} /> {profile.location || 'Location not set'} • {profile.email}
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', background: '#334155', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
              {profile.role}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
              <Star size={16} fill="currentColor" /> {profile.ratings?.average || 0} ({profile.ratings?.count || 0} reviews)
            </span>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => setIsEditing(!isEditing)}>
          <Settings size={20} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
          <h3>Edit Profile</h3>
          <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input style={{ flex: 1 }} placeholder="Full Name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
              <input style={{ flex: 1 }} placeholder="Location" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} />
            </div>
            
            {isProvider && (
              <input placeholder="Company / Business Name" value={editForm.companyName} onChange={e => setEditForm({...editForm, companyName: e.target.value})} />
            )}

            {!isProvider && (
              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Your Skills</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {CATEGORIES.map(skill => (
                    <button 
                      key={skill} type="button"
                      style={{ padding: '0.4rem 0.8rem', borderRadius: '1rem', border: '1px solid #cbd5e1', background: editForm.skills.includes(skill) ? 'var(--teal)' : 'white', color: editForm.skills.includes(skill) ? 'white' : 'var(--navy)', cursor: 'pointer' }}
                      onClick={() => handleSkillToggle(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isProvider && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={editForm.isOnline} onChange={e => setEditForm({...editForm, isOnline: e.target.checked})} />
                I am Online (Available for Instant Gigs)
              </label>
            )}

            <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>Save Changes</button>
          </form>
        </div>
      )}

      {/* Role-Specific Displays */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Left Column: Stats & Information */}
        <div>
          {isProvider ? (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}><Briefcase size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Business Details</h3>
              <p><strong>Company:</strong> {profile.companyName || 'N/A'}</p>
              <p style={{ marginTop: '0.5rem' }}><strong>Jobs Posted:</strong> {jobs.length}</p>
              <hr style={{ margin: '1rem 0', borderColor: '#e2e8f0' }} />
              <h3 style={{ marginBottom: '1rem', color: 'var(--teal)' }}>Earnings Summary</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>$0.00 <span style={{ fontSize: '0.9rem', color: 'var(--gray)', fontWeight: 'normal' }}>spent</span></p>
            </div>
          ) : (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}><CheckCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Seeker Details</h3>
              <p><strong>Status:</strong> {profile.isOnline ? <span style={{ color: '#16a34a', fontWeight:'bold'}}>Online ⚡</span> : 'Offline'}</p>
              <p style={{ marginTop: '0.5rem' }}><strong>Jobs Applied:</strong> {jobs.length}</p>
              <hr style={{ margin: '1rem 0', borderColor: '#e2e8f0' }} />
              <h3 style={{ marginBottom: '1rem' }}>My Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {profile.skills?.length > 0 ? profile.skills.map(s => (
                  <span key={s} style={{ padding: '0.2rem 0.6rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '0.8rem' }}>{s}</span>
                )) : <span style={{ color: 'var(--gray)' }}>No skills added.</span>}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Global Gig History */}
        <div>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Gig History</h3>
          <div className="requests-list">
            {jobs.length === 0 ? (
              <p style={{ color: 'var(--gray)' }}>No history found.</p>
            ) : (
              jobs.map(job => (
                <div key={job._id} className="card request-item" style={{ marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{job.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>{job.category} • {job.location}</p>
                    {isProvider ? (
                       <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Posted by you.</p>
                    ) : (
                       <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>You applied for this.</p>
                    )}
                  </div>
                  <div>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', background: job.isOpen ? '#dcfce7' : '#e5e7eb', color: job.isOpen ? '#166534' : '#4b5563', fontSize: '0.8rem', fontWeight: 600 }}>
                      {job.isOpen ? 'Active' : 'Closed'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
