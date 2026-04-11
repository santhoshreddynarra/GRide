import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ProviderDashboard from './components/ProviderDashboard';
import SeekerDashboard from './components/SeekerDashboard';
import ProfilePage from './components/ProfilePage';
import GigsPage from './components/GigsPage';
import EarningsPage from './components/EarningsPage';
import './index.css';

function App() {
  const [view, setView] = useState('landing');
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [isLargeText, setIsLargeText] = useState(false);

  // Check for existing session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('gigride_user');
    const token = localStorage.getItem('gigride_token');
    
    if (savedUser && token) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setRole(parsedUser.role);
      setView('dashboard');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('gigride_user');
    localStorage.removeItem('gigride_token');
    setUser(null);
    setRole(null);
    setView('landing');
  };

  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem('gigride_user', JSON.stringify(userData));
    localStorage.setItem('gigride_token', token);
    setUser(userData);
    setRole(userData.role);
    setView('dashboard');
  };

  const handleUpdateSession = (userData) => {
    // Keeps token intact but updates local user memory
    const token = localStorage.getItem('gigride_token');
    localStorage.setItem('gigride_user', JSON.stringify(userData));
    setUser(userData);
  };

  const renderView = () => {
    if (view === 'earnings' && user) {
      return <EarningsPage user={user} />;
    }

    if (view === 'profile' && user) {
      return <ProfilePage user={user} onUpdateSession={handleUpdateSession} />;
    }

    if (view === 'gigs' && user) {
      return <GigsPage user={user} />;
    }

    if (view === 'dashboard' && user) {
      return role === 'provider' 
        ? <ProviderDashboard user={user} /> 
        : <SeekerDashboard user={user} />;
    }

    switch(view) {
      case 'auth':
        return (
          <AuthPage 
            role={role} 
            onBack={() => setView('landing')} 
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'landing':
      default:
        return (
          <LandingPage 
            onSelectProvider={() => { setRole('provider'); setView('auth'); }} 
            onSelectSeeker={() => { setRole('seeker'); setView('auth'); }} 
          />
        );
    }
  };

  return (
    <div className={`app-container ${isLargeText ? 'large-text' : ''}`}>
      <Navbar 
        onViewChange={(v) => { if (v === 'landing') handleLogout(); }} 
        user={user}
      />
      
      {/* Accessibility Control - Floating A+ Circle */}
      <button 
        className="floating-acc-btn" 
        onClick={() => setIsLargeText(!isLargeText)}
        aria-label="Toggle large text mode"
      >
        A+
      </button>

      {renderView()}
      
      <footer style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#64748b', 
        marginTop: 'auto',
        fontSize: '0.9rem',
        borderTop: '1px solid #e2e8f0'
      }}>
        © 2024 GigRide. All rights reserved. • Privacy Policy • Terms of Service
      </footer>
    </div>
  );
}

export default App;
