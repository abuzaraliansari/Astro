import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';


function Kundli() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [kundliData, setKundliData] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Hide welcome animation after 2 seconds
    const timer = setTimeout(() => setShowWelcome(false), 2000);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  const generateKundli = async () => {
    setIsGenerating(true);
    
    // Simulate API call - replace with actual chatbot integration
    setTimeout(() => {
      setKundliData({
        name: user?.fullname || user?.full_name || 'User',
        birthDate: user?.birthdate || user?.birth_date || 'Not provided',
        birthTime: user?.birthtime || user?.birth_time || 'Not provided',
        birthPlace: user?.birthplace || user?.birth_place || 'Not provided',
        generated: true
      });
      setIsGenerating(false);
    }, 3000);
  };

  const chatWithBot = () => {
    const birthDetails = `${user?.fullname || user?.full_name}, born on ${user?.birthdate || user?.birth_date} at ${user?.birthtime || user?.birth_time} in ${user?.birthplace || user?.birth_place}`;
    
    navigate('/chat', { 
      state: { 
        initialMessage: `Generate my personalized Kundli based on my birth details: ${birthDetails}. Please provide detailed astrological analysis.` 
      }
    });
  };

  if (showWelcome) {
    return (
      <div className="kundli-welcome-screen">
        <div className="cosmic-loader">
          <div className="stars"></div>
          <div className="moon">🌙</div>
          <p className="welcome-text">Loading your cosmic journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kundli-container">
      {/* Animated Background */}
      <div className="cosmic-background">
        <div className="stars-bg"></div>
        <div className="gradient-overlay"></div>
      </div>

      {/* Header Section */}
      <div className="kundli-header">
        <div className="header-icon">✨</div>
        <h1 className="page-title">Your Personal Kundli</h1>
        <p className="page-subtitle">Discover your cosmic blueprint and destiny</p>
      </div>

      {/* User Birth Details Card */}
      <div className="user-info-card">
        <div className="card-header">
          <span className="card-icon">📋</span>
          <h3>Your Birth Details</h3>
        </div>
        <div className="birth-details">
          <div className="detail-item">
            <span className="detail-icon">👤</span>
            <div className="detail-content">
              <span className="detail-label">Name</span>
              <span className="detail-value">{user?.fullname || user?.full_name || 'Not provided'}</span>
            </div>
          </div>
          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <div className="detail-content">
              <span className="detail-label">Birth Date</span>
              <span className="detail-value">{user?.birthdate || user?.birth_date || 'Not provided'}</span>
            </div>
          </div>
          <div className="detail-item">
            <span className="detail-icon">🕐</span>
            <div className="detail-content">
              <span className="detail-label">Birth Time</span>
              <span className="detail-value">{user?.birthtime || user?.birth_time || 'Not provided'}</span>
            </div>
          </div>
          <div className="detail-item">
            <span className="detail-icon">📍</span>
            <div className="detail-content">
              <span className="detail-label">Birth Place</span>
              <span className="detail-value">{user?.birthplace || user?.birth_place || 'Not provided'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generate or Show Kundli */}
      {!kundliData ? (
        <div className="generate-section">
          <div className="generate-card">
            <div className="generate-icon-container">
              <div className="icon-circle">
                <span className="generate-icon">🔮</span>
              </div>
            </div>
            <h2 className="generate-title">Generate Your Kundli</h2>
            <p className="generate-description">
              Get personalized astrological insights based on your birth details. 
              Discover your strengths, challenges, and life path.
            </p>
            
            <div className="generate-buttons">
              <button 
                className="generate-btn primary"
                onClick={generateKundli}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="loading-spinner">⏳</span>
                    <span>Generating Your Kundli...</span>
                  </>
                ) : (
                  <>
                    <span className="btn-icon">✨</span>
                    <span>Generate Kundli</span>
                  </>
                )}
              </button>

              <button 
                className="generate-btn secondary"
                onClick={chatWithBot}
              >
                <span className="btn-icon">💬</span>
                <span>Chat for Detailed Analysis</span>
              </button>
            </div>

            <div className="info-boxes">
              <div className="info-box">
                <span className="info-icon">⭐</span>
                <p>Personalized predictions</p>
              </div>
              <div className="info-box">
                <span className="info-icon">🔯</span>
                <p>Vedic astrology insights</p>
              </div>
              <div className="info-box">
                <span className="info-icon">🌟</span>
                <p>Life guidance</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="kundli-result">
          <div className="result-header">
            <div className="success-icon">✅</div>
            <h2>Your Kundli is Ready!</h2>
            <p>Based on your birth details</p>
          </div>
          
          <div className="kundli-charts">
            <div className="chart-card">
              <div className="chart-header">
                <span className="chart-icon">🔯</span>
                <h3>Birth Chart</h3>
              </div>
              <div className="chart-content">
                <div className="chart-placeholder">
                  <div className="zodiac-wheel">
                    <div className="wheel-center">🌟</div>
                    <div className="wheel-ring"></div>
                  </div>
                </div>
              </div>
              <p className="chart-note">
                Chat with our AI astrologer for detailed chart analysis
              </p>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <span className="chart-icon">🌙</span>
                <h3>Moon Chart</h3>
              </div>
              <div className="chart-content">
                <div className="chart-placeholder">
                  <div className="zodiac-wheel">
                    <div className="wheel-center">🌙</div>
                    <div className="wheel-ring"></div>
                  </div>
                </div>
              </div>
              <p className="chart-note">
                Discover your emotional and mental patterns
              </p>
            </div>
          </div>

          <div className="action-buttons">
            <button className="action-btn primary" onClick={chatWithBot}>
              <span className="btn-icon">💬</span>
              <span>Get Detailed Reading</span>
            </button>
            <button className="action-btn secondary" onClick={() => setKundliData(null)}>
              <span className="btn-icon">🔄</span>
              <span>Generate New</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer Quote */}
      <div className="kundli-footer">
        <p className="cosmic-quote">
          "The stars incline us, they do not bind us" ✨
        </p>
      </div>
    </div>
  );
}

export default Kundli;
