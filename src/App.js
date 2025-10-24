import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from 'react-router-dom';
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
import Feedback from './components/Feedback';
import Terms  from './components/terms';
import AboutUs  from './components/AboutUs';
import ContactUs  from './components/ContactUs';

import './App.css';

import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // ✅ Include loading flag from AuthContext

  const isAuthPage = location.pathname === '/';
  const isHomePage = location.pathname === '/home';
  const isTermsPage = location.pathname === '/terms'; // ✅ NEW: Identify terms page
  const isPublicPage = isAuthPage || isTermsPage; 

// ✅ IMPROVED: Detect if running as native app (React Native WebView)


useEffect(() => {
  const detectNativeApp = () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    
    console.log('🔍 User Agent:', ua);
    
    // Method 1: Check for React Native WebView
    if (window.ReactNativeWebView) {
      console.log('✅ Detected: React Native WebView');
      return true;
    }
    
    // Method 2: Check for standalone PWA mode
    if (window.navigator.standalone === true || 
        window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ Detected: Standalone PWA mode');
      return true;
    }
    
    // Method 3: Check User Agent for WebView indicators
    const webViewPatterns = [
      /wv/i,                    // Generic WebView
      /WebView/i,               // Explicit WebView
      /Android.*Version\/.*Chrome/i,  // Android WebView
      /; wv\)/i,                // Android WebView specific
      /iPhone.*AppleWebKit(?!.*Safari)/i  // iOS WebView (no Safari)
    ];
    
    const isWebView = webViewPatterns.some(pattern => pattern.test(ua));
    if (isWebView) {
      console.log('✅ Detected: Mobile WebView via User Agent');
      return true;
    }
    
    // Method 4: Check for mobile browser that's NOT Chrome/Safari
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    const isStandardBrowser = /Chrome|CriOS|Safari/i.test(ua) && !/wv/i.test(ua);
    
    if (isMobile && !isStandardBrowser) {
      console.log('✅ Detected: Non-standard mobile browser (likely app)');
      return true;
    }
    
    console.log('❌ Not detected as native app');
    return false;
  };

  const isNative = detectNativeApp();
  
  if (isNative) {
    console.log('📱 NATIVE APP MODE - Applying safe area padding');
    document.documentElement.classList.add('native-app-mode');
    document.body.classList.add('native-app-mode');
  } else {
    console.log('🌐 WEB BROWSER MODE - Using normal padding');
    document.documentElement.classList.remove('native-app-mode');
    document.body.classList.remove('native-app-mode');
  }
  
  // Log final state
  console.log('HTML classes:', document.documentElement.className);
}, []);

  
  useEffect(() => {
    if (loading) return; // ⏳ Wait until auth state is ready
 if (isPublicPage) return;
    if (!user) {
      // ❌ Not logged in → only allow `/`
      navigate('/', { replace: true });
      return;
    }

    // ✅ Logged in
    if (isAuthPage) {
      navigate('/home', { replace: true });
      return;
    }

    // 🧭 Valid route check
    const validPaths = new Set([
      '/home',
      '/chat',
      '/credits',
      '/kundli',
      '/horoscope',
      '/submuhrat',
      '/call',
      '/moon',
      '/pooja',
      '/refer',
      '/profile',
      '/feedback',
      '/terms',
      '/aboutus',
      '/contactus'
    ]);

    if (!validPaths.has(location.pathname)) {
      navigate('/home', { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  // 🔒 Prevent back navigation on login page
  useEffect(() => {
    if (isAuthPage && !user?.full_name) {
      window.history.pushState(null, '', window.location.href);

      const handlePopState = (e) => {
        if (window.location.pathname === '/') {
          e.preventDefault();
          window.history.pushState(null, '', window.location.href);
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isAuthPage, user]);


  useEffect(() => {
  // Only run on native platforms
  if (Capacitor.isNativePlatform()) {
    console.log('📱 Running on native platform - configuring status bar');
    
    // Configure status bar
    StatusBar.setStyle({ style: 'DARK' });
    StatusBar.setBackgroundColor({ color: '#1a1a2e' });
    StatusBar.setOverlaysWebView({ overlay: false }); // ✅ KEY: Don't overlay
    
    // Apply safe area class
    document.documentElement.classList.add('native-app-mode');
  }
}, []);

  // 🕓 Show loading screen while auth is initializing
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="app-layout">
      {!isAuthPage && <Header />}
      <main className={`main-content ${!isPublicPage  ? 'with-header-footer' : ''}`}>
        {children}
      </main>
      { <Footer />}
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
              {/* Public Auth Route */}
              <Route path="/" element={<Auth />} />
<Route path="/terms" element={<Terms />} />
              {/* Protected Routes */}
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><ChatBot /></ProtectedRoute>} />
              <Route path="/credits" element={<ProtectedRoute><CreditPurchase /></ProtectedRoute>} />
              <Route path="/kundli" element={<ProtectedRoute><Kundli /></ProtectedRoute>} />
              <Route path="/horoscope" element={<ProtectedRoute><Horoscope /></ProtectedRoute>} />
              <Route path="/submuhrat" element={<ProtectedRoute><Submuhrat /></ProtectedRoute>} />
              <Route path="/call" element={<ProtectedRoute><CallGuru /></ProtectedRoute>} />
              <Route path="/moon" element={<ProtectedRoute><MoonTracker /></ProtectedRoute>} />
              <Route path="/pooja" element={<ProtectedRoute><BookPooja /></ProtectedRoute>} />
              <Route path="/refer" element={<ProtectedRoute><Refer /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
              <Route path="/aboutus" element={<ProtectedRoute><AboutUs /></ProtectedRoute>} />
              <Route path="/contactus" element={<ProtectedRoute><ContactUs /></ProtectedRoute>} />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
