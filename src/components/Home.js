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
   const handleGems = () => {
  console.log('Gems clicked');
  navigate('/credits');
};
  const handleRituals = () => console.log('Rituals clicked');  
  const handleRefer = () => {
  console.log('Refer clicked');
  navigate('/refer');
};

  const chatContainerStyle = {
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url(/uploads/chat.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="home-container" style={chatContainerStyle}>
      {/* Hero Section */}
      <div className="home-hero">
        <div className="hero-content">
          
          <h1> <span 
    className="logo-icon"
    style={{
      backgroundImage: 'url(/uploads/logo.png)',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      width: '40px',
      height: '40px',
      display: 'inline-block'
    }}
  ></span>Welcome {user?.full_name ? user.full_name.split(' ')[0] : ''}</h1>
          <p>Unlock the secrets of the universe with personalized Vedic wisdom</p>
        </div>
      </div>

      {/* Call to Action 
      <div className="services-grid">
        <button className="service-card cta-button" onClick={handleChat}
        style={{minHeight: '7rem'}}>
          <div className="service-icon">💬</div>
          <div className="service-content">
            <div className="service-title">Chat With Astrologer</div>
            <div className="service-desc">Ask your astrology questions now</div>
          </div>
        </button>
      </div>

      {/* Feature Cards 
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

      {/* Additional Services  */}
      <div className="credit-packages-grid"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', marginLeft: 'auto', marginRight: 'auto', gap: '3rem', }}>
        {/* <button className="service-card" onClick={handleHoroscope}>
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
        </button> */}
        <button className="credit-package" onClick={handleChat}
          style={{ minHeight: '15rem' }}>
          <div className="service-icon">💬</div>
          <div className="service-content">
            <div className="credits-label"
              style={{ fontSize: '1rem', fontWeight: 'bold', color: '#FFD700' }}
            >Chat Now!</div>
            <div className="bonus-credits"
              style={{ fontSize: '0.7rem', color: 'white', backgroundColor: '#bab9b942' }}
            >Get Personalized Guidance Now!</div>
          </div>
        </button>

        <button className="credit-package" onClick={handleCallGuru}
          style={{ minHeight: '15rem' }}>
          <div className="service-icon">📞</div>
          <div className="service-content">
            <div className="credits-label"
              style={{ fontSize: '1rem', fontWeight: 'bold', color: '#FFD700' }}
            >Book Appointment</div>
            <div className="bonus-credits"
              style={{ fontSize: '0.7rem', color: 'white', backgroundColor: '#bab9b942' }}
            >Schedule Your Personalized AastroG Guidance</div>
          </div>
        </button>

        {/* <button className="credit-package" onClick={handleMoonTracker}
         style={{minHeight: '15rem'}}>
          <div className="service-icon">🌙</div>
          <div className="service-content">
            <div className="credits-label"
            style={{fontSize: '1rem', fontWeight: 'bold',color: '#FFD700'}}
            >LUNAR GUIDANCE</div>
            <div className="bonus-credits"
            style={{fontSize: '0.7rem', color: 'white', backgroundColor: '#bab9b942'}}
            >Get Personalized Guidance Now!</div>
          </div>
        </button>*/}

      </div>
<div className="footer-actions">
          <button className="action-btn gems-btn" onClick={handleGems}
          style={{fontSize:'1rem',fontWeight: 'bold', gap: '0.3rem' }}>
            <span className='dimond'>💎</span>
            <span>Credits</span>
          </button>

        

          <button className="action-btn refer-btn" onClick={handleRefer}
           style={{fontSize:'1rem',fontWeight: 'bold'}}>
            <span>🎁</span>
            <span>Refer</span>
          </button>
        </div>

    </div>
  );
}

export default Home;
