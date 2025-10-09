import React from 'react';
import { Navigate, useLocation, useNavigate  } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const isChat = location.pathname === '/chat';
  const navigate = useNavigate();
  
 const handleGems = () => {
  console.log('Gems clicked');
  navigate('/credits');
};
  const handleRituals = () => console.log('Rituals clicked');  
  const handleRefer = () => {
  console.log('Refer clicked');
  navigate('/refer');
};


  return (
    <footer className="app-footer">
      {/* Bottom Action Buttons (only show on chat page) */}
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

      {/* Footer Text */}
      <div className="footer-text">
        © 2025 AstroGuru • Powered by AI & Vedic Wisdom • 🌟
      </div>
    </footer>
  );
};

export default Footer;
