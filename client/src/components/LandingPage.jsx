import React, { useState, useEffect } from 'react';
import { Briefcase, Users, ArrowRight, Bike, Search, MapPin, Filter, Menu, X, Facebook, Twitter, Linkedin, Github } from 'lucide-react';

const LandingPage = ({ onSelectClient, onSelectWorker, user }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const userRole = user?.role;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Bike className="w-8 h-8 text-blue-400 mr-2" />
              <span className="text-2xl font-bold text-white">JobPortal</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-white hover:text-blue-400 transition-colors font-medium">Home</a>
              <a href="#" className="text-white hover:text-blue-400 transition-colors font-medium">Jobs</a>
              <a href="#" className="text-white hover:text-blue-400 transition-colors font-medium">Post a Job</a>
              <a href="#" className="text-white hover:text-blue-400 transition-colors font-medium">About</a>
              <a href="#" className="text-white hover:text-blue-400 transition-colors font-medium">Contact</a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {!user ? (
                <>
                  <button
                    onClick={onSelectWorker}
                    className="text-white hover:text-blue-400 transition-colors font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={onSelectWorker}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Signup
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-gray-300">
                    {userRole === 'seeker' ? 'Job Seeker' : 'Job Provider'}
                  </span>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4">
              <nav className="flex flex-col gap-4">
                <a href="#" className="text-white hover:text-blue-400 transition-colors font-medium">Home</a>
                <a href="#" className="text-white hover:text-blue-400 transition-colors font-medium">Jobs</a>
                <a href="#" className="text-white hover:text-blue-400 transition-colors font-medium">Post a Job</a>
                <a href="#" className="text-white hover:text-blue-400 transition-colors font-medium">About</a>
                <a href="#" className="text-white hover:text-blue-400 transition-colors font-medium">Contact</a>
                {!user ? (
                  <>
                    <button onClick={onSelectWorker} className="text-white hover:text-blue-400 transition-colors font-medium text-left">Login</button>
                    <button onClick={onSelectWorker} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 text-left">Signup</button>
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="text-gray-300">{userRole === 'seeker' ? 'Job Seeker' : 'Job Provider'}</span>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 pt-12 lg:pt-20 pb-20">
        <div className="max-w-7xl mx-auto">
          {!user ? (
            /* Non-logged-in Hero */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left - Job Seeker */}
              <div
                className={`transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-3xl p-8 lg:p-12">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mr-4">
                      <Users className="w-7 h-7 text-blue-400" />
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white">Find Your Dream Job</h2>
                  </div>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    Discover thousands of opportunities from top companies. Your next career move is just a click away.
                  </p>
                  
                  {/* Search Bar */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Job title, keywords, or company"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-gray-500 outline-none transition-all duration-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-gray-500 outline-none transition-all duration-300"
                        />
                      </div>
                      <div className="relative">
                        <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={jobType}
                          onChange={(e) => setJobType(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white outline-none transition-all duration-300 appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-gray-800">Job Type</option>
                          <option value="full-time" className="bg-gray-800">Full-time</option>
                          <option value="part-time" className="bg-gray-800">Part-time</option>
                          <option value="contract" className="bg-gray-800">Contract</option>
                          <option value="internship" className="bg-gray-800">Internship</option>
                        </select>
                      </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                      <Search className="w-5 h-5 mr-2" />
                      Search Jobs
                    </button>
                  </div>
                </div>
              </div>

              {/* Right - Job Provider */}
              <div
                className={`transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-3xl p-8 lg:p-12">
                  <div className="flex items-center mb-6">
                    <div className="bg-green-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mr-4">
                      <Briefcase className="w-7 h-7 text-green-400" />
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white">Hire the Best Talent</h2>
                  </div>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    Connect with skilled professionals ready to join your team. Post jobs and find the perfect match.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/5 rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">10K+</div>
                        <div className="text-sm text-gray-400">Active Candidates</div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">5K+</div>
                        <div className="text-sm text-gray-400">Companies</div>
                      </div>
                    </div>
                    <button
                      onClick={onSelectClient}
                      className="w-full bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                    >
                      <Briefcase className="w-5 h-5 mr-2" />
                      Post a Job
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Logged-in Dynamic Content */
            <div className="transition-all duration-1000">
              {userRole === 'seeker' ? (
                /* Job Seeker Dashboard */
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                    Welcome back, {user.name}! 👋
                  </h1>
                  <p className="text-xl text-gray-400 mb-12">
                    Here are your recommended jobs and trending companies
                  </p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recommended Jobs */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-2xl font-bold text-white mb-4">Recommended Jobs</h3>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-blue-400/30 transition-all duration-300 hover:transform hover:-translate-x-2 cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-2">Senior Software Engineer</h4>
                              <p className="text-gray-400 mb-2">TechCorp Inc.</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> San Francisco</span>
                                <span>Full-time</span>
                                <span>$120k - $180k</span>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-blue-400 mt-2" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Trending Companies */}
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-4">Trending Companies</h3>
                      <div className="space-y-4">
                        {['Google', 'Microsoft', 'Amazon'].map((company, i) => (
                          <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:border-blue-400/30 transition-all duration-300 cursor-pointer">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                                <Briefcase className="w-6 h-6 text-blue-400" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{company}</h4>
                                <p className="text-sm text-gray-400">{50 + i * 20} open positions</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Job Provider Dashboard */
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                    Welcome back, {user.name}! 👋
                  </h1>
                  <p className="text-xl text-gray-400 mb-12">
                    Here's your job posting stats and applicants overview
                  </p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Job Posting Stats */}
                    <div className="lg:col-span-2">
                      <h3 className="text-2xl font-bold text-white mb-4">Job Posting Stats</h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6">
                          <div className="text-3xl font-bold text-green-400 mb-2">12</div>
                          <div className="text-sm text-gray-400">Active Jobs</div>
                        </div>
                        <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6">
                          <div className="text-3xl font-bold text-blue-400 mb-2">48</div>
                          <div className="text-sm text-gray-400">Total Applicants</div>
                        </div>
                        <div className="bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                          <div className="text-3xl font-bold text-purple-400 mb-2">8</div>
                          <div className="text-sm text-gray-400">Hired</div>
                        </div>
                        <div className="bg-orange-500/10 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-6">
                          <div className="text-3xl font-bold text-orange-400 mb-2">15</div>
                          <div className="text-sm text-gray-400">Interviews</div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Applicants */}
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-4">Recent Applicants</h3>
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:border-green-400/30 transition-all duration-300 cursor-pointer">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                                <Users className="w-5 h-5 text-green-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-white text-sm">John Doe</h4>
                                <p className="text-xs text-gray-400">Software Engineer</p>
                              </div>
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <Bike className="w-6 h-6 text-blue-400 mr-2" />
                <span className="text-lg font-bold text-white">JobPortal</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting talent with opportunities. Find your dream job or hire the best talent.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Browse Jobs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Career Advice</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Resume Builder</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Post a Job</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Browse Candidates</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Pricing</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © 2024 JobPortal. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
