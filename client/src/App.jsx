import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ProviderDashboard from './components/ProviderDashboard';
import SeekerDashboard from './components/SeekerDashboard';
import './index.css';

function App() {
  const [view, setView] = useState('landing');
  const [role, setRole] = useState(null); // 'provider' or 'seeker'
  const [user, setUser] = useState(null);

  // Check for existing session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('gigride_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setRole(parsedUser.role);
      setView('dashboard');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('gigride_user');
    setUser(null);
    setRole(null);
    setView('landing');
  };

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('gigride_user', JSON.stringify(userData));
    setUser(userData);
    setRole(userData.role);
    setView('dashboard');
  };

  const renderView = () => {
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
    <div className="app-container">
      <Navbar 
        onViewChange={(v) => {
          if (v === 'landing') handleLogout();
        }} 
        user={user}
      />
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
