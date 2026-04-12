import { Briefcase, Building2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-gray-900" />
            <span className="text-xl font-bold">JobPortal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all duration-300 hover:shadow-lg"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight max-w-4xl mx-auto">
            Find your dream job
            <span className="block text-gray-400 mt-2">or hire the perfect talent</span>
          </h1>

          <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
            Connect with thousands of job seekers and employers. Your next career move or hire is just a click away.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
            <Link
              to="/register"
              className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="border-2 border-gray-200 text-gray-900 px-8 py-4 rounded-full font-medium hover:border-gray-900 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="px-8 pb-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/register"
            className="group p-8 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">I'm a Job Seeker</h2>
            <p className="text-gray-600 mb-4">
              Find opportunities, apply to jobs, and grow your career.
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              Start searching
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/register"
            className="group p-8 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-green-500 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">I'm an Employer</h2>
            <p className="text-gray-600 mb-4">
              Post jobs, review applications, and hire the best talent.
            </p>
            <div className="flex items-center text-green-600 font-medium">
              Start hiring
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="px-8 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
      </section>
    </div>
  );
}