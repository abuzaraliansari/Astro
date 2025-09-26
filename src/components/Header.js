import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import InsufficientCreditsModal from './InsufficientCreditsModal';

function Header() {
  const location = useLocation();
  const { user, logout, updateUserProfile } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
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

  // Get current page name
  const getCurrentPageName = () => {
    const pathMap = {
      '/home': 'Home',
      '/chat': 'Chat',
      '/credits': 'Credits',
      '/kundli': 'Kundli',
      '/horoscope': 'Horoscope',
      '/submuhrat': 'Submuhrat',
      '/call': 'Call Guru',
      '/pooja': 'Pooja',
      '/moon': 'Moon Tracker'
    };
    return pathMap[location.pathname] || 'AstroGuru';
  };

  // Navigation menu items with icons
  const navItems = [
    { path: '/home', label: 'Home'},
    { path: '/chat', label: 'Chat'},
    { path: '/kundli', label: 'Kundli'},
    { path: '/horoscope', label: 'Horoscope'},
    { path: '/submuhrat', label: 'Submuhrat'},
    { path: '/call', label: 'Call Guru'},
    { 
      path: '/credits', 
      label: 'Credits',
      showCredits: true 
    }
  ];

  // Religion options
  const religionOptions = [
    'Hindu', 'Islam', 'Christianity', 'Sikhism', 'Buddhism', 
    'Jainism', 'Judaism', 'Zoroastrianism', 'Bahai', 'Other'
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (!event.target.closest('.nav-dropdown-mobile')) {
        setShowNavMenu(false);
      }
      if (!event.target.closest('.profile-modal') && !event.target.closest('.profile-modal-trigger')) {
        setShowProfileModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearChat = () => {
    if (location.pathname === '/chat') {
      window.dispatchEvent(new CustomEvent('clearChat'));
    } else {
      // Navigate to chat if not already there
      window.location.href = '/chat';
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // Close mobile menu when navigating
  const handleMobileMenuClick = () => {
    setShowNavMenu(false);
  };

  // Handle profile modal
  const handleProfileClick = () => {
    setShowProfileModal(true);
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
      // Map frontend field names to backend field names
      const fieldMapping = {
        fullName: 'full_name',
        dateOfBirth: 'birth_date',
        birthTime: 'birth_time',
        birthPlace: 'birth_place'
      };

      const backendField = fieldMapping[field] || field;
      const updateData = { [backendField]: profileData[field] };

      // Call updateUserProfile from AuthContext
      await updateUserProfile(updateData);
      
      // Toggle edit mode off
      setEditMode(prev => ({
        ...prev,
        [field]: false
      }));

      console.log(`✅ Profile field ${field} updated successfully`);
    } catch (error) {
      console.error(`❌ Error updating profile field ${field}:`, error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancelEdit = (field) => {
    // Reset to original value
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

  return (
    <>
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
      {showProfileModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal">
            <div className="profile-modal-header">
              <h2>👤 Profile Information</h2>
              <button 
                className="profile-modal-close"
                onClick={() => setShowProfileModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="profile-modal-content">
              {/* Full Name */}
              <div className="profile-field">
                <label className="profile-label">
                  <span className="field-icon">👤</span>
                  Full Name
                </label>
                <div className="profile-input-group">
                  {editMode.fullName ? (
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      className="profile-input editing"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <span className="profile-value">
                      {profileData.fullName || 'Not set'}
                    </span>
                  )}
                  <div className="profile-actions">
                    {editMode.fullName ? (
                      <>
                        <button 
                          className="profile-btn save"
                          onClick={() => handleSaveField('fullName')}
                        >
                          ✓
                        </button>
                        <button 
                          className="profile-btn cancel"
                          onClick={() => handleCancelEdit('fullName')}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button 
                        className="profile-btn edit"
                        onClick={() => handleEditToggle('fullName')}
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Religion */}
              <div className="profile-field">
                <label className="profile-label">
                  <span className="field-icon">🕉️</span>
                  Religion
                </label>
                <div className="profile-input-group">
                  {editMode.religion ? (
                    <select
                      value={profileData.religion}
                      onChange={(e) => handleFieldChange('religion', e.target.value)}
                      className="profile-input editing"
                    >
                      <option value="">Select Religion</option>
                      {religionOptions.map(religion => (
                        <option key={religion} value={religion}>
                          {religion}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="profile-value">
                      {profileData.religion || 'Not set'}
                    </span>
                  )}
                  <div className="profile-actions">
                    {editMode.religion ? (
                      <>
                        <button 
                          className="profile-btn save"
                          onClick={() => handleSaveField('religion')}
                        >
                          ✓
                        </button>
                        <button 
                          className="profile-btn cancel"
                          onClick={() => handleCancelEdit('religion')}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button 
                        className="profile-btn edit"
                        onClick={() => handleEditToggle('religion')}
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="profile-field">
                <label className="profile-label">
                  <span className="field-icon">📅</span>
                  Date of Birth
                </label>
                <div className="profile-input-group">
                  {editMode.dateOfBirth ? (
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                      className="profile-input editing"
                    />
                  ) : (
                    <span className="profile-value">
                      {profileData.dateOfBirth ? 
                        new Date(profileData.dateOfBirth).toLocaleDateString() : 
                        'Not set'}
                    </span>
                  )}
                  <div className="profile-actions">
                    {editMode.dateOfBirth ? (
                      <>
                        <button 
                          className="profile-btn save"
                          onClick={() => handleSaveField('dateOfBirth')}
                        >
                          ✓
                        </button>
                        <button 
                          className="profile-btn cancel"
                          onClick={() => handleCancelEdit('dateOfBirth')}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button 
                        className="profile-btn edit"
                        onClick={() => handleEditToggle('dateOfBirth')}
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Birth Time */}
              <div className="profile-field">
                <label className="profile-label">
                  <span className="field-icon">🕐</span>
                  Birth Time
                </label>
                <div className="profile-input-group">
                  {editMode.birthTime ? (
                    <input
                      type="time"
                      value={profileData.birthTime}
                      onChange={(e) => handleFieldChange('birthTime', e.target.value)}
                      className="profile-input editing"
                    />
                  ) : (
                    <span className="profile-value">
                      {profileData.birthTime || 'Not set'}
                    </span>
                  )}
                  <div className="profile-actions">
                    {editMode.birthTime ? (
                      <>
                        <button 
                          className="profile-btn save"
                          onClick={() => handleSaveField('birthTime')}
                        >
                          ✓
                        </button>
                        <button 
                          className="profile-btn cancel"
                          onClick={() => handleCancelEdit('birthTime')}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button 
                        className="profile-btn edit"
                        onClick={() => handleEditToggle('birthTime')}
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Country */}
              <div className="profile-field">
                <label className="profile-label">
                  <span className="field-icon">🌍</span>
                  Country
                </label>
                <div className="profile-input-group">
                  {editMode.country ? (
                    <input
                      type="text"
                      value={profileData.country}
                      onChange={(e) => handleFieldChange('country', e.target.value)}
                      className="profile-input editing"
                      placeholder="Enter your country"
                    />
                  ) : (
                    <span className="profile-value">
                      {profileData.country || 'Not set'}
                    </span>
                  )}
                  <div className="profile-actions">
                    {editMode.country ? (
                      <>
                        <button 
                          className="profile-btn save"
                          onClick={() => handleSaveField('country')}
                        >
                          ✓
                        </button>
                        <button 
                          className="profile-btn cancel"
                          onClick={() => handleCancelEdit('country')}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button 
                        className="profile-btn edit"
                        onClick={() => handleEditToggle('country')}
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Birth Place */}
              <div className="profile-field">
                <label className="profile-label">
                  <span className="field-icon">📍</span>
                  Birth Place
                </label>
                <div className="profile-input-group">
                  {editMode.birthPlace ? (
                    <input
                      type="text"
                      value={profileData.birthPlace}
                      onChange={(e) => handleFieldChange('birthPlace', e.target.value)}
                      className="profile-input editing"
                      placeholder="Enter your birth place"
                    />
                  ) : (
                    <span className="profile-value">
                      {profileData.birthPlace || 'Not set'}
                    </span>
                  )}
                  <div className="profile-actions">
                    {editMode.birthPlace ? (
                      <>
                        <button 
                          className="profile-btn save"
                          onClick={() => handleSaveField('birthPlace')}
                        >
                          ✓
                        </button>
                        <button 
                          className="profile-btn cancel"
                          onClick={() => handleCancelEdit('birthPlace')}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button 
                        className="profile-btn edit"
                        onClick={() => handleEditToggle('birthPlace')}
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="app-header">
        <div className="header-left">
          {/* Logo */}
          <Link to="/home" className="logo-section">
            <span className="logo-icon">🌟</span>
            <h1 className="logo-text">AstroGuru</h1>
          </Link>
        </div>

        {/* ✅ CENTERED NAVIGATION CONTAINER */}
        <div className="nav-container-center">
          {/* ✅ DESKTOP: Horizontal Navigation Grid */}
          <div className="nav-grid-desktop">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-grid-item ${location.pathname === item.path ? 'active' : ''} ${item.showCredits ? 'credits-item' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">
                  {item.showCredits ? `💎 ${user?.credits || 0}` : item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* ✅ MOBILE: Dropdown Navigation */}
          <div className="nav-dropdown-mobile">
            <button 
              className="nav-toggle"
              onClick={() => setShowNavMenu(!showNavMenu)}
            >
              <span className="current-page">{getCurrentPageName()}</span>
              <span className={`dropdown-arrow ${showNavMenu ? 'open' : ''}`}>▼</span>
            </button>
            
            {showNavMenu && (
              <div className="nav-menu">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${location.pathname === item.path ? 'active' : ''} ${item.showCredits ? 'credits-item' : ''}`}
                    onClick={handleMobileMenuClick}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">
                      {item.showCredits ? `Credits: ${user?.credits || 0}` : item.label}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Header Right */}
        <div className="header-right">
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
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
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
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
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

                <Link 
                  to="/settings"
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <span className="dropdown-icon">⚙️</span>
                  Settings
                </Link>

                <div className="dropdown-divider"></div>

                <button 
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <span className="dropdown-icon">🚪</span>
                  Logout
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
