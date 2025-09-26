import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Navigation handlers - Fixed route paths
  const handleFreeKundli = () => navigate('/kundli');
  const handleBookPooja = () => navigate('/pooja');
  const handleMoonTracker = () => navigate('/moon');
  const handleChat = () => navigate('/chat');
  const handleSubmuhrat = () => navigate('/submuhrat');
  const handleHoroscope = () => navigate('/horoscope');
  const handleCallGuru = () => navigate('/call');

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="home-hero">
        <div className="hero-content">
          <h1>🌟 Welcome {user?.full_name ? user.full_name.split(' ')[0] : ''}</h1>
          <p>Unlock the secrets of the universe with personalized Vedic wisdom</p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="services-grid">
        <button className="service-card" onClick={handleFreeKundli}>
          <div className="service-icon">🔮</div>
          <div className="service-content">
            <div className="service-title">PERSONALIZED KUNDLI</div>
            <div className="service-desc">Your cosmic DNA analysis</div>
          </div>
        </button>
        <button className="service-card" onClick={handleBookPooja}>
          <div className="service-icon">📖</div>
          <div className="service-content">
            <div className="service-title">SACRED POOJA</div>
            <div className="service-desc">Divine blessing rituals</div>
          </div>
        </button>
        <button className="service-card" onClick={handleMoonTracker}>
          <div className="service-icon">🌙</div>
          <div className="service-content">
            <div className="service-title">LUNAR GUIDANCE</div>
            <div className="service-desc">Moon phase insights</div>
          </div>
        </button>
      </div>

      {/* Additional Services */}
      <div className="services-grid">
        <button className="service-card" onClick={handleHoroscope}>
          <div className="service-icon">📊</div>
          <div className="service-content">
            <div className="service-title">Daily Horoscope</div>
            <div className="service-desc">Personalized daily predictions</div>
          </div>
        </button>
        <button className="service-card" onClick={handleSubmuhrat}>
          <div className="service-icon">🕒</div>
          <div className="service-content">
            <div className="service-title">Shubh Muhurat</div>
            <div className="service-desc">Auspicious timing guidance</div>
          </div>
        </button>
        <button className="service-card" onClick={handleCallGuru}>
          <div className="service-icon">📞</div>
          <div className="service-content">
            <div className="service-title">Call Guru</div>
            <div className="service-desc">Direct consultation</div>
          </div>
        </button>
      </div>

      {/* Call to Action */}
      <div className="services-grid">
        <button className="service-card cta-button" onClick={handleChat}>
          <div className="service-icon">💬</div>
          <div className="service-content">
            <div className="service-title">Start Free Consultation</div>
            <div className="service-desc">Ask your astrology questions now</div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default Home;
