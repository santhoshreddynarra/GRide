import React, { useState } from 'react';
import { Power, MapPin, DollarSign, Clock } from 'lucide-react';

const DriverView = () => {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <div className="view-container">
      <div className="availability card" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: isOnline ? '#0d9488' : '#64748b' }}>
            {isOnline ? 'You are Online' : 'You are Offline'}
          </h2>
          <p>Toggle your status to start receiving ride requests.</p>
        </div>
        <button 
          className="btn" 
          onClick={() => setIsOnline(!isOnline)}
          style={{ 
            backgroundColor: isOnline ? '#ef4444' : '#0d9488',
            color: 'white'
          }}
        >
          <Power size={20} /> {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="card earnings-box">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={20} /> Today's Earnings
          </h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>$142.50</p>
          <p style={{ opacity: 0.8 }}>4 completed gigs</p>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} /> Active Hours
          </h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>6.2h</p>
          <p style={{ color: '#64748b' }}>Shift ends at 8 PM</p>
        </div>
      </div>

      <div className="requests-list">
        <h3 style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>Active Requests</h3>
        {!isOnline ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#f1f5f9', borderRadius: '0.5rem' }}>
            Go online to see ride requests in your area.
          </p>
        ) : (
          <div className="request-item card">
            <div>
              <p style={{ fontWeight: 700 }}>Pickup: Downtown Mall</p>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>3.2 miles away • $15.00 Est. Fare</p>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Accept</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverView;
