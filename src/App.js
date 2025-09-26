import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './AuthContext';
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
import './App.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/';

  return (
    <div className="app-layout">
      {!isAuthPage && <Header />}
      <main className={`main-content ${!isAuthPage ? 'with-header-footer' : ''}`}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
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
              <Route path="/pooja" element={<ProtectedRoute><div className="coming-soon-page">📖 Pooja booking coming soon…</div></ProtectedRoute>} />
              <Route path="/moon" element={<ProtectedRoute><div className="coming-soon-page">🌙 Moon tracker coming soon…</div></ProtectedRoute>} />
              
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
