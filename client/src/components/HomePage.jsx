import React from 'react';
import { ArrowRight, Briefcase, Building2 } from 'lucide-react';

export default function HomePage({ onLoginClick, onRegisterClick }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-gray-900" />
            <span className="text-xl font-bold text-gray-900">JobPortal</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onLoginClick}
              className="px-6 py-2.5 text-gray-700 font-medium hover:text-gray-900 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={onRegisterClick}
              className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-all duration-300 hover:shadow-lg"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Find your dream job
              <span className="block text-gray-400">or hire the perfect talent</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Connect with thousands of job seekers and employers. Your next career move or hire is just a click away.
            </p>

            {/* Role Selection Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
              <button
                onClick={onRegisterClick}
                className="group p-8 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 text-left"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">I'm a Job Seeker</h3>
                <p className="text-gray-600 mb-4">Find opportunities, apply to jobs, and grow your career.</p>
                <div className="flex items-center text-blue-600 font-medium">
                  Start searching
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={onRegisterClick}
                className="group p-8 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-green-500 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 text-left"
              >
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">I'm an Employer</h3>
                <p className="text-gray-600 mb-4">Post jobs, review applications, and hire the best talent.</p>
                <div className="flex items-center text-green-600 font-medium">
                  Start hiring
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Quick CTA */}
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <button
                onClick={onRegisterClick}
                className="px-8 py-4 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/20 hover:scale-105"
              >
                Get Started Free
              </button>
              <button
                onClick={onLoginClick}
                className="px-8 py-4 bg-white text-gray-900 font-medium rounded-full border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">10K+</div>
              <div className="text-gray-600">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">5K+</div>
              <div className="text-gray-600">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">50K+</div>
              <div className="text-gray-600">Job Seekers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
