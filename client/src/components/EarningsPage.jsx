import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CheckCircle, Clock, Briefcase, Minus } from 'lucide-react';

const EarningsPage = ({ user }) => {
  const [data, setData] = useState({
    financialTotal: 0,
    metrics: { completed: 0, pending: 0 },
    transactions: []
  });
  const [loading, setLoading] = useState(true);

  const isProvider = user.role === 'provider';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('gigride_token');
        const res = await fetch('/api/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="view-container">Loading analytics...</div>;
  }

  return (
    <div className="view-container fade-in" style={{ maxWidth: '900px' }}>
      
      {/* Header Profile Context */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--navy)' }}>Earnings & Analytics</h2>
        <p style={{ color: 'var(--gray)' }}>
          {isProvider ? 'Track your total business expenditures and hiring velocity.' : 'Track your financial progress and gig history.'}
        </p>
      </div>

      {/* Hero Metric Box */}
      <div className="card" style={{ 
        background: isProvider ? 'var(--navy)' : 'var(--teal)', 
        color: 'white', 
        padding: '3rem 2rem', 
        textAlign: 'center', 
        marginBottom: '2rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.2rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
          {isProvider ? 'Total Capital Invested' : 'Total Capital Earned'}
        </h3>
        <div style={{ fontSize: '4.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <DollarSign size={64} style={{ opacity: 0.8 }} />
          {data.financialTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <p style={{ marginTop: '1rem', opacity: 0.8 }}>Includes all {isProvider ? 'paid and active hires' : 'successfully claimed gigs'}.</p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#f8fafc' }}>
          <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '50%' }}>
            <CheckCircle size={32} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--gray)' }}>{isProvider ? 'Hires Completed' : 'Gigs Completed'}</h4>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--navy)' }}>{data.metrics.completed}</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#f8fafc' }}>
          <div style={{ background: '#fef3c7', color: '#b45309', padding: '1rem', borderRadius: '50%' }}>
            <Clock size={32} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--gray)' }}>{isProvider ? 'Pending Approvals' : 'Pending Review'}</h4>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--navy)' }}>{data.metrics.pending}</span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <TrendingUp size={24} /> Recent Transactions
      </h3>
      
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden' }}>
        {data.transactions.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray)' }}>
            No financial history yet.
          </div>
        ) : (
          data.transactions.map((t, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '1.5rem', 
              borderBottom: i === data.transactions.length - 1 ? 'none' : '1px solid #e2e8f0',
              background: i % 2 === 0 ? 'white' : '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: isProvider ? '#fee2e2' : '#e0f2fe', color: isProvider ? '#b91c1c' : '#0369a1', padding: '0.75rem', borderRadius: '0.5rem' }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--navy)' }}>{t.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                    {new Date(t.createdAt).toLocaleDateString()} • {t.category}
                  </p>
                </div>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isProvider ? '#b91c1c' : '#166534', display: 'flex', alignItems: 'center' }}>
                {isProvider ? <Minus size={16} style={{marginRight: '2px'}}/> : '+'} ${t.pay?.amount || 0}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default EarningsPage;
