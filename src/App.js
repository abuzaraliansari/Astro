import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Auth from './components/Auth';
import ChatBot from './components/ChatBot';
import CreditPurchase from './components/CreditPurchase';
import ProtectedRoute from './components/ProtectedRoute';
import Horoscope from './components/Horoscope_temp';
import Kundli from './components/Kundli_temp';
import CallGuru from './components/CallGuru_temp';
import Submuhrat from './components/Submuhrat_temp';
import Home from './components/Home';
import MoonTracker from './components/MoonTracker';
import BookPooja from './components/BookPooja';
import Refer from './components/refer';
import Profile from './components/ProfileModal';
import './App.css';

// Layout component adds Header and Footer conditionally and checks auth status to redirect unauthenticated users
const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAuthPage = location.pathname === '/';
   const isHomePage = location.pathname === '/home'; 

  // Redirect unauthenticated user to login page "/" if not on login page
  useEffect(() => {
    if (!user && !isAuthPage) {
      navigate('/', { replace: true });
    }
  }, [user, isAuthPage, navigate]);

  return (
    <div className="app-layout">
      {!isAuthPage && <Header />}
      <main className={`main-content ${!isAuthPage ? 'with-header-footer' : ''}`}>
        {children}
      </main>
        {isHomePage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId="1039681193782-obmnqsvo8dvct21i1fum6dov74i0iqn2.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Auth Route - No Header/Footer */}
              <Route path="/" element={<Auth />} />

              {/* Protected Routes - With Header/Footer */}
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><ChatBot /></ProtectedRoute>} />
              <Route path="/credits" element={<ProtectedRoute><CreditPurchase /></ProtectedRoute>} />
              <Route path="/kundli" element={<ProtectedRoute><Kundli /></ProtectedRoute>} />
              <Route path="/horoscope" element={<ProtectedRoute><Horoscope /></ProtectedRoute>} />
              <Route path="/submuhrat" element={<ProtectedRoute><Submuhrat /></ProtectedRoute>} />
              <Route path="/call" element={<ProtectedRoute><CallGuru /></ProtectedRoute>} />

              {/* Coming Soon Routes */}
              <Route path="/moon" element={<ProtectedRoute><MoonTracker /></ProtectedRoute>} />
              <Route path="/pooja" element={<ProtectedRoute><BookPooja /></ProtectedRoute>} />
              <Route path="/refer" element={<ProtectedRoute><Refer /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Catch All Route */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
