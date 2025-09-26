import React from 'react';
import { useNavigate } from 'react-router-dom';

function InsufficientCreditsModal({ isOpen, onClose, requiredCredits, currentCredits }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGetCredits = () => {
    navigate('/credits');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        borderRadius: '20px',
        padding: '30px',
        border: '2px solid rgba(220, 20, 60, 0.5)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%',
        color: 'white',
        position: 'relative'
      }}>
        {/* Warning Icon */}
        <div style={{
          fontSize: '60px',
          marginBottom: '20px',
          animation: 'pulse 2s infinite'
        }}>
          ⚠️
        </div>

        {/* Title */}
        <h2 style={{
          margin: '0 0 15px 0',
          fontSize: '24px',
          color: '#FF6B6B',
          fontWeight: 'bold'
        }}>
          Insufficient Credits!
        </h2>

        {/* Message */}
        <div style={{
          background: 'rgba(220, 20, 60, 0.2)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '25px',
          border: '1px solid rgba(220, 20, 60, 0.5)'
        }}>
          <p style={{
            margin: '0 0 10px 0',
            fontSize: '16px',
            color: '#FFB6C1'
          }}>
            You need <strong>{requiredCredits} credits</strong> for this cosmic consultation.
          </p>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            Your current balance: <strong>{currentCredits} credits</strong>
          </p>
        </div>

        {/* Credit Info */}
        <div style={{
          background: 'rgba(138, 43, 226, 0.3)',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '25px',
          border: '1px solid rgba(138, 43, 226, 0.5)',
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          <div style={{ marginBottom: '5px' }}>
            🔮 First question: <strong>10 credits</strong>
          </div>
          <div>
            💬 Follow-up questions: <strong>5 credits each</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              padding: '12px 20px',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(0px)';
            }}
          >
            <span>👌</span>
            <span>OK</span>
          </button>

          <button
            onClick={handleGetCredits}
            style={{
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              color: '#000',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.6)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.4)';
            }}
          >
            <span>💎</span>
            <span>Get More Points</span>
          </button>
        </div>

        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '15px',
          fontSize: '20px',
          opacity: 0.3,
          animation: 'float 3s ease-in-out infinite'
        }}>✨</div>
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '15px',
          fontSize: '18px',
          opacity: 0.3,
          animation: 'float 4s ease-in-out infinite'
        }}>🌟</div>

        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default InsufficientCreditsModal;
