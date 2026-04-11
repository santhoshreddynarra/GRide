import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff, Briefcase, Users } from 'lucide-react';

const AuthPage = ({ role, onBack, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [activeRole, setActiveRole] = useState(role || 'provider');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin 
      ? '/api/login' 
      : '/api/register';
    
    // Normalize role for backend (provider/worker)
    const backendRole = activeRole === 'provider' ? 'provider' : 'worker';
    const payload = { ...formData, role: backendRole };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.user, data.token);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection refused. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #FFD700 0%, #000000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      zIndex: 1000,
      overflowY: 'auto'
    }}>
      
      <div className="fade-in" style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        maxWidth: '450px',
        width: '100%',
        padding: '2.5rem 2rem',
        position: 'relative'
      }}>
        
        <button 
          onClick={onBack} 
          style={{ 
            position: 'absolute', 
            top: '1.5rem', 
            left: '1.5rem', 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#64748b',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'color 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.color = '#0f172a'}
          onMouseOut={e => e.currentTarget.style.color = '#64748b'}
        >
          <ArrowLeft size={18} style={{ marginRight: '4px' }} /> Back
        </button>

        {/* Role Toggle Tabs */}
        <div style={{ 
          display: 'flex', 
          background: '#f1f5f9', 
          borderRadius: '1rem', 
          padding: '0.25rem',
          margin: '3rem 0 2rem 0'
        }}>
          <button
            onClick={() => setActiveRole('provider')}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: activeRole === 'provider' ? '#FFD700' : 'transparent',
              color: activeRole === 'provider' ? '#000000' : '#64748b',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: activeRole === 'provider' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Briefcase size={18} /> Client
          </button>
          <button
            onClick={() => setActiveRole('seeker')}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: activeRole === 'seeker' ? '#FFD700' : 'transparent',
              color: activeRole === 'seeker' ? '#000000' : '#64748b',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: activeRole === 'seeker' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Users size={18} /> Partner
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.2rem', color: '#000000', fontWeight: 800 }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '0.5rem' }}>
            {activeRole === 'provider' ? 'Post jobs and hire experts.' : 'Find gigs and earn instantly.'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="name" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a' }}>
                <User size={16} /> Full Name
              </label>
              <input 
                id="name"
                type="text" 
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
                style={{ background: '#ffffff' }}
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a' }}>
              <Mail size={16} /> Email Address
            </label>
            <input 
              id="email"
              type="email" 
              placeholder="name@company.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
              style={{ background: '#ffffff' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="password" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a' }}>
              <Lock size={16} /> Password
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                id="password"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required 
                style={{ background: '#ffffff', paddingRight: '3rem' }}
              />
              <div 
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
          </div>

          {isLogin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <a href="#" style={{ fontSize: '0.9rem', color: '#000000', textDecoration: 'underline', fontWeight: 600 }}>Forgot Password?</a>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', background: '#FFD700', color: '#000000' }}
          >
            {loading ? 'Processing...' : isLogin ? 'Secure Login' : 'Create Account'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.95rem' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <span 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ color: '#000000', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
