import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="app-footer">
      <div className="footer-left">
        <button className="footer-link" onClick={() => navigate('/terms')}>
          Terms
        </button>
      </div>

      <div className="footer-center">
        <span>© 2025 AastroG Your personal  Astro Guru </span>
      </div>

      <div className="footer-right footer-social">
        <a href="mailto:aastrogai@gmail.com" className="social-icon" title="Email">
          <i className="fa-solid fa-envelope"></i>
        </a>
        <a href="tel:+919711413917" className="social-icon" title="Call Us">
          <i className="fa-solid fa-phone"></i>
        </a>
        <a href="https://wa.me/919711413917" target="_blank" rel="noopener noreferrer" className="social-icon" title="WhatsApp">
          <i className="fa-brands fa-whatsapp"></i>
        </a>
        <a href="https://facebook.com/aastrog" target="_blank" rel="noopener noreferrer" className="social-icon" title="Facebook">
          <i className="fa-brands fa-facebook"></i>
        </a>
        <a href="https://instagram.com/aastrog" target="_blank" rel="noopener noreferrer" className="social-icon" title="Instagram">
          <i className="fa-brands fa-instagram"></i>
        </a>
        <a href="https://x.com/aastrog" target="_blank" rel="noopener noreferrer" className="social-icon" title="Twitter">
          <i className="fa-brands fa-x-twitter"></i>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
