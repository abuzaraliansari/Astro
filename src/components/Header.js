import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { endSession } from '../api';
import InsufficientCreditsModal from './InsufficientCreditsModal';



function Header() {
  const location = useLocation();
    const navigate = useNavigate(); // ✅ Add this
  const { user, logout, updateUserProfile } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [editMode, setEditMode] = useState({
    fullName: false,
    religion: false,
    dateOfBirth: false,
    birthTime: false,
    country: false,
    birthPlace: false
  });
  const [profileData, setProfileData] = useState({
    fullName: '',
    religion: '',
    dateOfBirth: '',
    birthTime: '',
    country: '',
    birthPlace: ''
  });

  // Initialize profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.full_name || '',
        religion: user.religion || '',
        dateOfBirth: user.birth_date || '',
        birthTime: user.birth_time || '',
        country: user.country || '',
        birthPlace: user.birth_place || ''
      });
    }
  }, [user]);

  // Enhanced logout protection - redirect if user is not authenticated
  useEffect(() => {
    if (!user && location.pathname !== '/') {
      window.location.href = '/';
    }
  }, [user, location.pathname]);

  // Listen for logout events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'astroguru_user' && !e.newValue) {
        window.location.reload();
      }
    };
    const handleUserLoggedOut = () => {
      setShowUserMenu(false);
      //setShowProfileModal(false);
      window.location.href = '/';
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedOut', handleUserLoggedOut);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedOut', handleUserLoggedOut);
    };
  }, []);

  // Get current page name
  const getCurrentPageName = () => {
    const pathMap = {
      '/home': 'Home',
      '/chat': 'Chat',
      '/credits': 'Credits',
      // '/kundli': 'Kundli',
      //'/horoscope': 'Horoscope',
      //'/submuhrat': 'Submuhrat',
      '/call': 'Call Guru',
      //'/pooja': 'Pooja',
      //'/moon': 'Moon Tracker'
    };
    return pathMap[location.pathname] || 'AstroGuru';
  };

  // Navigation menu items WITHOUT credits
  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/chat', label: 'Chat' },
    // { path: '/kundli', label: 'Kundli' },
    //{ path: '/horoscope', label: 'Horoscope' },
    //{ path: '/submuhrat', label: 'Submuhrat' },
    //{ path: '/moon', label: 'Moon Tracker' },
    //{ path: '/pooja', label: 'Pooja' },
    { path: '/call', label: 'Schedule' },
    { path: '/refer', label: 'Refer' }
  ];

  // Religion options
  const religionOptions = [
    'Hindu', 'Islam', 'Christianity', 'Sikhism', 'Buddhism',
    'Jainism', 'Judaism', 'Zoroastrianism', 'Bahai', 'Other'
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-container')) setShowUserMenu(false);
      if (!event.target.closest('.nav-dropdown-mobile')) setShowNavMenu(false);
      if (!event.target.closest('.profile-modal') && !event.target.closest('.profile-modal-trigger'));
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearChat = () => {
    if (location.pathname === '/chat') {
      window.dispatchEvent(new CustomEvent('clearChat'));
    } else {
      window.location.href = '/chat';
    }
  };




  // Enhanced logout with confirmation and loading state
  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout? This will clear all your session data.')) {
      return;
    }

    console.log('═══════════════════════════════════════════════');
    console.log('🚪 LOGOUT PROCESS STARTED');
    console.log('═══════════════════════════════════════════════');

    setIsLoggingOut(true);
    setShowUserMenu(false);
    //setShowProfileModal(false);

    try {
      document.body.style.cursor = 'wait';

      // ✅ STEP 1: End Session on Backend (NEW CODE STARTS HERE)
      try {
        console.log('🔐 Step 1: Ending session on backend...');
        const userId = user?.userId || user?.id;
        const sessionId = localStorage.getItem('astroguru_session_id');

        console.log('📊 Session info:', {
          userId: userId,
          sessionId: sessionId,  // ✅ Will show the full GUID
          userName: user?.full_name
        });

        if (userId) {
          const sessionResponse = await endSession(
            sessionId || null,  // ✅ KEEP AS STRING (GUID)
            userId
          );


          if (sessionResponse.data.success) {
            console.log('✅ Session ended successfully on backend');
            console.log('📊 Sessions closed:', sessionResponse.data.sessionsEnded || 1);
          } else {
            console.warn('⚠️ Session end returned false, continuing logout...');
          }
        } else {
          console.warn('⚠️ No userId found, skipping session end');
        }
      } catch (sessionError) {
        console.error('❌ Session end error:', sessionError);
        console.error('❌ Error details:', sessionError.response?.data || sessionError.message);
        // Don't block logout if session end fails
        console.warn('⚠️ Continuing logout despite session error');
      }
      // (NEW CODE ENDS HERE)

      // ✅ STEP 2: Clear LocalStorage (YOUR EXISTING CODE CONTINUES)
      console.log('🗑️ Step 2: Clearing localStorage...');
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('astroguru_') ||
          key.startsWith('chat_') ||
          key.startsWith('user_') ||
          key.includes('astro') ||
          key.includes('guru')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log('✅ LocalStorage cleared');

      // ✅ STEP 3: Clear SessionStorage (YOUR EXISTING CODE)
      console.log('🗑️ Step 3: Clearing sessionStorage...');
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (
          key.startsWith('astroguru_') ||
          key.startsWith('chat_') ||
          key.startsWith('user_') ||
          key.includes('astro') ||
          key.includes('guru')
        )) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      console.log('✅ SessionStorage cleared');

      // ✅ STEP 4: Dispatch Events (YOUR EXISTING CODE)
      console.log('📡 Step 4: Dispatching logout events...');
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      window.dispatchEvent(new CustomEvent('clearAllData'));
      window.dispatchEvent(new CustomEvent('clearChat'));
      console.log('✅ Events dispatched');

      // ✅ STEP 5: Auth Logout (YOUR EXISTING CODE)
      console.log('🔐 Step 5: Calling auth context logout...');
      logout();
      console.log('✅ Auth context logout complete');

      console.log('═══════════════════════════════════════════════');
      console.log('✅ LOGOUT PROCESS COMPLETE');
      console.log('═══════════════════════════════════════════════');

      // ✅ STEP 6: Redirect (YOUR EXISTING CODE)
      setTimeout(() => {
        console.log('🏠 Redirecting to home page...');
        window.location.href = '/';
        window.location.reload();
      }, 100);

    } catch (error) {
      console.error('❌ Logout process error:', error);
      console.log('═══════════════════════════════════════════════');
      window.location.href = '/';
      window.location.reload();
    } finally {
      document.body.style.cursor = 'default';
      setIsLoggingOut(false);
    }
  };


  const handleMobileMenuClick = () => setShowNavMenu(false);

 const handleProfileClick = () => {
  console.log('Profile clicked');
  navigate('/profile'); // ✅ Navigate to profile page
  setShowUserMenu(false);
};


  const handleEditToggle = (field) => {
    setEditMode(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleFieldChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveField = async (field) => {
    try {
      const fieldMapping = {
        fullName: 'full_name',
        dateOfBirth: 'birth_date',
        birthTime: 'birth_time',
        birthPlace: 'birth_place'
      };
      const backendField = fieldMapping[field] || field;
      const updateData = { [backendField]: profileData[field] };
      await updateUserProfile(updateData);
      setEditMode(prev => ({
        ...prev,
        [field]: false
      }));
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancelEdit = (field) => {
    const originalValue = {
      fullName: user.full_name || '',
      religion: user.religion || '',
      dateOfBirth: user.birth_date || '',
      birthTime: user.birth_time || '',
      country: user.country || '',
      birthPlace: user.birth_place || ''
    };
    setProfileData(prev => ({
      ...prev,
      [field]: originalValue[field]
    }));
    setEditMode(prev => ({
      ...prev,
      [field]: false
    }));
  };

  if (!user) return null;

  return (
    <>
      {isLoggingOut && (
        <div>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div></div>
            <p>Logging out securely...</p>
          </div>
        </div>
      )}

      {showInsufficientCreditsModal && (
        <InsufficientCreditsModal
          onClose={() => setShowInsufficientCreditsModal(false)}
          onPurchase={() => {
            setShowInsufficientCreditsModal(false);
            window.location.href = '/credits';
          }}
        />
      )}

      {/* Profile Modal */}
  


      <header className="app-header">
        <div className="header-left">
          <Link to="/home" className="logo-section">
            <span className="logo-icon">🌟</span>
            <h1 className="logo-text">AstroGuru</h1>
          </Link>
        </div>
        {/* Centered Navigation Container */}
        <div className="nav-container-center">
          {/* Desktop: Horizontal Navigation Grid */}
          <div className="nav-grid-desktop">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-grid-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>
          {/* Mobile: Dropdown Navigation */}
          <div className="nav-dropdown-mobile">
            <button
              className="nav-toggle"
              onClick={() => setShowNavMenu(!showNavMenu)}
            >
              <span className="current-page">☰ Menu</span>
              <span className={`dropdown-arrow ${showNavMenu ? 'open' : ''}`}>▼</span>
            </button>
            {showNavMenu && (
              <div className="nav-menu">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={handleMobileMenuClick}
                  >
                    <span className="nav-label">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Header Right: Credits + User Menu */}
        <div className="header-right">
          {/* Credits Display */}
          <Link to="/credits" className="credits-display">
            <span className='dimond'>💎</span>
            <span className={`credits-count ${user?.credits < 10 ? 'low-credits' : ''}`}>
              {user?.credits || 0}
            </span>
            {user?.credits < 10 && <span className="warning-icon">⚠️</span>}
          </Link>
          {/* User Menu */}
          <div className="user-menu-container">
            <div
              className="user-info"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt="Profile"
                    className="avatar-img"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="avatar-initials">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <span className="user-name">
                {user?.full_name?.split(' ')[0] || 'User'}
              </span>
            </div>
            {showUserMenu && (
              <div className="user-dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {user?.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt="Profile"
                        className="dropdown-avatar-img"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="dropdown-avatar-placeholder">
                        {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="dropdown-user-info">
                    <div className="dropdown-user-name">
                      {user?.full_name || 'User'}
                    </div>
                    <div className="dropdown-user-email">
                      {user?.email || 'user@example.com'}
                    </div>
                  </div>
                </div>
                <button
                  className="dropdown-item profile-modal-trigger"
                  onClick={handleProfileClick}
                >
                  <span className="dropdown-icon">👤</span>
                  Profile
                </button>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <span className="dropdown-icon">
                    {isLoggingOut ? '⏳' : '🚪'}
                  </span>
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;