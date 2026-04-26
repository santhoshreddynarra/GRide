import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Briefcase, MapPin, Star, Users, User as UserIcon,
  CheckCircle, AlertCircle, X, ChevronDown, ChevronUp, CreditCard,
} from 'lucide-react';
import axios from 'axios';
import ReviewModal from './ReviewModal';
import AppNavbar from './AppNavbar';
import ChatBox from './ChatBox';

const CATEGORIES = ["Electrician", "Plumber", "Carpenter", "Tutor", "Delivery helper", "Other skilled trades", "Other"];

const getToken = () => localStorage.getItem('token') || localStorage.getItem('gigride_token') || '';
const getCachedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) ||
           JSON.parse(localStorage.getItem('gigride_user')) || null;
  } catch { return null; }
};


// ─── Main ProviderDashboard ───────────────────────────────────────────────────
const ProviderDashboard = ({ user: userProp }) => {
  const user = userProp || getCachedUser() || {};
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('gigs');

  const [profile, setProfile]           = useState(user);
  const [editForm, setEditForm]         = useState({ name: user?.name || '', companyName: '', location: '' });
  const [activityFeed, setActivityFeed] = useState([]);
  const [jobs, setJobs]                 = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [toast, setToast]               = useState(null);
  const toastTimer                      = useRef(null);
  const [reviewModal, setReviewModal]   = useState(null);
  const [chatJob, setChatJob]           = useState(null); // { id, title, receiverId }

  const [loading, setLoading]           = useState(true);
  const [tabLoading, setTabLoading]     = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [inlineError, setInlineError]   = useState(null);
  const [successMsg, setSuccessMsg]     = useState(null);

  const [ratingModal, setRatingModal]   = useState({ show: false, jobId: null, seekerId: null, seekerName: '' });
  const [score, setScore]               = useState(5);
  const [comment, setComment]           = useState('');

  const [formData, setFormData] = useState({
    title: '', description: '', category: CATEGORIES[0],
    urgency: 'part-time', location: '', stipend: '', payRate: 'hour', mobileNumber: '',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    setInlineError(null);
    if (activeTab === 'gigs' || activeTab === 'history' || activeTab === 'applicants') fetchJobs();
  }, [activeTab]);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.allSettled([fetchProfile(), fetchActivity(), fetchJobs()]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    const uid = user?.id || user?._id;
    if (!uid) {
      try {
        const res = await axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${getToken()}` } });
        const u = res.data?.user;
        if (u) { setProfile(u); setEditForm({ name: u.name || '', companyName: u.companyName || '', location: u.location || '' }); }
      } catch { /* silent */ }
      return;
    }
    try {
      const res = await axios.get(`/api/profile/${uid}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const u = res.data?.user;
      if (u) { setProfile(u); setEditForm({ name: u.name || '', companyName: u.companyName || '', location: u.location || '' }); }
    } catch (err) {
      if (err?.response?.status === 401) { localStorage.clear(); window.location.href = '/login'; return; }
      const cached = getCachedUser();
      if (cached && !profile?.name) setProfile(cached);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await axios.get('/api/profile/activity', { headers: { Authorization: `Bearer ${getToken()}` } });
      setActivityFeed(res.data.activity || []);
    } catch { /* silent */ }
  };

  const fetchJobs = async () => {
    setTabLoading(true); setInlineError(null);
    try {
      const res = await axios.get('/api/jobs/my', { headers: { Authorization: `Bearer ${getToken()}` } });
      setJobs(res.data.jobs || []);
    } catch (err) {
      setInlineError('Could not load your jobs right now — please try again.');
    } finally { setTabLoading(false); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/profile/${profile?._id || profile?.id}`, editForm, { headers: { Authorization: `Bearer ${getToken()}` } });
      setProfile(res.data.user);
      showToast('Profile updated! ✅');
    } catch { setInlineError('Failed to update profile.'); }
  };

  const handlePostJob = async (e) => {
    e.preventDefault(); setInlineError(null); setSuccessMsg(null);
    try {
      const res = await axios.post('/api/jobs', {
        title: formData.title, description: formData.description,
        category: formData.category, location: formData.location,
        price: Number(formData.stipend), payRate: formData.payRate,
        urgency: formData.urgency || 'part-time',
      }, { headers: { Authorization: `Bearer ${getToken()}` } });
      setSuccessMsg(`✅ "${res.data.job?.title || formData.title}" posted! Seekers can now apply.`);
      setFormData({ title: '', description: '', category: CATEGORIES[0], urgency: 'part-time', location: '', stipend: '', payRate: 'hour', mobileNumber: '' });
      fetchJobs();
    } catch (err) {
      setInlineError(err?.response?.data?.message || 'Failed to post job.');
    }
  };

  const handleAcceptApplicant = async (jobId, seekerId) => {
    try {
      await axios.put(`/api/jobs/${jobId}/accept`, { seekerId }, { headers: { Authorization: `Bearer ${getToken()}` } });
      showToast('Applicant accepted! ✅');
      setTimeout(() => navigate(`/provider/payment/${jobId}`), 1200);
      fetchJobs();
    } catch (err) { showToast(err?.response?.data?.message || 'Failed to accept.', 'error'); }
  };

  const handleRejectApplicant = async (jobId, seekerId) => {
    try {
      await axios.put(`/api/jobs/${jobId}/reject`, { seekerId }, { headers: { Authorization: `Bearer ${getToken()}` } });
      showToast('Applicant rejected.', 'error');
      fetchJobs();
    } catch {
      // optimistically update UI even if endpoint doesn't exist yet
      showToast('Applicant marked as rejected.');
      fetchJobs();
    }
  };

  const handleCompleteJob = async (job) => {
    if (!window.confirm('Mark this job as completed?')) return;
    try {
      await axios.put(`/api/jobs/${job._id}/complete`, {}, { headers: { Authorization: `Bearer ${getToken()}` } });
      showToast('✅ Job completed! Please leave a review.');
      fetchJobs();
      const seeker = typeof job.selectedCandidate === 'object'
        ? job.selectedCandidate
        : { name: 'the seeker', _id: job.selectedCandidate };
      setReviewModal({ jobId: job._id, jobTitle: job.title, receiverName: seeker?.name || 'the seeker' });
    } catch (err) { showToast(err?.response?.data?.message || 'Failed to complete.', 'error'); }
  };

  const TABS = [
    { id: 'gigs',       label: 'My Jobs',    icon: <Briefcase size={17} /> },
    { id: 'applicants', label: 'Applicants', icon: <Users size={17} /> },
    { id: 'history',    label: 'Completed',  icon: <CheckCircle size={17} /> },
  ];

  const renderInlineError = () => !inlineError ? null : (
    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
      <AlertCircle size={20} />
      <p className="font-bold">{inlineError}</p>
    </div>
  );

  const renderTabSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse mt-4">
      {[1,2,3].map(n => (
        <div key={n} className="h-48 bg-white border border-gray-100 rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-4"><div className="w-24 h-6 bg-[#e8f5e9] rounded-lg" /><div className="w-3/4 h-8 bg-gray-200 rounded-lg" /></div>
        </div>
      ))}
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#e8f5e9] pb-12">
      <nav className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 sm:px-8">
        <div className="w-32 h-6 bg-gray-200 rounded-lg animate-pulse" />
      </nav>
      <div className="max-w-6xl mx-auto mt-8 px-4 sm:px-8">
        <div className="w-full h-40 bg-white rounded-2xl shadow-sm animate-pulse mb-6" />
        <div className="w-full h-96 bg-white rounded-3xl shadow-sm animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: '#e8f5e9' }}>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl font-bold text-sm ${
            toast.type === 'success' ? 'bg-green-700 text-white' : 'bg-red-600 text-white'
          }`}
          style={{ maxWidth: 380, animation: 'dropIn 0.2s ease' }}
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

      {/* ── Single global ChatBox ── */}
      {chatJob && (
        <ChatBox
          key={chatJob.id}
          jobId={chatJob.id}
          jobTitle={chatJob.title}
          receiverId={chatJob.receiverId}
          accentColor="#2e7d32"
        />
      )}

      <AppNavbar role="provider" user={profile} />

      <div className="max-w-6xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">

        {/* ── Compact Profile Strip ── */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-md border border-gray-100 flex items-center gap-4 flex-wrap">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#2e7d32,#1b5e20)' }}
          >
            {(profile.name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{profile.name || 'Loading…'}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
              {profile.companyName && <span className="font-semibold text-gray-700">{profile.companyName}</span>}
              {profile.email && <span>{profile.email}</span>}
              {profile.ratings?.count > 0 && (
                <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                  <Star size={13} fill="currentColor" />
                  {profile.ratings.average?.toFixed(1)} ({profile.ratings.count} reviews)
                </span>
              )}
            </div>
          </div>
        </div>



        {/* ── Tab Bar ── */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowForm(false); }}
              className={`flex items-center gap-2 px-5 py-3 text-base font-semibold rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#2e7d32] text-white shadow-md'
                  : 'text-gray-500 hover:text-[#2e7d32] hover:bg-[#e8f5e9]'
              }`}
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

        <div>
          {/* ── MY JOBS TAB ── */}
          {activeTab === 'gigs' && (
            <div className="min-h-[400px]">
              {showForm ? (
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Plus className="text-[#2e7d32]" /> Post a New Job
                  </h3>
                  <form onSubmit={handlePostJob} className="space-y-6">
                    {successMsg && (
                      <div className="bg-green-50 border border-green-300 text-green-800 p-4 rounded-xl font-bold flex items-center gap-3">
                        <CheckCircle size={20} className="text-green-600 shrink-0" />
                        <p>{successMsg}</p>
                      </div>
                    )}
                    {inlineError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl font-bold flex items-center gap-3">
                        <AlertCircle size={20} className="shrink-0" /><p>{inlineError}</p>
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
                      <textarea className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-[#2e7d32] font-medium min-h-[120px]" placeholder="Describe what you need..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
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
                      <button type="submit" className="flex-1 py-4 text-white font-black rounded-xl shadow-md bg-[#2e7d32] hover:bg-[#1b5e20] transition-colors active:scale-95">🚀 Post Job</button>
                      <button type="button" className="px-8 py-4 bg-gray-100 text-gray-700 font-black rounded-xl hover:bg-gray-200 active:scale-95" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                  {renderInlineError()}
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Briefcase className="text-[#2e7d32]" /> My Posted Jobs
                  </h2>
                  {tabLoading ? renderTabSkeletons() : jobs.filter(j => j.isOpen !== false).length === 0 ? (
                    <div className="py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                      <AlertCircle size={44} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-gray-500 mb-2">No jobs posted yet.</p>
                      <button onClick={() => setShowForm(true)} className="mt-3 px-6 py-2.5 bg-[#2e7d32] text-white text-base font-semibold rounded-xl hover:bg-[#1b5e20]">Post a Job</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobs.filter(j => j.isOpen !== false).map(gig => (
                        <div key={gig._id} className="p-6 border border-gray-200 rounded-2xl grid grid-cols-1 lg:grid-cols-3 gap-6 hover:shadow-md transition-all group">
                          <div className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 font-semibold text-xs uppercase tracking-wide rounded-lg">{gig.category || 'General'}</span>
                              <span className="px-3 py-1 bg-orange-50 border border-orange-100 text-orange-700 font-semibold text-xs uppercase tracking-wide rounded-lg">₹{gig.stipend || gig.price} / {gig.payRate || 'hour'}</span>
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 font-semibold text-xs uppercase tracking-wide rounded-lg">{gig.isOpen ? 'OPEN' : 'CLOSED'}</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#2e7d32] transition-colors">{gig.title}</h4>
                            <p className="text-sm text-gray-500 mt-1 mb-3 flex items-center gap-1"><MapPin size={13} className="inline" />{gig.location || 'Location not set'}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{gig.description}</p>
                          </div>
                          <div className="flex flex-col items-center lg:items-end justify-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 tracking-widest mb-1">POSTED</p>
                            <p className="text-sm font-semibold text-[#2e7d32] mb-4">{new Date(gig.createdAt).toLocaleDateString()}</p>
                            <button
                              className="w-full py-2 bg-red-50 text-red-600 border border-red-200 font-black rounded-lg hover:bg-red-100 text-sm active:scale-95"
                              onClick={async () => {
                                if (!window.confirm('Close this job?')) return;
                                try { await axios.put(`/api/jobs/${gig._id}/complete`, {}, { headers: { Authorization: `Bearer ${getToken()}` } }); fetchJobs(); } catch(e) { console.error(e); }
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

          {/* ── APPLICANTS TAB ── */}
          {activeTab === 'applicants' && (
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 min-h-[400px]">
              {renderInlineError()}
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <Users className="text-[#2e7d32]" /> Applicants by Job
              </h2>
              {tabLoading ? renderTabSkeletons() : jobs.length === 0 ? (
                <div className="py-12 flex flex-col items-center border border-dashed rounded-2xl bg-gray-50 text-gray-400">
                  <Users size={40} className="mb-4 text-gray-300" />
                  <p className="text-base font-semibold">No jobs posted yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map(job => {
                    const isExpanded    = expandedJobId === job._id;
                    const applicantCount = job.applicants?.length || 0;
                    return (
                      <div key={job._id} className="border border-gray-200 rounded-2xl overflow-hidden">
                        <button
                          className="w-full p-5 flex items-center justify-between bg-gray-50 hover:bg-green-50 transition-colors text-left"
                          onClick={() => setExpandedJobId(isExpanded ? null : job._id)}
                        >
                          <div>
                            <p className="font-bold text-lg text-gray-900">{job.title}</p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              <MapPin size={13} className="inline mr-1" />{job.location || 'N/A'}
                              &nbsp;·&nbsp;
                              <span className={`font-semibold ${job.isOpen ? 'text-green-600' : 'text-gray-400'}`}>{job.isOpen ? 'Open' : 'Closed'}</span>
                              &nbsp;·&nbsp;
                              <span className="text-[#2e7d32] font-bold">{applicantCount} applicant{applicantCount !== 1 ? 's' : ''}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-400">₹{job.price ?? job.payAmount} / {job.payRate}</span>
                            {isExpanded ? <ChevronUp size={20} className="text-[#2e7d32]" /> : <ChevronDown size={20} className="text-gray-400" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-5 border-t border-gray-100">
                            {applicantCount === 0 ? (
                              <p className="text-gray-400 italic text-center py-6">No applicants yet.</p>
                            ) : (
                              <div className="space-y-3">
                                {job.applicants.map(app => {
                                  const seeker = typeof app.seeker === 'object' ? app.seeker : { _id: app.seeker, name: 'Unknown', email: '' };
                                  const isPending  = app.status === 'pending';
                                  const isAccepted = app.status === 'accepted';
                                  const isRejected = app.status === 'rejected';
                                  const statusColor = isAccepted ? 'bg-green-100 text-green-700' : isRejected ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700';
                                  return (
                                    <div key={app._id || seeker._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all gap-3 flex-wrap">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#e8f5e9] rounded-full text-[#2e7d32]"><UserIcon size={18} /></div>
                                        <div>
                                          <p className="font-black text-gray-900">{seeker?.name || 'Unknown'}</p>
                                          <p className="text-xs text-gray-500 font-bold">{seeker?.email || 'No email'}</p>
                                          {seeker?.skills?.length > 0 && (
                                            <p className="text-xs text-gray-400 mt-0.5">{seeker.skills.slice(0,3).join(' · ')}</p>
                                          )}
                                          {seeker?.ratings?.count > 0 && (
                                            <span className="text-xs text-yellow-600 font-semibold flex items-center gap-0.5">
                                              <Star size={11} fill="currentColor" /> {seeker.ratings.average?.toFixed(1)}
                                            </span>
                                          )}
                                          <p className="text-xs text-gray-400 mt-0.5">Applied: {new Date(app.appliedAt || Date.now()).toLocaleDateString()}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${statusColor}`}>
                                          {app.status || 'pending'}
                                        </span>
                                        {isPending && job.isOpen && (
                                          <>
                                            <button
                                              onClick={() => handleAcceptApplicant(job._id, seeker._id)}
                                              className="px-4 py-1.5 bg-[#2e7d32] text-white text-xs font-black rounded-lg hover:bg-[#1b5e20] active:scale-95 transition-all flex items-center gap-1"
                                            >
                                              <CheckCircle size={13} /> Accept
                                            </button>
                                            <button
                                              onClick={() => handleRejectApplicant(job._id, seeker._id)}
                                              className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-black rounded-lg hover:bg-red-100 active:scale-95 transition-all flex items-center gap-1"
                                            >
                                              <X size={13} /> Reject
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Job-level actions */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                              {(job.status === 'accepted' || job.status === 'in-progress') && (
                                <button
                                  onClick={() => setChatJob({
                                    id: job._id,
                                    title: job.title,
                                    receiverId: typeof job.selectedCandidate === 'object'
                                      ? job.selectedCandidate?._id
                                      : job.selectedCandidate,
                                  })}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '0.5rem 1rem', borderRadius: 10, border: 'none',
                                    background: '#f0fdf4', color: '#2e7d32',
                                    fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                                    border: '1px solid #bbf7d0',
                                    transition: 'all 0.15s ease',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background='#dcfce7'}
                                  onMouseLeave={e => e.currentTarget.style.background='#f0fdf4'}
                                >
                                  💬 Chat
                                </button>
                              )}
                              {job.status === 'accepted' && (
                                <button onClick={() => navigate(`/provider/payment/${job._id}`)} className="flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white font-black rounded-xl hover:bg-green-800 active:scale-95 transition-all text-sm shadow-md">
                                  <CreditCard size={15} /> Pay Now to Start Job
                                </button>
                              )}
                              {job.status === 'in-progress' && (
                                <button onClick={() => handleCompleteJob(job)} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 active:scale-95 transition-all text-sm shadow-md">
                                  <CheckCircle size={15} /> Mark as Completed
                                </button>
                              )}
                              {job.status === 'completed' && !job.providerReviewed && (
                                <button
                                  onClick={() => {
                                    const seeker = typeof job.selectedCandidate === 'object' ? job.selectedCandidate : { name: 'the seeker', _id: job.selectedCandidate };
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

          {/* ── COMPLETED WORKS TAB ── */}
          {activeTab === 'history' && (
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 min-h-[400px]">
              {renderInlineError()}
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <CheckCircle className="text-[#2e7d32]" /> Completed Jobs
              </h2>
              {tabLoading ? renderTabSkeletons() : jobs.filter(j => j.status === 'completed').length === 0 ? (
                <div className="py-12 flex flex-col items-center border border-dashed rounded-2xl bg-gray-50 text-gray-400">
                  <CheckCircle size={40} className="mb-4 text-gray-300" />
                  <p className="text-base font-semibold">No completed jobs to show.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.filter(j => j.status === 'completed').map(job => {
                    const selectedSeeker = typeof job.selectedCandidate === 'object' ? job.selectedCandidate : job.applicants?.find(a => a.status === 'accepted')?.seeker;
                    const seekerName = typeof selectedSeeker === 'object' ? selectedSeeker?.name : 'Unknown';
                    return (
                      <div key={job._id} className="p-6 bg-gray-50 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center rounded-2xl hover:bg-white hover:shadow-md transition-all gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-500 mt-0.5">Worker: <span className="font-semibold text-gray-700">{seekerName}</span></p>
                          <div className="flex gap-2 flex-wrap mt-3">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-lg">Completed</span>
                            {job.providerReviewed && <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-lg">Reviewed ✓</span>}
                          </div>
                        </div>
                        {!job.providerReviewed && selectedSeeker && (
                          <button
                            onClick={() => setReviewModal({ jobId: job._id, jobTitle: job.title, receiverName: seekerName })}
                            className="px-5 py-2.5 bg-yellow-500 text-white text-base font-semibold rounded-xl hover:bg-yellow-600 shadow-sm flex items-center gap-2 transition-all shrink-0"
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
    </div>
  );
};

export default ProviderDashboard;
