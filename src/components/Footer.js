import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const isChat = location.pathname === '/chat';
  
  const handleGems = () => console.log('Gems clicked');
  const handleRituals = () => console.log('Rituals clicked');  
  const handleRefer = () => console.log('Refer clicked');

  return (
    <footer className="app-footer">
      {/* Bottom Action Buttons (only show on chat page) */}
        <div className="footer-actions">
          <button className="action-btn gems-btn" onClick={handleGems}>
            <span>💎</span>
            <span>Gems</span>
          </button>

          <button className="action-btn rituals-btn" onClick={handleRituals}>
            <span>🔔</span>
            <span>Rituals</span>
          </button>

          <button className="action-btn refer-btn" onClick={handleRefer}>
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
