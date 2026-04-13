import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, MapPin, Star, Users, Navigation, User as UserIcon, Settings, CheckCircle, Activity, Building2, AlertCircle, X, ChevronDown, ChevronUp, CreditCard, ClipboardList } from 'lucide-react';
import axios from 'axios';
import ReviewModal from './ReviewModal';

const CATEGORIES = ["Electrician", "Plumber", "Carpenter", "Tutor", "Delivery helper", "Other skilled trades", "Other"];

const getToken = () => localStorage.getItem('token') || localStorage.getItem('gigride_token') || '';
const getCachedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) ||
           JSON.parse(localStorage.getItem('gigride_user')) || null;
  } catch { return null; }
};

const ProviderDashboard = ({ user: userProp }) => {
  const user = userProp || getCachedUser() || {};
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  // Core Data States. Initialize with `user` from localStorage
  const [profile, setProfile] = useState(user);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || '', companyName: '', location: '' });

  const [activityFeed, setActivityFeed] = useState([]);
  const [ratingsReceived, setRatingsReceived] = useState([]);
  const [jobs, setJobs] = useState([]);
  // Expanded applicants accordion
  const [expandedJobId, setExpandedJobId] = useState(null);
  // Toast
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  // Review modal
  const [reviewModal, setReviewModal] = useState(null); // { jobId, jobTitle, receiverName }

  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [inlineError, setInlineError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Rating logic
  const [ratingModal, setRatingModal] = useState({ show: false, jobId: null, seekerId: null, seekerName: '' });
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');

  const [formData, setFormData] = useState({ title: '', description: '', category: CATEGORIES[0], urgency: 'part-time', location: '', stipend: '', payRate: 'hour', mobileNumber: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    setInlineError(null); // Clear errors on tab switch
    if (activeTab === 'gigs' || activeTab === 'history' || activeTab === 'hires' || activeTab === 'applicants') fetchJobs();
    if (activeTab === 'ratings') fetchMyRatings();
    if (activeTab === 'profile') { fetchProfile(); fetchActivity(); }
  }, [activeTab]);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.allSettled([fetchProfile(), fetchActivity()]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    const uid = user?.id || user?._id;
    if (!uid) {
      try {
        const res = await axios.get('/api/auth/me', { headers: { 'Authorization': `Bearer ${getToken()}` } });
        const freshUser = res.data?.user;
        if (freshUser) {
          setProfile(freshUser);
          setEditForm({ name: freshUser.name || '', companyName: freshUser.companyName || '', location: freshUser.location || '' });
        }
      } catch { /* silent */ }
      return;
    }
    try {
      const res = await axios.get(`/api/profile/${uid}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      const freshUser = res.data?.user;
      if (freshUser) {
        setProfile(freshUser);
        setEditForm({ name: freshUser.name || '', companyName: freshUser.companyName || '', location: freshUser.location || '' });
      }
    } catch (err) {
      console.error('[ProviderDashboard] fetchProfile error:', err?.response?.status);
      if (err?.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }
      const cached = getCachedUser();
      if (cached && !profile?.name) setProfile(cached);
      setInlineError('Could not refresh profile — showing cached data.');
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await axios.get('/api/profile/activity', { headers: { 'Authorization': `Bearer ${getToken()}` } });
      setActivityFeed(res.data.activity || []);
    } catch (err) { console.error('[ProviderDashboard] fetchActivity:', err?.message); }
  };

  const fetchJobs = async () => {
    setTabLoading(true);
    setInlineError(null);
    try {
      // Use /api/jobs/my which populates applicants.seeker with name/email
      const res = await axios.get('/api/jobs/my', { headers: { 'Authorization': `Bearer ${getToken()}` } });
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('[ProviderDashboard] fetchJobs error:', err?.response?.status, err?.response?.data);
      setInlineError('Could not load your jobs right now — please try again.');
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

  const handlePostJob = async (e) => {
    e.preventDefault();
    setInlineError(null);
    setSuccessMsg(null);
    try {
      const res = await axios.post('/api/jobs', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        price: Number(formData.stipend),
        payRate: formData.payRate,
        urgency: formData.urgency || 'part-time',
      }, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      setSuccessMsg(`✅ "${res.data.job?.title || formData.title}" posted successfully! It is now visible to all seekers.`);
      setFormData({ title: '', description: '', category: CATEGORIES[0], urgency: 'part-time', location: '', stipend: '', payRate: 'hour', mobileNumber: '' });
      fetchJobs(); // refresh provider's list
    } catch (err) {
      console.error('[ProviderDashboard] handlePostJob error:', err?.response?.status, err?.response?.data);
      setInlineError(err?.response?.data?.message || err.message || 'Failed to post job.');
    }
  };

  const handleAcceptApplicant = async (jobId, seekerId) => {
    try {
      const res = await axios.put(`/api/jobs/${jobId}/accept`, { seekerId }, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      const updatedJob = res.data.job;
      showToast('Applicant accepted! Redirecting to payment… ✅');
      // Navigate to payment page after brief delay for toast visibility
      setTimeout(() => navigate(`/provider/payment/${jobId}`), 1200);
      fetchJobs();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to accept applicant.', 'error');
    }
  };

  const handleCompleteJob = async (job) => {
    if (!window.confirm('Mark this job as completed? This cannot be undone.')) return;
    try {
      const res = await axios.put(`/api/jobs/${job._id}/complete`, {}, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      showToast('✅ Job completed! Please leave a review for the seeker.');
      fetchJobs();
      // Prompt review for the seeker
      const seeker = typeof job.selectedCandidate === 'object'
        ? job.selectedCandidate
        : { name: 'the seeker', _id: job.selectedCandidate };
      setReviewModal({ jobId: job._id, jobTitle: job.title, receiverName: seeker?.name || 'the seeker' });
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to mark complete.', 'error');
    }
  };

  const handleRateSeeker = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/ratings', { to: ratingModal.seekerId, job: ratingModal.jobId, score, comment, role: 'seeker' }, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      showToast('Rating submitted! ⭐');
      setRatingModal({ show: false, jobId: null, seekerId: null, seekerName: '' });
      fetchJobs();
    } catch (err) { setInlineError(err?.response?.data?.message || 'Error submitting rating'); }
  };

  const TABS = [
    { id: 'profile', label: 'Profile', icon: <Building2 size={18} /> },
    { id: 'gigs', label: 'Post Jobs', icon: <Plus size={18} /> },
    { id: 'applicants', label: 'Applicants', icon: <Users size={18} /> },
    { id: 'history', label: 'History', icon: <CheckCircle size={18} /> },
    { id: 'hires', label: 'Seekers', icon: <UserIcon size={18} /> },
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

      {/* ── Toast Notification ── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl font-bold text-sm animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === 'success' ? 'bg-green-700 text-white' : 'bg-red-600 text-white'
          }`}
          style={{ maxWidth: 380 }}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X size={16} /></button>
        </div>
      )}

      {/* ── Review Modal ── */}
      {reviewModal && (
        <ReviewModal
          theme="green"
          jobId={reviewModal.jobId}
          jobTitle={reviewModal.jobTitle}
          receiverName={reviewModal.receiverName}
          onClose={() => setReviewModal(null)}
          onSuccess={() => { setReviewModal(null); fetchJobs(); }}
        />
      )}

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
                      {successMsg && (
                        <div className="bg-green-50 border border-green-300 text-green-800 p-4 rounded-xl font-bold flex items-center gap-3 animate-in fade-in">
                          <CheckCircle size={20} className="text-green-600 shrink-0" />
                          <p>{successMsg}</p>
                        </div>
                      )}
                      {inlineError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl font-bold flex items-center gap-3">
                          <AlertCircle size={20} className="shrink-0" />
                          <p>{inlineError}</p>
                        </div>
                      )}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-black text-gray-700 mb-2">Location</label>
                          <input className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-[#2e7d32] font-medium" placeholder="Street, City" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
                        </div>
                        <div>
                          <label className="block text-sm font-black text-gray-700 mb-2">Mobile Number</label>
                          <input type="tel" className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-[#2e7d32] font-medium" placeholder="+91 99999 00000" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-black text-gray-700 mb-2">Pay Rate (₹)</label>
                          <div className="flex gap-2">
                            <input type="number" className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-[#2e7d32] font-medium" placeholder="e.g. 500" value={formData.stipend} onChange={e => setFormData({...formData, stipend: e.target.value})} required />
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
                    <h2 className="text-2xl font-black text-gray-900 mb-8"><Briefcase className="inline mr-2 text-[#2e7d32]" /> Active</h2>
                      {tabLoading ? renderTabSkeletons() : jobs.filter(j => j.isOpen !== false).length === 0 ? (
                       <div className="py-16 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                         <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
                         <p className="text-xl font-black text-gray-500 mb-2">No gigs posted yet.</p>
                         <button onClick={() => setShowForm(true)} className="mt-4 px-6 py-2 bg-[#2e7d32] text-white font-black rounded-xl hover:bg-[#1b5e20]">Post a Gig</button>
                       </div>
                     ) : (
                       <div className="space-y-6 animate-in fade-in duration-500">
                         {jobs.filter(j => j.isOpen !== false).map(gig => (
                           <div key={gig._id} className="p-6 border border-gray-200 rounded-3xl grid grid-cols-1 lg:grid-cols-3 gap-6 hover:shadow-lg transition-all group">
                              <div className="lg:col-span-2">
                                <div className="flex items-center gap-3 mb-2">
                                   <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 font-black text-xs uppercase tracking-wider rounded-lg">{gig.category || 'General'}</span>
                                   <span className="px-3 py-1 bg-orange-50 border border-orange-100 text-orange-700 font-black text-xs uppercase tracking-wider rounded-lg">₹{gig.stipend} / {gig.payRate || 'hour'}</span>
                                   <span className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 font-black text-xs uppercase tracking-wider rounded-lg">{gig.isOpen ? 'OPEN' : 'CLOSED'}</span>
                                </div>
                                <h4 className="text-xl font-black text-gray-900 group-hover:text-[#2e7d32] transition-colors">{gig.title}</h4>
                                <p className="text-gray-500 font-bold text-sm mt-1 mb-4"><MapPin size={14} className="inline mr-1" />{gig.location || 'Location not set'}</p>
                                <p className="text-sm text-gray-600 line-clamp-2">{gig.description}</p>
                                {gig.mobileNumber && (
                                  <p className="text-sm font-bold text-gray-500 mt-2">📞 {gig.mobileNumber}</p>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-center lg:items-end justify-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                 <p className="text-xs font-black text-gray-400 tracking-widest mb-1">POSTED</p>
                                 <p className="text-sm font-black text-[#2e7d32] mb-4">{new Date(gig.createdAt).toLocaleDateString()}</p>
                                 <button
                                   className="w-full py-2 bg-red-50 text-red-600 border border-red-200 font-black rounded-lg hover:bg-red-100 text-sm active:scale-95"
                                   onClick={async () => {
                                     if (!window.confirm('Close this job?')) return;
                                     try {
                                       await axios.put(`/api/jobs/${gig._id}/complete`, {}, { headers: { Authorization: `Bearer ${getToken()}` } });
                                       fetchJobs();
                                     } catch(e) { console.error(e); }
                                   }}
                                 >Close Job</button>
                              </div>
                           </div>
                         ))}
                       </div>
                     )}
                  </div>
                )}
             </div>
          )}

          {/* APPLICANTS PER JOB TAB */}
          {activeTab === 'applicants' && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 min-h-[400px]">
               {renderInlineError()}
               <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-8"><Users className="text-[#2e7d32]" /> Applicants by Job</h2>
               {tabLoading ? renderTabSkeletons() : jobs.length === 0 ? (
                  <div className="py-12 flex flex-col items-center border border-dashed rounded-3xl bg-gray-50 text-gray-400">
                    <Users size={40} className="mb-4 text-gray-300" />
                    <p className="font-bold">No jobs posted yet. Post a job to see applicants.</p>
                  </div>
               ) : (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    {jobs.map(job => {
                      const isExpanded = expandedJobId === job._id;
                      const applicantCount = job.applicants?.length || 0;
                      return (
                        <div key={job._id} className="border border-gray-200 rounded-3xl overflow-hidden">
                          {/* Job header row */}
                          <button
                            className="w-full p-5 flex items-center justify-between bg-gray-50 hover:bg-green-50 transition-colors text-left"
                            onClick={() => setExpandedJobId(isExpanded ? null : job._id)}
                          >
                            <div>
                              <p className="font-black text-lg text-gray-900">{job.title}</p>
                              <p className="text-sm text-gray-500 font-bold mt-1">
                                <MapPin size={13} className="inline mr-1" />{job.location || 'N/A'}
                                &nbsp;·&nbsp;
                                <span className={`font-black ${job.isOpen ? 'text-green-600' : 'text-gray-400'}`}>{job.isOpen ? 'Open' : 'Closed'}</span>
                                &nbsp;·&nbsp;
                                <span className="text-[#2e7d32] font-black">{applicantCount} applicant{applicantCount !== 1 ? 's' : ''}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-gray-400 uppercase tracking-wider">₹{job.price ?? job.payAmount} / {job.payRate}</span>
                              {isExpanded ? <ChevronUp size={20} className="text-[#2e7d32]" /> : <ChevronDown size={20} className="text-gray-400" />}
                            </div>
                          </button>

                          {/* Applicants list (accordion) */}
                          {isExpanded && (
                            <div className="p-5 border-t border-gray-100">
                              {applicantCount === 0 ? (
                                <p className="text-gray-400 italic text-center py-6">No applicants yet for this job.</p>
                              ) : (
                                <div className="space-y-3">
                                  {job.applicants.map(app => {
                                    const seeker = typeof app.seeker === 'object' ? app.seeker : { _id: app.seeker, name: 'Unknown', email: '' };
                                    const statusColor = app.status === 'accepted' ? 'bg-green-100 text-green-700' : app.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700';
                                    return (
                                      <div key={app._id || seeker._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-3">
                                          <div className="p-2 bg-[#e8f5e9] rounded-full text-[#2e7d32]"><UserIcon size={18} /></div>
                                          <div>
                                            <p className="font-black text-gray-900">{seeker?.name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500 font-bold">{seeker?.email || 'No email'}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Applied: {new Date(app.appliedAt || Date.now()).toLocaleDateString()}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${statusColor}`}>
                                            {app.status || 'pending'}
                                          </span>
                                          {app.status === 'pending' && job.isOpen && (
                                            <button
                                              onClick={() => handleAcceptApplicant(job._id, seeker._id)}
                                              className="px-4 py-1.5 bg-[#2e7d32] text-white text-xs font-black rounded-lg hover:bg-[#1b5e20] active:scale-95 transition-all"
                                            >
                                              Accept
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Job-level actions based on status */}
                              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                                {job.status === 'accepted' && (
                                  <button
                                    onClick={() => navigate(`/provider/payment/${job._id}`)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white font-black rounded-xl hover:bg-green-800 active:scale-95 transition-all text-sm shadow-md"
                                  >
                                    <CreditCard size={15} /> Pay Now to Start Job
                                  </button>
                                )}
                                {job.status === 'in-progress' && (
                                  <button
                                    onClick={() => handleCompleteJob(job)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 active:scale-95 transition-all text-sm shadow-md"
                                  >
                                    <CheckCircle size={15} /> Mark as Completed
                                  </button>
                                )}
                                {job.status === 'completed' && !job.providerReviewed && (
                                  <button
                                    onClick={() => {
                                      const seeker = typeof job.selectedCandidate === 'object'
                                        ? job.selectedCandidate
                                        : { name: 'the seeker', _id: job.selectedCandidate };
                                      setReviewModal({ jobId: job._id, jobTitle: job.title, receiverName: seeker?.name || 'the seeker' });
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-white font-black rounded-xl hover:bg-yellow-600 active:scale-95 transition-all text-sm shadow-md"
                                  >
                                    <Star size={15} /> Leave a Review
                                  </button>
                                )}
                                {job.status === 'completed' && job.providerReviewed && (
                                  <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 font-bold rounded-xl text-sm">
                                    <CheckCircle size={14} /> Review Submitted
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                       const selectedSeeker = typeof job.selectedCandidate === 'object'
                         ? job.selectedCandidate
                         : job.applicants?.find(a => a.status === 'accepted')?.seeker;
                       const seekerName = typeof selectedSeeker === 'object' ? selectedSeeker?.name : 'Unknown';
                       return (
                         <div key={job._id} className="p-6 bg-gray-50 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center rounded-3xl hover:bg-white hover:shadow-md transition-all gap-4">
                            <div>
                               <h4 className="font-black text-lg text-gray-900">{job.title}</h4>
                               <p className="text-sm font-bold text-gray-500 mb-2">Worker: {seekerName}</p>
                               <div className="flex gap-2 flex-wrap">
                                 <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-black rounded-lg uppercase tracking-wider">Completed</span>
                                 {job.providerReviewed && <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded-lg uppercase tracking-wider">Reviewed ✓</span>}
                               </div>
                            </div>
                            {!job.providerReviewed && selectedSeeker && (
                               <button
                                 onClick={() => setReviewModal({ jobId: job._id, jobTitle: job.title, receiverName: seekerName })}
                                 className="px-6 py-3 bg-yellow-500 text-white font-black rounded-xl hover:bg-yellow-600 shadow-sm flex items-center gap-2 active:scale-95 transition-transform shrink-0"
                               >
                                 <Star size={16} fill="currentColor" /> Leave Review
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
