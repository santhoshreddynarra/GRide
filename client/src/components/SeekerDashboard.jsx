import React, { useState, useEffect, useRef } from 'react';
import { Search, Briefcase, Star, MapPin, AlertCircle, Navigation, User as UserIcon, Settings, CheckCircle, Activity, Building2, X, Clock } from 'lucide-react';
import axios from 'axios';
import ReviewModal from './ReviewModal';

const CATEGORIES = ["All Categories", "Electrician", "Plumber", "Carpenter", "Tutor", "Delivery helper", "Other skilled trades", "Other"];

const getToken = () => localStorage.getItem('token') || localStorage.getItem('gigride_token') || '';
const getCachedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) ||
           JSON.parse(localStorage.getItem('gigride_user')) || null;
  } catch { return null; }
};

const SeekerDashboard = ({ user: userProp }) => {
  const user = userProp || getCachedUser() || {};
  const [activeTab, setActiveTab] = useState('profile');

  // Core Data States. Initialize Profile with localStorage `user` to prevent fatal crash if api fails!
  const [profile, setProfile] = useState(user);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || '', location: '', skills: [], isOnline: false });

  const [activityFeed, setActivityFeed] = useState([]);
  const [ratingsReceived, setRatingsReceived] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  // Track which job IDs the seeker has applied to (for instant button update)
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [applyingId, setApplyingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [inlineError, setInlineError] = useState(null);
  // Toast notifications
  const [toast, setToast] = useState(null); // { msg, type: 'success'|'error' }
  const toastTimer = useRef(null);
  // Review modal
  const [reviewModal, setReviewModal] = useState(null); // { jobId, jobTitle, receiverName }

  // Rating logic
  const [ratingModal, setRatingModal] = useState({ show: false, jobId: null, providerId: null, providerName: '' });
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');

  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterLocation, setFilterLocation] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    setInlineError(null); // Clear errors when switching tabs
    if (activeTab === 'find') fetchExploreJobs();
    if (activeTab === 'applications' || activeTab === 'history' || activeTab === 'employers') fetchMyJobs();
    if (activeTab === 'ratings') fetchMyRatings();
    if (activeTab === 'profile') {
      fetchProfile();
      fetchActivity();
    }
  }, [activeTab, filterType, filterCategory, filterLocation]);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.allSettled([fetchProfile(), fetchActivity()]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    const uid = user?.id || user?._id;
    if (!uid) {
      // No user id — try /api/auth/me fallback
      try {
        const res = await axios.get('/api/auth/me', { headers: { 'Authorization': `Bearer ${getToken()}` } });
        const freshUser = res.data?.user;
        if (freshUser) {
          setProfile(freshUser);
          setEditForm({ name: freshUser.name || '', location: freshUser.location || '', skills: freshUser.skills || [], isOnline: freshUser.isOnline || false });
        }
      } catch { /* silent */ }
      return;
    }
    try {
      const res = await axios.get(`/api/profile/${uid}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      const freshUser = res.data?.user;
      if (freshUser) {
        setProfile(freshUser);
        setEditForm({ name: freshUser.name || '', location: freshUser.location || '', skills: freshUser.skills || [], isOnline: freshUser.isOnline || false });
      }
    } catch (err) {
      console.error('[SeekerDashboard] fetchProfile error:', err?.response?.status, err?.response?.data);
      if (err?.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }
      // Graceful fallback — keep cached profile, just show warning
      const cached = getCachedUser();
      if (cached && !profile?.name) setProfile(cached);
      setInlineError('Could not refresh profile — showing cached data.');
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await axios.get('/api/profile/activity', { headers: { 'Authorization': `Bearer ${getToken()}` } });
      setActivityFeed(res.data.activity || []);
    } catch (err) { console.error('[SeekerDashboard] fetchActivity:', err?.message); }
  };

  const fetchExploreJobs = async () => {
    setTabLoading(true);
    setInlineError(null);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('urgency', filterType);
      if (filterCategory !== 'All Categories') params.append('category', filterCategory);
      if (filterLocation) params.append('location', filterLocation);

      // Try /api/jobs first (primary); fallback to /api/gigs
      let jobList = [];
      try {
        const res = await axios.get(`/api/jobs?${params.toString()}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
        jobList = res.data.jobs || [];
      } catch {
        const res = await axios.get(`/api/gigs?${params.toString()}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
        jobList = res.data.gigs || [];
      }
      setJobs(jobList);

      // Determine which jobs the current seeker has already applied to
      const uid = user?.id || user?._id;
      if (uid) {
        const appliedIds = new Set(
          jobList
            .filter(j => j.applicants?.some(a => (a.seeker?._id || a.seeker) === uid || (a.seeker?._id || a.seeker)?.toString() === uid?.toString()))
            .map(j => j._id)
        );
        setAppliedJobIds(prev => new Set([...prev, ...appliedIds]));
      }
    } catch (err) {
      console.error('[SeekerDashboard] fetchExploreJobs error:', err?.response?.status, err?.response?.data);
      setInlineError(err?.response?.data?.message || 'Could not load jobs right now — please try again.');
    } finally { setTabLoading(false); }
  };

  const fetchMyJobs = async () => {
    setTabLoading(true);
    setInlineError(null);
    try {
      const res = await axios.get('/api/jobs/applied', { headers: { 'Authorization': `Bearer ${getToken()}` } });
      const applied = res.data.jobs || [];
      setMyJobs(applied);
      // Mark these jobs as applied in state
      setAppliedJobIds(prev => new Set([...prev, ...applied.map(j => j._id)]));
    } catch (err) {
      console.error('[SeekerDashboard] fetchMyJobs:', err?.response?.data);
      setInlineError('Could not load your applications right now — please try again.');
    } finally { setTabLoading(false); }
  };

  const fetchMyRatings = async () => {
    setTabLoading(true);
    setInlineError(null);
    try {
      const res = await axios.get('/api/ratings/me', { headers: { 'Authorization': `Bearer ${getToken()}` } });
      setRatingsReceived(res.data.ratings || []);
    } catch (err) {
      setInlineError('Could not load your ratings right now — please try again.');
    } finally { setTabLoading(false); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/profile/${profile?._id || profile?.id}`, editForm, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      setProfile(res.data.user);
      setIsEditingProfile(false);
      showToast('Profile updated successfully! ✅');
    } catch (err) { setInlineError('Failed to update profile. Please try again.'); }
  };

  const handleSkillToggle = (skill) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill]
    }));
  };

  const handleApply = async (jobId) => {
    if (appliedJobIds.has(jobId) || applyingId === jobId) return;
    setApplyingId(jobId);
    try {
      await axios.post(`/api/jobs/${jobId}/apply`, {}, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      // Optimistically mark as applied immediately
      setAppliedJobIds(prev => new Set([...prev, jobId]));
      showToast('Applied successfully! ✅ The provider will review your request.');
    } catch (err) {
      console.error('[SeekerDashboard] handleApply error:', err?.response?.status, err?.response?.data);
      const msg = err?.response?.data?.message || 'Failed to apply — please try again.';
      if (msg.toLowerCase().includes('already applied')) {
        setAppliedJobIds(prev => new Set([...prev, jobId])); // sync state
        showToast('You have already applied to this job.', 'error');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setApplyingId(null);
    }
  };

  const handleRateProvider = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/ratings', { to: ratingModal.providerId, job: ratingModal.jobId, score, comment, role: 'provider' }, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      showToast('Rating submitted! ⭐');
      setRatingModal({ show: false, jobId: null, providerId: null, providerName: '' });
      fetchMyJobs();
    } catch (err) { setInlineError(err?.response?.data?.message || 'Error submitting rating'); }
  };

  const TABS = [
    { id: 'profile', label: 'Profile', icon: <UserIcon size={18} /> },
    { id: 'find', label: 'Find Gigs', icon: <Search size={18} /> },
    { id: 'applications', label: 'Applications', icon: <Briefcase size={18} /> },
    { id: 'history', label: 'History', icon: <CheckCircle size={18} /> },
    { id: 'employers', label: 'Employers', icon: <Building2 size={18} /> },
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
      {[1,2,3,4,5,6].map(n => (
        <div key={n} className="h-64 bg-white border border-gray-100 rounded-3xl p-6 flex flex-col justify-between">
           <div className="space-y-4 shadow-sm">
              <div className="w-16 h-6 bg-[#e0f7fa] rounded-lg"></div>
              <div className="w-3/4 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
           </div>
           <div className="w-full h-12 bg-gray-100 rounded-xl mt-6"></div>
        </div>
      ))}
    </div>
  );

  /* INITIAL BOOT SKELETON */
  if (loading) return (
    <div className="min-h-screen bg-[#e0f7fa] pb-12">
      <nav className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 sm:px-8">
        <div className="w-32 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
      </nav>
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-8">
        <div className="w-64 h-10 bg-blue-100 rounded-xl mb-6 animate-pulse"></div>
        <div className="flex gap-2 mb-6">
          <div className="w-32 h-12 bg-blue-100 rounded-t-xl animate-pulse"></div>
          <div className="w-32 h-12 bg-gray-200 rounded-t-xl animate-pulse"></div>
          <div className="w-32 h-12 bg-gray-200 rounded-t-xl animate-pulse"></div>
        </div>
        <div className="w-full h-96 bg-white rounded-3xl shadow-sm animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12 transition-colors duration-300" style={{ backgroundColor: '#e0f7fa' }}>

      {/* ── Toast Notification ── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl font-bold text-sm animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
          style={{ maxWidth: 360 }}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X size={16} /></button>
        </div>
      )}

      {/* ── Review Modal (blue theme for seeker) ── */}
      {reviewModal && (
        <ReviewModal
          theme="blue"
          jobId={reviewModal.jobId}
          jobTitle={reviewModal.jobTitle}
          receiverName={reviewModal.receiverName}
          onClose={() => setReviewModal(null)}
          onSuccess={() => { setReviewModal(null); fetchMyJobs(); }}
        />
      )}

      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-6 h-6 text-[#0277bd]" />
            <span className="font-bold text-xl text-[#0277bd]">SeekerDash</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-800 hidden sm:block text-lg">Welcome back, {profile.name}!</span>
            <button 
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              className="text-sm font-bold text-white px-4 py-2 rounded-lg bg-[#0277bd] hover:bg-[#01579b] transition-colors relative overflow-hidden group shadow-md"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></span>
              <span className="relative">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        
        {/* Horizontal Scrollable Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 hide-scrollbar border-b border-[#b2ebf2]">
          {TABS.map(tab => (
            <button 
              key={tab.id}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold transition-all whitespace-nowrap active:scale-95 ${activeTab === tab.id ? 'bg-[#0277bd] text-white shadow-lg' : 'bg-white/50 text-[#0277bd] hover:bg-white'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Wrapper */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* PROFILE & ACTIVITY TAB */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                  {renderInlineError()}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#e0f7fa] p-4 rounded-full text-[#0277bd]"><UserIcon size={40} /></div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
                        <div className="flex gap-2 text-sm text-gray-500 mt-1">
                          <MapPin size={16} /> {profile.location || 'No location set'}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="p-2 text-gray-400 hover:text-[#0277bd] bg-gray-50 rounded-xl hover:bg-[#e0f7fa] transition-colors"><Settings /></button>
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="mt-6 bg-gray-50 p-6 rounded-2xl animate-in zoom-in-95">
                      <h4 className="font-bold mb-4">Edit Profile details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0277bd]" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Name" required />
                        <input className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0277bd]" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} placeholder="Location" />
                      </div>
                      <div className="mb-4">
                        <p className="font-bold text-sm mb-2 text-gray-700">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {CATEGORIES.filter(c => c !== 'All Categories').map(skill => (
                            <button type="button" key={skill} onClick={() => handleSkillToggle(skill)} className={`px-3 py-1 rounded-full text-sm font-bold border transition-colors active:scale-95 ${editForm.skills.includes(skill) ? 'bg-[#0277bd] text-white border-[#0277bd]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#0277bd]'}`}>
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                      <label className="flex items-center gap-2 mb-6 cursor-pointer select-none">
                        <input type="checkbox" className="w-5 h-5 rounded text-[#0277bd] focus:ring-[#0277bd]" checked={editForm.isOnline} onChange={e => setEditForm({...editForm, isOnline: e.target.checked})} />
                        <span className="font-bold text-gray-700">I am Online ⚡ (Available for Instant Gigs)</span>
                      </label>
                      <div className="flex gap-2">
                        <button type="submit" className="px-6 py-2 bg-[#0277bd] text-white font-bold rounded-xl hover:bg-[#01579b] shadow-md transition-transform active:scale-95">Save Profile</button>
                        <button type="button" onClick={() => setIsEditingProfile(false)} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-6 border-t border-gray-100 pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                          <p className="text-gray-500 text-xs font-bold tracking-wider mb-1">RATING</p>
                          <p className="text-2xl font-black text-[#0277bd] flex items-center justify-center gap-1"><Star size={20} fill="currentColor" /> {profile.ratings?.average || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                          <p className="text-gray-500 text-xs font-bold tracking-wider mb-1">REVIEWS</p>
                          <p className="text-2xl font-black text-gray-800">{profile.ratings?.count || 0}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                          <p className="text-gray-500 text-xs font-bold tracking-wider mb-1">STATUS</p>
                          <p className={`text-lg font-black mt-1 ${profile.isOnline ? 'text-green-600' : 'text-gray-400'}`}>{profile.isOnline ? 'ONLINE ⚡' : 'OFFLINE'}</p>
                        </div>
                      </div>
                      <div className="mt-6">
                         <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">My Skills Stack</p>
                         <div className="flex flex-wrap gap-2">
                           {profile.skills?.length > 0 ? profile.skills.map(s => <span key={s} className="px-3 py-1 bg-[#e0f7fa] text-[#0277bd] font-bold text-sm rounded-lg">{s}</span>) : <span className="text-gray-400 italic">No skills listed yet.</span>}
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Feed Side Panel */}
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 h-fit max-h-[600px] overflow-y-auto">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2 sticky top-0 bg-white/90 backdrop-blur pb-2">
                  <Activity className="text-[#0277bd]" /> Activity Feed
                </h3>
                {activityFeed.length === 0 ? (
                  <p className="text-gray-400 italic text-center py-8">No recent activity found.</p>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {activityFeed.map((item, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                         <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#0277bd] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
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

          {/* FIND GIGS TAB */}
          {activeTab === 'find' && (
             <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 min-h-[400px]">
               {renderInlineError()}
               <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                 <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Search className="text-[#0277bd]" /> Explore Opportunities</h2>
                 <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <select className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-[#0277bd]" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-[#0277bd]" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                      <option value="all">Any Urgency</option>
                      <option value="instant">Instant ⚡</option>
                      <option value="part-time">Part-Time</option>
                    </select>
                    <input type="text" placeholder="City or area..." className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-[#0277bd]" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} />
                 </div>
               </div>

               {tabLoading ? renderTabSkeletons() : jobs.length === 0 ? (
                 <div className="py-20 flex flex-col items-center bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                    <AlertCircle size={48} className="text-gray-300 mb-4" />
                    <p className="text-lg font-bold text-gray-500">No open gigs at the moment.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
                    {jobs.map(gig => (
                      <div key={gig._id} className="group relative bg-white border border-gray-200 hover:border-[#0277bd] hover:shadow-xl transition-all rounded-3xl p-0 flex flex-col overflow-hidden">
                         <div className="h-40 bg-gray-50 relative overflow-hidden flex items-center justify-center p-6 border-b border-gray-100 group-hover:bg-[#e0f7fa] transition-colors duration-500">
                             <Briefcase size={48} className="text-[#0277bd]/30 group-hover:scale-110 group-hover:text-[#0277bd] transition-all duration-500" />
                         </div>
                         <div className="p-6 flex flex-col flex-1">
                           <div className="flex justify-between items-start mb-2">
                             <span className="text-xs font-black uppercase tracking-wider text-[#0277bd]">{gig.category || 'General'}</span>
                             <div className="flex gap-1 items-center bg-gray-50 px-2 py-1 rounded text-xs font-bold text-gray-600"><Star size={12} fill="#eab308" className="text-yellow-500" /> {gig.providerId?.ratings?.average || 'New'}</div>
                           </div>
                           <h3 className="text-lg font-black text-gray-900 mb-1 leading-tight line-clamp-2" title={gig.title}>{gig.title}</h3>
                           <p className="text-sm font-bold text-gray-400 line-clamp-1 mb-4 flex items-center gap-1"><UserIcon size={14} /> {gig.providerId?.name || 'Local Provider'}</p>
                           
                           <div className="mt-auto">
                             <div className="flex items-center gap-2 text-sm text-gray-500 mb-3"><MapPin size={16} className="text-gray-400 shrink-0" /> <span className="truncate">{gig.location || 'Location not specified'}</span></div>
                             <div className="flex flex-col">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pay Rate</span>
                                <span className="text-2xl font-black text-green-700">₹{gig.stipend}<span className="text-sm text-gray-500 font-bold">/{gig.payRate || 'hour'}</span></span>
                             </div>
                           </div>
                         </div>
                         <div className="p-4 border-t border-gray-100 bg-white">
                           {appliedJobIds.has(gig._id) ? (
                             <button
                               disabled
                               className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 bg-green-100 text-green-700 border border-green-200 cursor-not-allowed"
                             >
                               <CheckCircle size={16} /> Applied ✓
                             </button>
                           ) : (
                             <button
                               onClick={() => handleApply(gig._id)}
                               disabled={applyingId === gig._id}
                               className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 text-white shadow-md bg-[#0277bd] hover:bg-[#01579b] disabled:opacity-60 disabled:cursor-not-allowed"
                             >
                               {applyingId === gig._id ? 'Applying…' : 'Apply Now'}
                             </button>
                           )}
                         </div>
                      </div>
                    ))}
                 </div>
               )}
             </div>
          )}

          {/* MY APPLICATIONS & PAST WORKS TABS */}
          {(activeTab === 'applications' || activeTab === 'history') && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 min-h-[400px]">
               {renderInlineError()}
               <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-8">
                 {activeTab === 'applications' ? <><Briefcase className="text-[#0277bd]" /> Active Applications</> : <><CheckCircle className="text-green-600" /> Completed Works</>}
               </h2>
               
               {tabLoading ? (
                 <div className="space-y-4 animate-pulse">
                    {[1,2,3].map(n => <div key={n} className="w-full h-24 bg-gray-100 rounded-3xl"></div>)}
                 </div>
               ) : myJobs.length === 0 ? (
                 <p className="py-8 text-center text-gray-400 italic border-2 border-dashed rounded-2xl">Nothing to see here yet.</p>
               ) : (
                 <div className="space-y-4 animate-in fade-in duration-500">
                    {myJobs.map(job => {
                      const appInfo = job.applicants?.find(a => {
                        const sid = typeof a.seeker === 'object' ? a.seeker?._id : a.seeker;
                        return sid?.toString() === (user?.id || user?._id)?.toString();
                      });
                      const isCompleted = job.status === 'completed';
                      const isInProgress = job.status === 'in-progress';
                      const isAccepted = job.status === 'accepted' || appInfo?.status === 'accepted';
                      const isRejected = appInfo?.status === 'rejected';
                      if (activeTab === 'applications' && isCompleted) return null;
                      if (activeTab === 'history' && !isCompleted) return null;

                      const providerName = typeof job.createdBy === 'object' ? job.createdBy?.name : 'Unknown';

                      return (
                        <div key={job._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-gray-50 border border-gray-100 rounded-3xl hover:bg-white hover:shadow-md transition-all group gap-4">
                          <div className="w-full md:w-auto">
                            <h3 className="font-black text-lg text-gray-900 group-hover:text-[#0277bd] transition-colors">{job.title}</h3>
                            <p className="text-sm font-bold text-gray-500 mb-3">Provider: {providerName}</p>
                            <div className="flex gap-2 flex-wrap">
                               <span className="px-3 py-1 bg-white border border-gray-200 text-xs font-black text-gray-700 rounded-lg">{job.category}</span>
                               <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded-lg">₹{job.payAmount || job.price} / {job.payRate}</span>
                               <span className={`px-3 py-1 text-xs font-black rounded-lg uppercase tracking-wider ${
                                 isCompleted ? 'bg-purple-100 text-purple-700' :
                                 isInProgress ? 'bg-blue-100 text-[#0277bd]' :
                                 isAccepted ? 'bg-cyan-100 text-cyan-700' :
                                 isRejected ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                               }`}>
                                 {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : isAccepted ? 'Accepted' : isRejected ? 'Rejected' : 'Pending'}
                               </span>
                               {isCompleted && job.seekerReviewed && (
                                 <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded-lg">Reviewed ✓</span>
                               )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                            {isCompleted && !job.seekerReviewed && (
                              <button 
                                onClick={() => setReviewModal({ jobId: job._id, jobTitle: job.title, receiverName: providerName })}
                                className="px-6 py-2.5 bg-[#0277bd] text-white font-black rounded-xl hover:bg-[#01579b] shadow-md transition-transform active:scale-95 flex items-center gap-2 text-sm"
                              >
                                <Star size={15} fill="currentColor" /> Leave Review
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                 </div>
               )}
            </div>
          )}

          {/* RECENT EMPLOYERS TAB */}
          {activeTab === 'employers' && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 min-h-[400px]">
               {renderInlineError()}
               <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-8"><Building2 className="text-[#0277bd]" /> Recent Employers</h2>
               {tabLoading ? renderTabSkeletons() : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95">
                     {Array.from(new Set(myJobs.filter(j => j.status === 'completed' || j.applicants.some(a => (a.seeker === user.id || a.seeker._id === user.id) && a.status === 'accepted')).map(j => JSON.stringify(j.createdBy)))).map(pStr => {
                        const provider = JSON.parse(pStr);
                        if (!provider || !provider._id) return null;
                        return (
                          <div key={provider._id} className="p-6 border border-gray-100 rounded-3xl bg-gray-50 flex items-center gap-4 hover:shadow-md transition-shadow">
                             <div className="p-3 bg-white shadow-sm rounded-full text-[#0277bd] border border-gray-100"><UserIcon /></div>
                             <div>
                               <p className="font-black text-lg text-gray-900">{provider.name}</p>
                               <p className="text-xs text-gray-500 font-bold">{provider.email}</p>
                             </div>
                          </div>
                        )
                     })}
                  </div>
               )}
            </div>
          )}

          {/* RATINGS RECEIVED TAB */}
          {activeTab === 'ratings' && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 min-h-[400px]">
               {renderInlineError()}
               <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-8"><Star className="text-[#0277bd]" fill="currentColor" /> Ratings Received</h2>
               {tabLoading ? renderTabSkeletons() : ratingsReceived.length === 0 ? (
                  <div className="py-12 flex flex-col items-center border border-dashed rounded-3xl bg-gray-50 text-gray-400">
                    <Star size={40} className="mb-4 text-gray-300" />
                    <p className="font-bold">No reviews received yet. Keep working hard!</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95">
                    {ratingsReceived.map(rating => (
                       <div key={rating._id} className="p-6 bg-gradient-to-br from-yellow-50 to-white border border-yellow-100 rounded-3xl hover:shadow-lg transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                               <p className="font-black text-lg">{rating.from?.name || 'Anonymous'}</p>
                               <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">{rating.job?.title}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-black text-sm shadow-sm">
                               <Star size={14} fill="currentColor" /> {rating.score}.0
                            </div>
                          </div>
                          <p className="text-gray-700 italic border-l-4 border-yellow-300 pl-4 bg-white/50 p-2 rounded-r-lg">"{rating.comment}"</p>
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
            <h3 className="text-2xl font-black text-gray-900 mb-2">Rate {ratingModal.providerName}</h3>
            <p className="text-gray-500 mb-6 text-sm font-bold">Share your feedback to build network trust.</p>
            <form onSubmit={handleRateProvider}>
              <div className="mb-4">
                <label className="block text-sm font-black text-gray-700 mb-2">Score (1-5)</label>
                <select className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 font-bold" value={score} onChange={e => setScore(Number(e.target.value))}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-black text-gray-700 mb-2">Feedback</label>
                <textarea className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 min-h-[100px] font-medium" placeholder="How was the gig?" required value={comment} onChange={e => setComment(e.target.value)}></textarea>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setRatingModal({ show: false, jobId: null, providerId: null, providerName: '' })} className="flex-1 py-4 text-gray-600 font-black bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors active:scale-95">Cancel</button>
                <button type="submit" className="flex-1 py-4 text-white font-black rounded-xl bg-[#0277bd] hover:bg-[#01579b] shadow-md transition-transform active:scale-95">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard;
