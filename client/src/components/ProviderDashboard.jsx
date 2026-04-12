import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, MapPin, Star, Users, Navigation, User as UserIcon, Settings, CheckCircle, Activity, Building2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const CATEGORIES = ["Electrician", "Plumber", "Carpenter", "Tutor", "Delivery helper", "Other skilled trades", "Other"];

const ProviderDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');

  // Core Data States. Initialize with `user` from localStorage
  const [profile, setProfile] = useState(user);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: user.name, companyName: '', location: '' });

  const [activityFeed, setActivityFeed] = useState([]);
  const [ratingsReceived, setRatingsReceived] = useState([]);
  const [jobs, setJobs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [inlineError, setInlineError] = useState(null);
  
  // Rating logic
  const [ratingModal, setRatingModal] = useState({ show: false, jobId: null, seekerId: null, seekerName: '' });
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');

  const [formData, setFormData] = useState({ title: '', description: '', category: CATEGORIES[0], urgency: 'part-time', location: '', payAmount: '', payRate: 'hour' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    setInlineError(null); // Clear errors on tab switch
    if (activeTab === 'gigs' || activeTab === 'history' || activeTab === 'hires') fetchJobs();
    if (activeTab === 'ratings') fetchMyRatings();
    if (activeTab === 'profile') { fetchProfile(); fetchActivity(); }
  }, [activeTab]);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.allSettled([fetchProfile(), fetchActivity()]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/api/profile/${user.id || user._id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      setProfile(res.data.user);
      setEditForm({
        name: res.data.user.name,
        companyName: res.data.user.companyName || '',
        location: res.data.user.location || ''
      });
    } catch (err) { 
       console.error(err); 
       if (err.response?.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
       }
       setInlineError('Could not load your complete profile right now — please try again.');
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await axios.get('/api/profile/activity', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      setActivityFeed(res.data.activity || []);
    } catch (err) { console.error(err); }
  };

  const fetchJobs = async () => {
    setTabLoading(true);
    setInlineError(null);
    try {
      const res = await axios.get('/api/jobs/my', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      setJobs(res.data.jobs || []);
    } catch (err) {
      setInlineError('Could not load your gigs right now — please try again.');
    } finally { setTabLoading(false); }
  };

  const fetchMyRatings = async () => {
    setTabLoading(true);
    setInlineError(null);
    try {
      const res = await axios.get('/api/ratings/me', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      setRatingsReceived(res.data.ratings || []);
    } catch (err) {
      setInlineError('Could not load your ratings right now — please try again.');
    } finally { setTabLoading(false); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/profile/${profile._id || profile.id}`, editForm, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      setProfile(res.data.user);
      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (err) { setInlineError("Failed to update profile. Please try again."); }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/jobs', formData, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      alert("Job posted successfully! 🚀");
      setShowForm(false);
      setFormData({ title: '', description: '', category: CATEGORIES[0], urgency: 'part-time', location: '', payAmount: '', payRate: 'hour' });
      fetchJobs();
    } catch (err) { setInlineError(`Error: ${err.response?.data?.message || err.message}`); }
  };

  const handleCompleteJob = async (jobId) => {
    if (!window.confirm("Mark this gig as completed?")) return;
    try {
      await axios.put(`/api/jobs/${jobId}/complete`, {}, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      fetchJobs();
    } catch (err) { console.error(err); }
  };

  const handleRateSeeker = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/ratings', { to: ratingModal.seekerId, job: ratingModal.jobId, score, comment, role: "seeker" }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
      alert("Rating submitted! ⭐");
      setRatingModal({ show: false, jobId: null, seekerId: null, seekerName: '' });
      fetchJobs();
    } catch (err) { setInlineError(err.response?.data?.message || "Error submitting rating"); }
  };

  const TABS = [
    { id: 'profile', label: 'Dashboard', icon: <Building2 size={18} /> },
    { id: 'gigs', label: 'Active Dispatches (Applicants)', icon: <Briefcase size={18} /> },
    { id: 'history', label: 'Completed', icon: <CheckCircle size={18} /> },
    { id: 'hires', label: 'Recent Hires', icon: <Users size={18} /> },
    { id: 'ratings', label: 'Reviews', icon: <Star size={18} /> }
  ];

  /* GIG UI RENDER HELPERS */
  const renderInlineError = () => {
    if (!inlineError) return null;
    return (
      <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
         <AlertCircle size={20} />
         <p className="font-bold">{inlineError}</p>
      </div>
    );
  };

  const renderTabSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse mt-4">
      {[1,2,3].map(n => (
        <div key={n} className="h-48 bg-white border border-gray-100 rounded-3xl p-6 flex flex-col justify-between">
           <div className="space-y-4 shadow-sm">
              <div className="w-24 h-6 bg-[#e8f5e9] rounded-lg"></div>
              <div className="w-3/4 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
           </div>
        </div>
      ))}
    </div>
  );

  /* INITIAL BOOT SKELETON */
  if (loading) return (
    <div className="min-h-screen bg-[#e8f5e9] pb-12">
      <nav className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 sm:px-8">
        <div className="w-32 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
      </nav>
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-8">
        <div className="w-64 h-10 bg-green-100 rounded-xl mb-6 animate-pulse"></div>
        <div className="flex gap-2 mb-6">
          <div className="w-32 h-12 bg-green-100 rounded-t-xl animate-pulse"></div>
          <div className="w-32 h-12 bg-gray-200 rounded-t-xl animate-pulse"></div>
          <div className="w-32 h-12 bg-gray-200 rounded-t-xl animate-pulse"></div>
        </div>
        <div className="w-full h-96 bg-white rounded-3xl shadow-sm animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12 transition-colors duration-300" style={{ backgroundColor: '#e8f5e9' }}>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#2e7d32]" />
            <span className="font-bold text-xl text-[#2e7d32]">ProviderDash</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-800 hidden sm:block text-lg">Welcome back, {profile.name}!</span>
            <button 
               onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
               className="text-sm font-bold text-white px-4 py-2 rounded-lg bg-[#2e7d32] hover:bg-[#1b5e20] transition-colors relative overflow-hidden group shadow-md"
            >
               <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></span>
               <span className="relative">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        
        {/* Horizontal Scrollable Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 hide-scrollbar border-b border-[#a5d6a7]">
           {TABS.map(tab => (
             <button 
               key={tab.id}
               className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold transition-all whitespace-nowrap active:scale-95 ${activeTab === tab.id ? 'bg-[#2e7d32] text-white shadow-lg' : 'bg-white/50 text-[#2e7d32] hover:bg-white'}`}
               onClick={() => { setActiveTab(tab.id); setShowForm(false); }}
             >
               {tab.icon} {tab.label}
             </button>
          ))}
        </div>

        {/* POST GIG QUICK ACTION */}
        {activeTab === 'gigs' && !showForm && (
          <div className="flex justify-end mb-6">
            <button 
              className="px-8 py-3 rounded-2xl font-black flex items-center gap-2 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all"
              style={{ backgroundColor: '#2e7d32' }}
              onClick={() => setShowForm(true)}
            >
              <Plus size={20} /> Publish New Gig
            </button>
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* PROFILE & FEED TAB */}
          {activeTab === 'profile' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                  {renderInlineError()}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#e8f5e9] p-4 rounded-full text-[#2e7d32]"><Building2 size={40} /></div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
                        <div className="flex gap-2 text-sm text-gray-500 mt-1">
                          <Briefcase size={16} /> {profile.companyName || 'Independent'}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="p-2 text-gray-400 hover:text-[#2e7d32] bg-gray-50 rounded-xl hover:bg-[#e8f5e9] transition-colors"><Settings /></button>
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="mt-6 bg-gray-50 p-6 rounded-2xl animate-in zoom-in-95">
                      <h4 className="font-bold mb-4">Edit Business details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input className="p-3 rounded-xl border border-gray-200 focus:ring-[#2e7d32]" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Owner Name" required />
                        <input className="p-3 rounded-xl border border-gray-200 focus:ring-[#2e7d32]" value={editForm.companyName} onChange={e => setEditForm({...editForm, companyName: e.target.value})} placeholder="Company Name" />
                        <input className="p-3 rounded-xl border border-gray-200 col-span-1 md:col-span-2 focus:ring-[#2e7d32]" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} placeholder="Base Location" />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="px-6 py-2 bg-[#2e7d32] text-white font-bold rounded-xl hover:bg-[#1b5e20] shadow-md transition-transform active:scale-95">Update Profile</button>
                        <button type="button" onClick={() => setIsEditingProfile(false)} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-6 border-t border-gray-100 pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                          <p className="text-gray-500 text-xs font-bold tracking-wider mb-1">RATING</p>
                          <p className="text-2xl font-black text-[#2e7d32] flex items-center justify-center gap-1"><Star size={20} fill="currentColor" /> {profile.ratings?.average || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                          <p className="text-gray-500 text-xs font-bold tracking-wider mb-1">REVIEWS</p>
                          <p className="text-2xl font-black text-gray-800">{profile.ratings?.count || 0}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl col-span-2 md:col-span-1">
                          <p className="text-gray-500 text-xs font-bold tracking-wider mb-1">LOCALITY</p>
                          <p className="text-lg font-black mt-1 text-gray-800">{profile.location || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Feed Side Panel */}
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 h-fit max-h-[600px] overflow-y-auto">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2 sticky top-0 bg-white/90 backdrop-blur pb-2">
                  <Activity className="text-[#2e7d32]" /> Dispatch Logs
                </h3>
                {activityFeed.length === 0 ? (
                  <p className="text-gray-400 italic text-center py-8">No recent activity.</p>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {activityFeed.map((item, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                         <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#2e7d32] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                           {item.type === 'job' ? <Briefcase size={16} /> : <Star size={16} />}
                         </div>
                         <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex justify-between items-start mb-1 text-xs font-bold text-gray-400">
                             {new Date(item.date).toLocaleDateString()}
                           </div>
                           <p className="text-sm font-bold text-gray-800">{item.title}</p>
                           {item.meta && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.meta}</p>}
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTIVE GIGS & FORM */}
          {activeTab === 'gigs' && (
             <div className="min-h-[400px]">
                {showForm ? (
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95">
                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                      <Plus className="text-[#2e7d32]" /> Publish New Dispatch
                    </h3>
                    <form onSubmit={handlePostJob} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-black text-gray-700 mb-2">Job Title</label>
                          <input className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-[#2e7d32] font-medium" placeholder="E.g. Electrician Needed" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                        </div>
                        <div>
                          <label className="block text-sm font-black text-gray-700 mb-2">Category</label>
                          <select className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-[#2e7d32] font-medium" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-black text-gray-700 mb-2">Requirements / Description</label>
                        <textarea className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-[#2e7d32] font-medium min-h-[120px]" placeholder="Explain exactly what you need built, fixed, or delivered..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-black text-gray-700 mb-2">Location</label>
                          <input className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-[#2e7d32] font-medium" placeholder="Street, City" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
                        </div>
                        <div>
                          <label className="block text-sm font-black text-gray-700 mb-2">Urgency Level</label>
                          <select className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-[#2e7d32] font-medium" value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}>
                            <option value="instant">Instant ⚡ (Emergency)</option>
                            <option value="part-time">Standard (Scheduled)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-black text-gray-700 mb-2">Stipend Rate</label>
                          <div className="flex gap-2">
                            <input type="number" className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-[#2e7d32] font-medium" placeholder="Amount" value={formData.payAmount} onChange={e => setFormData({...formData, payAmount: e.target.value})} required />
                            <select className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-[#2e7d32] font-medium" value={formData.payRate} onChange={e => setFormData({...formData, payRate: e.target.value})}>
                              <option value="hour">/ Hour</option>
                              <option value="day">/ Day</option>
                              <option value="project">/ Project</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8 pt-4 border-t border-gray-100">
                        <button type="submit" className="flex-1 py-4 text-white font-black rounded-xl shadow-md transition-transform active:scale-95 bg-[#2e7d32] hover:bg-[#1b5e20]">🚀 Execute Dispatch</button>
                        <button type="button" className="px-8 py-4 bg-gray-100 text-gray-700 font-black rounded-xl hover:bg-gray-200 active:scale-95" onClick={() => setShowForm(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                    {renderInlineError()}
                    <h2 className="text-2xl font-black text-gray-900 mb-8"><Briefcase className="inline mr-2 text-[#2e7d32]" /> Active Dispatches</h2>
                    {tabLoading ? renderTabSkeletons() : jobs.filter(j => j.status !== 'completed').length === 0 ? (
                      <div className="py-16 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                        <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-xl font-black text-gray-500 mb-2">Nothing deployed yet.</p>
                        <button onClick={() => setShowForm(true)} className="mt-4 px-6 py-2 bg-[#2e7d32] text-white font-black rounded-xl hover:bg-[#1b5e20]">Post a Gig</button>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in duration-500">
                        {jobs.filter(j => j.status !== 'completed').map(job => {
                          return (
                            <div key={job._id} className="p-6 border border-gray-200 rounded-3xl grid grid-cols-1 lg:grid-cols-3 gap-6 hover:shadow-lg transition-all group">
                               <div className="lg:col-span-2">
                                 <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 font-black text-xs uppercase tracking-wider rounded-lg">{job.category}</span>
                                    <span className="px-3 py-1 bg-orange-50 border border-orange-100 text-orange-700 font-black text-xs uppercase tracking-wider rounded-lg">${job.payAmount || job.price} / {job.payRate}</span>
                                    <span className={`px-3 py-1 bg-gray-100 font-black text-xs uppercase tracking-wider rounded-lg ${job.status === 'filled' ? 'text-[#2e7d32] border border-[#2e7d32]' : 'text-gray-600 border border-gray-200'}`}>{job.status === 'filled' ? 'IN PROGRESS' : 'OPEN'}</span>
                                 </div>
                                 <h4 className="text-xl font-black text-gray-900 group-hover:text-[#2e7d32] transition-colors">{job.title}</h4>
                                 <p className="text-gray-500 font-bold text-sm mt-1 mb-4"><MapPin size={14} className="inline mr-1" />{job.location}</p>
                                 <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                               </div>
                               
                               <div className="flex flex-col items-center lg:items-end justify-center bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                                  <p className="text-xs font-black text-gray-400 tracking-widest mb-1">APPLICANTS</p>
                                  <p className="text-3xl font-black text-[#2e7d32] mb-4">{job.applicants?.length || 0}</p>
                                  <div className="w-full flex gap-2">
                                     <button className="flex-1 py-2 bg-gray-200 text-gray-700 font-black rounded-lg hover:bg-gray-300 text-sm active:scale-95" onClick={() => alert('Applicant management UI coming soon!')}>View Applicants</button>
                                     {job.status === 'filled' && (
                                       <button onClick={() => handleCompleteJob(job._id)} className="flex-1 py-2 bg-[#2e7d32] text-white font-black rounded-lg hover:bg-[#1b5e20] text-sm active:scale-95">Mark Complete</button>
                                     )}
                                  </div>
                               </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
             </div>
          )}

          {/* COMPLETED WORKS */}
          {activeTab === 'history' && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 min-h-[400px]">
               {renderInlineError()}
               <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-8"><CheckCircle className="text-[#2e7d32]" /> Past Projects</h2>
               {tabLoading ? renderTabSkeletons() : jobs.filter(j => j.status === 'completed').length === 0 ? (
                  <div className="py-12 flex flex-col items-center border border-dashed rounded-3xl bg-gray-50 text-gray-400"><CheckCircle size={40} className="mb-4 text-gray-300" /><p className="font-bold">No completed jobs to show.</p></div>
               ) : (
                 <div className="space-y-4 animate-in fade-in duration-500">
                    {jobs.filter(j => j.status === 'completed').map(job => {
                       const acceptedSeeker = job.applicants?.find(a => a.status === 'accepted');
                       return (
                         <div key={job._id} className="p-6 bg-gray-50 border border-gray-100 flex flex-col md:flex-row justify-between items-center rounded-3xl hover:bg-white hover:shadow-md transition-all">
                            <div className="mb-4 md:mb-0">
                               <h4 className="font-black text-lg text-gray-900">{job.title}</h4>
                               <p className="text-sm font-bold text-gray-500 mb-2">Hired: {acceptedSeeker?.seeker?.name || 'Unknown'}</p>
                               <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-black rounded-lg uppercase tracking-wider">Completed</span>
                            </div>
                            {acceptedSeeker && (
                               <button 
                                 onClick={() => setRatingModal({ show: true, jobId: job._id, seekerId: typeof acceptedSeeker.seeker === 'object' ? acceptedSeeker.seeker._id : acceptedSeeker.seeker, seekerName: typeof acceptedSeeker.seeker === 'object' ? acceptedSeeker.seeker.name : 'Unknown' })}
                                 className="px-6 py-3 bg-[#2e7d32] text-white font-black rounded-xl hover:bg-[#1b5e20] shadow-sm flex items-center gap-2 active:scale-95 transition-transform"
                               >
                                 <Star size={16} fill="currentColor" /> Rate Worker
                               </button>
                            )}
                         </div>
                       )
                    })}
                 </div>
               )}
            </div>
          )}

          {/* RECENT HIRES */}
          {activeTab === 'hires' && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 min-h-[400px]">
               {renderInlineError()}
               <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-8"><Users className="text-[#2e7d32]" /> Worker Network</h2>
               {tabLoading ? renderTabSkeletons() : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95">
                     {Array.from(new Set(jobs.filter(j => j.status === 'filled' || j.status === 'completed').map(j => {
                        const accepted = j.applicants?.find(a => a.status === 'accepted');
                        return accepted ? JSON.stringify(accepted.seeker) : null;
                     }).filter(Boolean))).map(sStr => {
                        const seeker = JSON.parse(sStr);
                        if (!seeker || !seeker._id) return null;
                        return (
                          <div key={seeker._id} className="p-6 border border-gray-100 rounded-3xl bg-gray-50 flex items-center gap-4 hover:shadow-md transition-shadow">
                             <div className="p-3 bg-white shadow-sm rounded-full text-[#2e7d32] border border-gray-100"><UserIcon /></div>
                             <div>
                               <p className="font-black text-lg text-gray-900">{seeker.name}</p>
                               <p className="text-xs text-gray-500 font-bold">{seeker.email}</p>
                             </div>
                          </div>
                        )
                     })}
                     {jobs.filter(j => j.status === 'filled' || j.status === 'completed').length === 0 && (
                        <p className="col-span-full py-12 text-center text-gray-400 italic">No approved hires yet.</p>
                     )}
                  </div>
               )}
            </div>
          )}

          {/* RATINGS RECEIVED */}
          {activeTab === 'ratings' && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 min-h-[400px]">
               {renderInlineError()}
               <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-8"><Star className="text-[#2e7d32]" fill="currentColor" /> Ratings Received</h2>
               {tabLoading ? renderTabSkeletons() : ratingsReceived.length === 0 ? (
                  <div className="py-12 flex flex-col items-center border border-dashed rounded-3xl bg-gray-50 text-gray-400">
                    <Star size={40} className="mb-4 text-gray-300" />
                    <p className="font-bold">No reviews received yet from your hires.</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95">
                    {ratingsReceived.map(rating => (
                       <div key={rating._id} className="p-6 bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-3xl hover:shadow-lg transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                               <p className="font-black text-lg">{rating.from?.name || 'Anonymous'}</p>
                               <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">{rating.job?.title}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-[#2e7d32] text-white px-3 py-1 rounded-full font-black text-sm shadow-sm">
                               <Star size={14} fill="currentColor" /> {rating.score}.0
                            </div>
                          </div>
                          <p className="text-gray-700 italic border-l-4 border-green-300 pl-4 bg-white/50 p-2 rounded-r-lg">"{rating.comment}"</p>
                          <p className="text-xs text-gray-400 mt-4 text-right">{new Date(rating.createdAt).toLocaleDateString()}</p>
                       </div>
                    ))}
                  </div>
               )}
            </div>
          )}

        </div>
      </div>

      {/* RATING MODAL */}
      {ratingModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
             <h3 className="text-2xl font-black text-gray-900 mb-2">Rate Worker</h3>
             <p className="text-gray-500 mb-6 text-sm font-bold">Review {ratingModal.seekerName}'s work.</p>
             <form onSubmit={handleRateSeeker}>
               <div className="mb-4">
                 <label className="block text-sm font-black text-gray-700 mb-2">Score (1-5)</label>
                 <select className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 font-bold focus:ring-2 focus:ring-[#2e7d32]" value={score} onChange={e => setScore(Number(e.target.value))}>
                   {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                 </select>
               </div>
               <div className="mb-6">
                 <label className="block text-sm font-black text-gray-700 mb-2">Feedback</label>
                 <textarea className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 min-h-[100px] font-medium focus:ring-2 focus:ring-[#2e7d32]" placeholder="Was the work satisfactory?" required value={comment} onChange={e => setComment(e.target.value)}></textarea>
               </div>
               <div className="flex gap-2">
                 <button type="button" onClick={() => setRatingModal({ show: false, jobId: null, seekerId: null, seekerName: '' })} className="flex-1 py-4 text-gray-600 font-black bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors active:scale-95">Cancel</button>
                 <button type="submit" className="flex-1 py-4 text-white font-black rounded-xl bg-[#2e7d32] hover:bg-[#1b5e20] transition-colors shadow-md active:scale-95">Submit</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
