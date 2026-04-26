import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, Star, MapPin, AlertCircle, User as UserIcon, Settings, CheckCircle, Activity, Building2, X, Clock } from 'lucide-react';
import axios from 'axios';
import ReviewModal from './ReviewModal';
import AppNavbar from './AppNavbar';
import ChatBox from './ChatBox';

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('find');

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
  const [chatJob, setChatJob]         = useState(null); // { id, title, receiverId }

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
    setInlineError(null);
    if (activeTab === 'find') fetchExploreJobs();
    if (activeTab === 'applications') fetchMyJobs();
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
    { id: 'find',         label: 'Browse Jobs',     icon: <Search size={17} /> },
    { id: 'applications', label: 'My Applications', icon: <Briefcase size={17} /> },
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

      <AppNavbar role="seeker" user={profile} />

      <div className="max-w-6xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">

        {/* ── Compact Profile Strip ── */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-md border border-gray-100 flex items-center gap-4 flex-wrap">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#0277bd,#01579b)' }}
          >
            {(profile.name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{profile.name || 'Loading…'}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
              {profile.email && <span>{profile.email}</span>}
              {profile.ratings?.count > 0 && (
                <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                  <Star size={13} fill="currentColor" />
                  {profile.ratings.average?.toFixed(1)} ({profile.ratings.count} reviews)
                </span>
              )}
              <span className={`font-semibold ${profile.isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                {profile.isOnline ? '● Online' : '○ Offline'}
              </span>
              {profile.skills?.length > 0 && (
                <span className="text-gray-400">· {profile.skills.slice(0,3).join(', ')}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-base font-semibold rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#0277bd] text-white shadow-md'
                  : 'text-gray-500 hover:text-[#0277bd] hover:bg-[#e0f7fa]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">

          {/* ── BROWSE JOBS TAB ── */}
          {activeTab === 'find' && (
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 min-h-[400px]">
              {renderInlineError()}
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <select
                  className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-semibold text-gray-700 focus:ring-2 focus:ring-[#0277bd] focus:outline-none"
                  value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-semibold text-gray-700 focus:ring-2 focus:ring-[#0277bd] focus:outline-none"
                  value={filterType} onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Any Urgency</option>
                  <option value="instant">Instant ⚡</option>
                  <option value="part-time">Part-Time</option>
                </select>
                <input
                  type="text"
                  placeholder="City or area…"
                  className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-700 focus:ring-2 focus:ring-[#0277bd] focus:outline-none"
                  value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}
                />
              </div>

              {tabLoading ? renderTabSkeletons() : jobs.length === 0 ? (
                <div className="py-20 flex flex-col items-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <AlertCircle size={48} className="text-gray-300 mb-4" />
                  <p className="text-lg font-semibold text-gray-500">No open gigs at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map(gig => (
                    <div key={gig._id} className="group bg-white border border-gray-200 hover:border-[#0277bd] hover:shadow-xl transition-all duration-200 rounded-2xl flex flex-col overflow-hidden">
                      <div className="h-36 bg-gray-50 flex items-center justify-center border-b border-gray-100 group-hover:bg-[#e0f7fa] transition-colors duration-300">
                        <Briefcase size={44} className="text-[#0277bd]/25 group-hover:text-[#0277bd] group-hover:scale-110 transition-all duration-300" />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wide text-[#0277bd]">{gig.category || 'General'}</span>
                          <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                            <Star size={11} fill="#eab308" className="text-yellow-500" /> {gig.providerId?.ratings?.average || 'New'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1 leading-snug line-clamp-2">{gig.title}</h3>
                        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                          <UserIcon size={13} /> {gig.providerId?.name || 'Local Provider'}
                        </p>
                        <div className="mt-auto space-y-2">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <MapPin size={14} className="text-gray-400 shrink-0" />
                            <span className="truncate">{gig.location || 'Location not specified'}</span>
                          </div>
                          <p className="text-2xl font-black text-green-700">
                            ₹{gig.stipend}<span className="text-sm font-semibold text-gray-400">/{gig.payRate || 'hr'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="px-5 pb-5">
                        {appliedJobIds.has(gig._id) ? (
                          <button disabled className="w-full py-3 rounded-xl text-base font-semibold flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 cursor-not-allowed">
                            <CheckCircle size={16} /> Applied ✓
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApply(gig._id)}
                            disabled={applyingId === gig._id}
                            className="w-full py-3 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-all text-white bg-[#0277bd] hover:bg-[#01579b] shadow-md hover:shadow-lg disabled:opacity-60"
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

          {/* ── MY APPLICATIONS TAB (all statuses, grouped) ── */}
          {activeTab === 'applications' && (
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 min-h-[400px]">
              {renderInlineError()}
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <Briefcase className="text-[#0277bd]" /> My Applications
              </h2>
              {tabLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[1,2,3].map(n => <div key={n} className="w-full h-24 bg-gray-100 rounded-2xl" />)}
                </div>
              ) : myJobs.length === 0 ? (
                <p className="py-12 text-center text-base text-gray-400 border-2 border-dashed rounded-2xl">
                  No applications yet — browse jobs to get started!
                </p>
              ) : (
                <div className="space-y-4">
                  {myJobs.map(job => {
                    const appInfo = job.applicants?.find(a => {
                      const sid = typeof a.seeker === 'object' ? a.seeker?._id : a.seeker;
                      return sid?.toString() === (user?.id || user?._id)?.toString();
                    });
                    const isCompleted  = job.status === 'completed';
                    const isInProgress = job.status === 'in-progress';
                    const isAccepted   = job.status === 'accepted' || appInfo?.status === 'accepted';
                    const isRejected   = appInfo?.status === 'rejected';
                    const providerName = typeof job.createdBy === 'object' ? job.createdBy?.name : 'Unknown';

                    const statusCls = isCompleted  ? 'bg-purple-100 text-purple-700' :
                                      isInProgress ? 'bg-blue-100 text-[#0277bd]'   :
                                      isAccepted   ? 'bg-cyan-100 text-cyan-700'    :
                                      isRejected   ? 'bg-red-100 text-red-700'      :
                                                     'bg-yellow-100 text-yellow-700';
                    const statusLabel = isCompleted ? 'Completed' : isInProgress ? 'In Progress' :
                                        isAccepted  ? 'Accepted'  : isRejected   ? 'Rejected' : 'Pending';

                    return (
                      <div key={job._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md transition-all gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate">{job.title}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">Provider: <span className="font-semibold text-gray-700">{providerName}</span></p>
                          <div className="flex gap-2 flex-wrap mt-3">
                            <span className="px-3 py-1 bg-white border border-gray-200 text-sm font-semibold text-gray-600 rounded-lg">{job.category}</span>
                            <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-lg">₹{job.payAmount || job.price}/{job.payRate}</span>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${statusCls}`}>{statusLabel}</span>
                            {isCompleted && job.seekerReviewed && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-lg">Reviewed ✓</span>
                            )}
                          </div>
                        </div>
                        {(isAccepted || isInProgress) && (
                          <button
                            onClick={() => setChatJob({
                              id: job._id,
                              title: job.title,
                              receiverId: typeof job.createdBy === 'object' ? job.createdBy?._id : job.createdBy,
                            })}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '0.5rem 1rem', borderRadius: 10,
                              background: '#eff6ff', color: '#0277bd',
                              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                              border: '1px solid #bfdbfe',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background='#dbeafe'}
                            onMouseLeave={e => e.currentTarget.style.background='#eff6ff'}
                          >
                            💬 Chat
                          </button>
                        )}
                        {isCompleted && !job.seekerReviewed && (
                          <button
                            onClick={() => setReviewModal({ jobId: job._id, jobTitle: job.title, receiverName: providerName })}
                            className="px-5 py-2.5 bg-[#0277bd] text-white text-base font-semibold rounded-xl hover:bg-[#01579b] shadow-md transition-all flex items-center gap-2 shrink-0"
                          >
                            <Star size={15} fill="currentColor" /> Leave Review
                          </button>
                        )}
                      </div>
                    );
                  })}
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
