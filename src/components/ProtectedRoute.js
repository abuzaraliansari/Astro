import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ✅ Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif'
      }}>
       {/* <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '20px',
            animation: 'pulse 2s ease-in-out infinite'
          }}></div>
          <div style={{ fontSize: '18px', fontWeight: '500' }}>
            Loading your cosmic journey...
          </div>
        </div>*/}
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
          }
        `}</style>
      </div>
    );
  }

  // ✅ If not authenticated, redirect to login page
  if (!user?.full_name) 
    
    {
      if(location.pathname =="/terms"){
        console.log(`🔒 Accessing public route: ${location.pathname}`);
        return children;
      }
    console.log(`🔒 Protected route blocked: ${location.pathname}`);
    return <Navigate to="/" replace />;
  }

  // ✅ User is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
