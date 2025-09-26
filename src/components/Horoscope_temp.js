import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function Horoscope() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  const periods = [
    { id: 'daily', label: 'Daily', icon: '📅' },
    { id: 'weekly', label: 'Weekly', icon: '📊' },
    { id: 'monthly', label: 'Monthly', icon: '🗓️' },
    { id: 'yearly', label: 'Yearly', icon: '📈' }
  ];

  const getHoroscope = (period) => {
    setIsLoading(true);
    setSelectedPeriod(period);
    
    const message = `Generate my ${period} horoscope based on my birth details: ${user?.full_name}, born on ${user?.birth_date} at ${user?.birth_time} in ${user?.birth_place}. Please provide detailed astrological predictions for ${period} period.`;
    
    navigate('/chat', { 
      state: { initialMessage: message }
    });
  };

  return (
    <div className="horoscope-container">
      <div className="horoscope-header">
        <h1 className="page-title">📊 Your Horoscope</h1>
        <p className="page-subtitle">Personalized astrological predictions</p>
      </div>

      <div className="user-welcome">
        <div className="welcome-card">
          <h3>🙏 Namaste, {user?.full_name}</h3>
          <p>Get your personalized horoscope based on your birth details</p>
        </div>
      </div>

      <div className="period-selection">
        <h3>⏰ Choose Your Prediction Period</h3>
        <div className="periods-grid">
          {periods.map((period) => (
            <button
              key={period.id}
              className={`period-card ${selectedPeriod === period.id ? 'active' : ''}`}
              onClick={() => getHoroscope(period.id)}
              disabled={isLoading}
            >
              <div className="period-icon">{period.icon}</div>
              <div className="period-label">{period.label}</div>
              <div className="period-desc">
                {period.id === 'daily' && 'Today\'s insights'}
                {period.id === 'weekly' && 'This week\'s guidance'}
                {period.id === 'monthly' && 'Monthly overview'}
                {period.id === 'yearly' && 'Annual predictions'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="horoscope-features">
        <h3>🌟 Your Horoscope Includes</h3>
        <div className="features-list">
          <div className="feature-row">
            <span className="feature-icon">💰</span>
            <div className="feature-content">
              <div className="feature-title">Finance & Career</div>
              <div className="feature-desc">Money matters and professional growth</div>
            </div>
          </div>
          <div className="feature-row">
            <span className="feature-icon">❤️</span>
            <div className="feature-content">
              <div className="feature-title">Love & Relationships</div>
              <div className="feature-desc">Romance, marriage and family insights</div>
            </div>
          </div>
          <div className="feature-row">
            <span className="feature-icon">🏥</span>
            <div className="feature-content">
              <div className="feature-title">Health & Wellness</div>
              <div className="feature-desc">Physical and mental well-being</div>
            </div>
          </div>
          <div className="feature-row">
            <span className="feature-icon">🔮</span>
            <div className="feature-content">
              <div className="feature-title">Lucky Numbers & Colors</div>
              <div className="feature-desc">Favorable elements for success</div>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-chat">
        <button 
          className="chat-btn"
          onClick={() => navigate('/chat')}
        >
          💬 Chat with Guru ji for Detailed Reading
        </button>
      </div>
    </div>
  );
}

export default Horoscope;
