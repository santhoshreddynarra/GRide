import React from 'react';
import { Briefcase, Search } from 'lucide-react';

const LandingPage = ({ onSelectProvider, onSelectSeeker }) => {
  return (
    <main className="hero">
      <h1>The Future of Gigs.</h1>
      <p>Connect with reliable jobs and workers in seconds. GigRide is your on-demand solution for short-duration work.</p>
      
      <div className="choice-container">
        <button className="btn btn-primary" onClick={onSelectProvider}>
          <Briefcase size={24} /> I'm a Job Provider
        </button>
        <button className="btn btn-secondary" onClick={onSelectSeeker}>
          <Search size={24} /> I'm a Job Seeker
        </button>
      </div>
    </main>
  );
};

export default LandingPage;
