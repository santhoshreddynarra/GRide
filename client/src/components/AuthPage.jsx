import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';

const AuthPage = ({ role, onBack, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: role // 'provider' or 'seeker'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin 
      ? 'http://127.0.0.1:5000/api/login' 
      : 'http://127.0.0.1:5000/api/register';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        mode: 'cors', // Ensure CORS is handled
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.user);
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
    <div className="view-container" style={{ maxWidth: '450px' }}>
      <button className="btn" onClick={onBack} style={{ marginBottom: '1rem', padding: '0.5rem', background: 'transparent', color: 'var(--gray)' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--navy)' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: 'var(--gray)' }}>
          {role === 'provider' ? 'Job Provider' : 'Job Seeker'} Portal
        </p>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="name"><User size={16} /> Full Name</label>
            <input 
              id="name"
              type="text" 
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email"><Mail size={16} /> Email Address</label>
          <input 
            id="email"
            type="email" 
            placeholder="name@company.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="password"><Lock size={16} /> Password</label>
          <input 
            id="password"
            type="password" 
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required 
          />
        </div>

        {isLogin && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <a href="#" style={{ fontSize: '0.9rem', color: 'var(--teal)', textDecoration: 'none' }}>Forgot Password?</a>
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
        >
          {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'} <ArrowRight size={18} />
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--gray)', fontSize: '0.95rem' }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
        <span 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ color: 'var(--teal)', fontWeight: 600, cursor: 'pointer' }}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </span>
      </div>
    </div>
  );
};

export default AuthPage;
