import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { searchPlaces, getAllCountries, updateUserProfile } from '../api';

function Profile() {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();   // ✅ CORRECT - Only get user from AuthContext
    // ✅ REPLACE these hardcoded arrays with state



    // ========================================
    // STATE MANAGEMENT
    // ========================================

    const [profileData, setProfileData] = useState({
        full_name: user?.full_name || '',
        religion: user?.religion || 'HINDUISM',
        birth_day: user?.birth_date ? new Date(user.birth_date).getDate() : '',
        birth_month: user?.birth_date ? new Date(user.birth_date).getMonth() + 1 : '',
        birth_year: user?.birth_date ? new Date(user.birth_date).getFullYear() : '',
        birth_time: user?.birth_time || '',
        birth_place: user?.birth_place || '',
        country_code: user?.country_code || 'in',
        country_code_no: user?.country_code_no || '+91',
        mobile_number: user?.mobile_number || '',
        latitude: user?.latitude || null,
        longitude: user?.longitude || null
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showReligionDropdown, setShowReligionDropdown] = useState(false);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [showPhoneCodeDropdown, setShowPhoneCodeDropdown] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [placeSuggestions, setPlaceSuggestions] = useState([]);
    const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
    const [selectedHour, setSelectedHour] = useState(null);  // ✅ ADD
    const [selectedMinute, setSelectedMinute] = useState(null);  // ✅ ADD

    const [isLoading, setIsLoading] = useState(false);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [placeCountries, setPlaceCountries] = useState([]);
    const [phoneCountries, setPhoneCountries] = useState([]);

    const searchTimeoutRef = useRef(null);

    const religionDropdownRef = useRef(null);
    const countryDropdownRef = useRef(null);
    const phoneCodeDropdownRef = useRef(null);
    const placeDropdownRef = useRef(null);

    const [selectedCountry, setSelectedCountry] = useState({
        name: 'India',
        code: 'in',
        flag: '🇮🇳'
    });

    // All your constants (religions, months, days, years, countries)
    const religions = [
        { value: 'HINDUISM', label: 'Hindu', icon: '🕉️' },
        { value: 'ISLAM', label: 'Muslim', icon: '☪️' },
        { value: 'CHRISTIANITY', label: 'Christian', icon: '✝️' },
        { value: 'SIKHISM', label: 'Sikh', icon: '☬' },
        { value: 'BUDDHISM', label: 'Buddhist', icon: '☸️' },
        { value: 'JAINISM', label: 'Jain', icon: '🙏' },
        { value: 'OTHERS', label: 'Other', icon: '🌟' }
    ];

    const months = [
        { value: 1, name: 'January' }, { value: 2, name: 'February' },
        { value: 3, name: 'March' }, { value: 4, name: 'April' },
        { value: 5, name: 'May' }, { value: 6, name: 'June' },
        { value: 7, name: 'July' }, { value: 8, name: 'August' },
        { value: 9, name: 'September' }, { value: 10, name: 'October' },
        { value: 11, name: 'November' }, { value: 12, name: 'December' }
    ];

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);


    // All your helper functions (copy from ProfileModal.js)
    const handleProfileDataChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getDaysInMonth = () => {
        if (!profileData.birth_month || !profileData.birth_year) return 31;
        return new Date(profileData.birth_year, profileData.birth_month, 0).getDate();
    };
    /*
     const formatTimeDisplay = (time24) => {
        if (!time24) return '12:00 PM';
        
        // Handle both "HH:MM:SS" and "HH:MM" formats
        const timeParts = time24.split(':');
        const hours = parseInt(timeParts[0]);
        const minutes = timeParts[1] || '00';
        
        // Convert to 12-hour format
        const period = hours >= 12 ? 'PM' : 'AM';
        let displayHour = hours % 12;
        if (displayHour === 0) displayHour = 12; // Handle midnight/noon
        
        // ✅ Format: HH:MM AM/PM
        return `${displayHour.toString().padStart(2, '0')}:${minutes} ${period}`;
    };
    
    
        const getSelectedHour = () => {
            if (!profileData.birth_time) return 12;
            const [hours] = profileData.birth_time.split(':');
            const hour = parseInt(hours);
            return hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        };
    
        const getSelectedMinute = () => {
            if (!profileData.birth_time) return 0;
            const [, minutes] = profileData.birth_time.split(':');
            return parseInt(minutes);
        };
    
        const getTimePeriod = () => {
            if (!profileData.birth_time) return 'AM';
            const [hours] = profileData.birth_time.split(':');
            return parseInt(hours) >= 12 ? 'PM' : 'AM';
        };
    
        const getHourAngle = () => {
            const hour = getSelectedHour();
            return (hour % 12) * 30;
        };
    
        const getMinuteAngle = () => {
            return getSelectedMinute() * 6;
        };
    
        const handleHourClick = (hour) => {
            const period = getTimePeriod();
            let hour24 = hour;
            if (period === 'PM' && hour !== 12) hour24 = hour + 12;
            if (period === 'AM' && hour === 12) hour24 = 0;
    
            const currentMinute = getSelectedMinute().toString().padStart(2, '0');
            handleProfileDataChange('birth_time', `${hour24.toString().padStart(2, '0')}:${currentMinute}`);
            setClockMode('minute');
        };
    
        const handleMinuteClick = (minute) => {
            const currentHour = profileData.birth_time ? profileData.birth_time.split(':')[0] : '00';
            handleProfileDataChange('birth_time', `${currentHour}:${minute.toString().padStart(2, '0')}`);
        };
    
        const toggleAMPM = (period) => {
            if (!profileData.birth_time) {
                handleProfileDataChange('birth_time', period === 'AM' ? '00:00' : '12:00');
                return;
            }
    
            const [hours, minutes] = profileData.birth_time.split(':');
            let hour = parseInt(hours);
    
            if (period === 'PM' && hour < 12) {
                hour += 12;
            } else if (period === 'AM' && hour >= 12) {
                hour -= 12;
            }
    
            handleProfileDataChange('birth_time', `${hour.toString().padStart(2, '0')}:${minutes}`);
        };
    */
    const toggleReligionDropdown = () => {
        setShowReligionDropdown(!showReligionDropdown);
    };

    const handleReligionSelect = (religion) => {
        handleProfileDataChange('religion', religion.value);
        setShowReligionDropdown(false);
    };

    const toggleCountryDropdown = () => {
        setShowCountryDropdown(!showCountryDropdown);
    };

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        handleProfileDataChange('country_code', country.code);
        setShowCountryDropdown(false);
        setSearchQuery('');
        setPlaceSuggestions([]);
        handleProfileDataChange('birth_place', '');
    };

    const handleSearchQueryChange = (query) => {
        setSearchQuery(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (query.length >= 3) {
            setIsLoadingPlaces(true);
            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    const response = await searchPlaces(query, selectedCountry.code);
                    if (response.data && response.data.success) {
                        setPlaceSuggestions(response.data.places || []);
                    }
                } catch (error) {
                    console.error('Error searching places:', error);
                    setPlaceSuggestions([]);
                } finally {
                    setIsLoadingPlaces(false);
                }
            }, 500);
        } else {
            setPlaceSuggestions([]);
            setIsLoadingPlaces(false);
        }
    };

    const handlePlaceSelect = (place) => {
        handleProfileDataChange('birth_place', place.main_text);
        handleProfileDataChange('latitude', place.latitude);
        handleProfileDataChange('longitude', place.longitude);
        setSearchQuery('');
        setPlaceSuggestions([]);
        setShowSuggestions(false);
    };

    const handlePlaceInputKeyDown = (e) => {
        if (e.key === 'Enter' && placeSuggestions.length > 0) {
            e.preventDefault();
            handlePlaceSelect(placeSuggestions[0]);
        }
    };

    const handlePlaceKeyDown = (e, place) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePlaceSelect(place);
        }
    };

    const handleSave = async () => {
        if (!profileData.full_name || !profileData.birth_day || !profileData.birth_month ||
            !profileData.birth_year || !profileData.birth_time || !profileData.birth_place) {
            alert('Please fill in all required fields marked with *');
            return;
        }

        setIsLoading(true);
        try {
            // ✅ Format birth_date
            const birthDate = `${profileData.birth_year}-${profileData.birth_month.toString().padStart(2, '0')}-${profileData.birth_day.toString().padStart(2, '0')}`;

            // ✅ Build update object with ALL fields (API will handle which ones to update)
            const dataToSave = {
                full_name: profileData.full_name,
                religion: profileData.religion,
                birth_date: birthDate,
                birth_time: profileData.birth_time,
                birth_place: profileData.birth_place,
                country_code: profileData.country_code,
                latitude: profileData.latitude,
                longitude: profileData.longitude,
                country_code_no: profileData.country_code_no,
                mobile_number: profileData.mobile_number
            };

            console.log('💾 Saving profile data:', dataToSave);

            // ✅ Call API
            const response = await updateUserProfile(user.userId, dataToSave);

            if (response.data.success) {
                alert('✅ Profile updated successfully!');
                console.log('📊 Updated fields:', response.data.updatedFields);
                console.log('👤 New user data:', response.data.user);
                await refreshUser();
                console.log('🔄 User data refreshed in AuthContext');
                // Navigate back to home or previous page
                navigate('/home');
            }
        } catch (error) {
            console.error('❌ Error saving profile:', error);
            alert(`Failed to save profile: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    const handleCancel = () => {
        navigate(-1); // Go back to previous page
    };
    // ✅ ADD THIS NEW useEffect - Update profileData when user data loads
   // ✅ FIXED: Update profileData when user data loads
useEffect(() => {
  if (user) {
    console.log('🔄 User data changed, updating profileData...');
    console.log('User birth_time:', user.birth_time);
    
    // ✅ Parse birth_time to extract HH:MM format
    let parsedTime = user.birth_time || '';
    if (parsedTime && parsedTime.includes('T')) {
        // Handle format "1970-01-01T03:04:00.000Z"
        const timeOnly = parsedTime.split('T')[1].split('.')[0]; // Gets "03:04:00"
        const [hour, minute] = timeOnly.split(':');
        parsedTime = `${hour}:${minute}`; // Convert to "03:04"
    } else if (parsedTime && parsedTime.split(':').length === 3) {
        // Handle format "03:04:00"
        const [hour, minute] = parsedTime.split(':');
        parsedTime = `${hour}:${minute}`; // Convert to "03:04"
    }
    
    setProfileData(prev => ({
      ...prev,
      full_name: user.full_name || prev.full_name,
      religion: user.religion || prev.religion,
      birth_day: user.birth_date ? new Date(user.birth_date).getDate() : prev.birth_day,
      birth_month: user.birth_date ? new Date(user.birth_date).getMonth() + 1 : prev.birth_month,
      birth_year: user.birth_date ? new Date(user.birth_date).getFullYear() : prev.birth_year,
      birth_time: parsedTime || prev.birth_time,  // ✅ Use parsed time
      birth_place: user.birth_place || prev.birth_place,
      country_code: user.country_code || prev.country_code,
      country_code_no: user.country_code_no || prev.country_code_no,
      mobile_number: user.mobile_number || prev.mobile_number,
      latitude: user.latitude || prev.latitude,
      longitude: user.longitude || prev.longitude
    }));
  }
}, [user]);




    // ✅ ADD THIS NEW useEffect after line 280
    useEffect(() => {
        console.log('👤 User data from AuthContext:', user);
        console.log('⏰ Birth time loaded:', user?.birthtime);
        console.log('📊 Current profileData:', profileData);
    }, [user, profileData]);

    // ✅ Disable body scroll when on profile page
    useEffect(() => {
        // Save original overflow style
        const originalOverflow = document.body.style.overflow;

        // Disable body scroll
        document.body.style.overflow = 'hidden';

        // Cleanup: restore scroll when leaving page
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);


    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // ✅ Fetch countries from API on component mount
    // ✅ Fetch countries from API on component mount
    // Fetch countries from API on component mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setLoadingCountries(true);
                console.log('🌍 Fetching countries from API...');

                const response = await getAllCountries();

                if (response.data && response.data.success) {
                    const countries = response.data.countries || [];
                    console.log('✅ Loaded countries:', countries.length);

                    // ✅ FIXED: API uses 'iso' not 'iso2', and 'code' for phone code
                    const validPlaceCountries = countries
                        .filter(c => c.iso && c.name) // ✅ Changed from iso2 to iso
                        .map(c => ({
                            name: c.name,
                            code: c.iso.toLowerCase(), // ✅ Changed from iso2 to iso
                            iso: c.iso,                // ✅ Changed from iso2 to iso
                            flag: c.flag || '🌍'
                        }));

                    const validPhoneCountries = countries
                        .filter(c => c.iso && c.name && c.code) // ✅ Changed iso2 to iso, phone_code to code
                        .map(c => ({
                            name: c.name,
                            code: c.code,              // ✅ Changed from phone_code to code
                            iso: c.iso,                // ✅ Changed from iso2 to iso
                            flag: c.flag || '🌍'
                        }));

                    console.log('✅ Valid place countries:', validPlaceCountries.length);
                    console.log('✅ Valid phone countries:', validPhoneCountries.length);

                    if (validPlaceCountries.length === 0 || validPhoneCountries.length === 0) {
                        console.warn('⚠️ No valid countries found, using defaults');
                        setDefaultCountries();
                    } else {
                        setPlaceCountries(validPlaceCountries);
                        setPhoneCountries(validPhoneCountries);
                        console.log('✅ Countries loaded successfully');
                    }
                } else {
                    console.error('❌ Failed to load countries');
                    setDefaultCountries();
                }
            } catch (error) {
                console.error('❌ Error fetching countries:', error);
                setDefaultCountries();
            } finally {
                setLoadingCountries(false);
            }
        };

        fetchCountries();
    }, []);

    const chatContainerStyle = {
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url(/uploads/chat.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    // ✅ Fallback function if API fails
    const setDefaultCountries = () => {
        const defaultCountries = [
            { name: 'India', code: 'in', iso: 'IN', flag: '🇮🇳', phone_code: '+91' },
            { name: 'United States', code: 'us', iso: 'US', flag: '🇺🇸', phone_code: '+1' },
            { name: 'United Kingdom', code: 'gb', iso: 'GB', flag: '🇬🇧', phone_code: '+44' },
            { name: 'Canada', code: 'ca', iso: 'CA', flag: '🇨🇦', phone_code: '+1' },
            { name: 'Australia', code: 'au', iso: 'AU', flag: '🇦🇺', phone_code: '+61' },
        ];

        setPlaceCountries(defaultCountries.map(c => ({
            name: c.name,
            code: c.code,
            iso: c.iso,
            flag: c.flag
        })));

        setPhoneCountries(defaultCountries.map(c => ({
            name: c.name,
            code: c.phone_code,
            iso: c.iso,
            flag: c.flag
        })));
    };


    // Add this after your existing useEffect (around line 280)
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close religion dropdown
            if (showReligionDropdown && !event.target.closest('.religion-dropdown-container')) {
                setShowReligionDropdown(false);
            }

            // Close country dropdown
            if (showCountryDropdown && !event.target.closest('.country-dropdown-container')) {
                setShowCountryDropdown(false);
            }

            // Close phone code dropdown
            if (showPhoneCodeDropdown && !event.target.closest('.phone-code-dropdown')) {
                setShowPhoneCodeDropdown(false);
            }

            // Close place suggestions
            if (showSuggestions && !event.target.closest('.place-dropdown-container')) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showReligionDropdown, showCountryDropdown, showPhoneCodeDropdown, showSuggestions]);


    // ✅ NO EARLY RETURN - Always render the page
    return (
        <div className="profile-page-container" style={chatContainerStyle}>

            <div className="birth-details-modal profile-page-modal">
                <button className="modal-close-btn" onClick={handleCancel}>×</button>
                <div className="modal-header">
                    <div className="modal-icon">👤</div>
                    <h2 className="modal-title">Edit Your Profile</h2>
                    <p className="modal-subtitle">
                        Update your personal information and birth details for accurate readings
                    </p>
                </div>

                <div className="birth-form">
                    <div className="form-grid" style={{ maxWidth: '600px', margin: '0 auto' }}>

                        <div className="form-row name-religion-row">
                            {/* Full Name Field */}
                            <div className="form-field form-field-name">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    value={profileData.full_name}
                                    onChange={(e) => handleProfileDataChange('full_name', e.target.value)}
                                    placeholder="Enter your complete name"
                                    className="form-input"
                                />
                            </div>

                            {/* Religion Dropdown */}
                            <div className="form-field form-field-religion">
                                <label className="form-label">Religion</label>
                                <div className="religion-dropdown-container">
                                    <div
                                        className={`religion-dropdown-trigger ${showReligionDropdown ? 'active' : ''}`}
                                        onClick={toggleReligionDropdown}
                                    >
                                        <div className="religion-dropdown-content">
                                            <span className="religion-icon">
                                                {religions.find(r => r.value === profileData.religion)?.icon || '🕉️'}
                                            </span>
                                            <span className="religion-text">
                                                {religions.find(r => r.value === profileData.religion)?.label || 'Hindu'}
                                            </span>
                                            <span className={`religion-arrow ${showReligionDropdown ? 'up' : 'down'}`}>
                                                {showReligionDropdown ? '▲' : '▼'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Religion Dropdown Menu */}
                                    {showReligionDropdown && (
                                        <div className="religion-dropdown-menu">
                                            {religions.map((religion) => (
                                                <div
                                                    key={religion.value}
                                                    className={`religion-dropdown-item ${profileData.religion === religion.value ? 'selected' : ''}`}
                                                    onClick={() => handleReligionSelect(religion)}
                                                >
                                                    <span className="religion-icon">{religion.icon}</span>
                                                    <span className="religion-name">{religion.label}</span>
                                                    {profileData.religion === religion.value && (
                                                        <span className="religion-selected-icon">✓</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>


                        <h4 style={{ color: '#ffd700', fontWeight: 'bold' }}>
                            Contact Details *
                        </h4>

                        {/* Mobile Number Row */}
                        <div className="form-row mobile-number-row">
                            {/* Phone Code Selector */}
                            <div className="form-field form-field-country-small">
                                <label className="form-label">Country</label>
                                <div className="country-dropdown-container country-compact phone-code-dropdown">
                                    <div
                                        className={`country-dropdown-trigger country-compact-size ${showPhoneCodeDropdown ? 'active' : ''}`}
                                        onClick={() => setShowPhoneCodeDropdown(!showPhoneCodeDropdown)}
                                    >
                                        <div className="country-dropdown-content country-compact-content">
                                            <span className="country-code">
                                                {profileData.country_code_no || '+91'}
                                            </span>
                                            <span className={`country-arrow ${showPhoneCodeDropdown ? 'up' : 'down'}`}>
                                                {showPhoneCodeDropdown ? '▲' : '▼'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Phone Code Dropdown Menu */}
                                    {showPhoneCodeDropdown && (
                                        <div className="country-dropdown-menu country-compact-menu phone-code-menu">
                                            {loadingCountries ? (
                                                <div className="dropdown-loading">Loading countries...</div>
                                            ) : (
                                                phoneCountries.map((country) => (
                                                    <div
                                                        key={country.iso}
                                                        className={`country-dropdown-item ${profileData.country_code_no === country.code ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            handleProfileDataChange('country_code_no', country.code);
                                                            setShowPhoneCodeDropdown(false);
                                                        }}
                                                    >
                                                        <span className="country-code-small">({country.code})</span>
                                                        {profileData.country_code_no === country.code && (
                                                            <span className="country-selected-icon">✓</span>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Number Input */}
                            <div className="form-field form-field-name">
                                <label className="form-label">Mobile Number</label>
                                <input
                                    type="tel"
                                    value={profileData.mobile_number || ''}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                        if (value.length <= 15) {
                                            handleProfileDataChange('mobile_number', value);
                                        }
                                    }}
                                    placeholder="Enter mobile number"
                                    className="form-input"
                                    maxLength="15"
                                />
                            </div>
                        </div>

                        <h4 style={{ color: '#ffd700', fontWeight: 'bold' }}>
                            Birth Details *
                        </h4>

                        <div className="form-grid-optimized">
                            {/* Row 1: Date and Time */}
                            <div className="form-row">
                                {/* Date Picker */}
                                <div className="form-field form-field-half">
                                    <label className="form-label">Date of Birth</label>
                                    <div className="mobile-date-picker">
                                        <button
                                            type="button"
                                            className="mobile-date-btn uniform-size"
                                            onClick={() => setShowDatePicker(true)}
                                        >
                                            <span className="date-icon">📅</span>
                                            <span className="date-text">
                                                {profileData.birth_day && profileData.birth_month && profileData.birth_year
                                                    ? `${profileData.birth_day.toString().padStart(2, '0')} ${months.find(m => m.value == profileData.birth_month)?.name.substring(0, 3)} ${profileData.birth_year}`
                                                    : 'Select Date'
                                                }
                                            </span>
                                            <span className="date-arrow">▼</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Time Picker */}
                                {/* Time Picker */}
                                <div className="form-field form-field-half">
                                    <label className="form-label">Birth Time</label>
                                    <div className="mobile-time-picker">
                                        <button
                                            type="button"
                                            className="mobile-time-btn uniform-size"
                                            onClick={() => {
                                                // ✅ Initialize with current birth_time value
                                                if (profileData.birth_time) {
                                                    const timeStr = profileData.birth_time;

                                                    // Handle different time formats
                                                    let hour = '12';
                                                    let minute = '00';

                                                    if (timeStr.includes('T')) {
                                                        // Format: "1970-01-01T03:04:00.000Z" - extract time portion
                                                        const timeOnly = timeStr.split('T')[1].split('.')[0]; // Gets "03:04:00"
                                                        [hour, minute] = timeOnly.split(':');
                                                    } else if (timeStr.includes(':')) {
                                                        // Format: "03:04" or "03:04:00"
                                                        [hour, minute] = timeStr.split(':');
                                                    }

                                                    setSelectedHour(hour);
                                                    setSelectedMinute(minute);
                                                } else {
                                                    setSelectedHour('12');
                                                    setSelectedMinute('00');
                                                }
                                                setShowTimePicker(true);
                                            }}
                                        >
                                            <span className="time-icon">🕐</span>
                                            <span className="time-text">
                                                {profileData.birth_time ? (() => {
                                                    const timeStr = profileData.birth_time;

                                                    // Handle different time formats
                                                    if (timeStr.includes('T')) {
                                                        // Format: "1970-01-01T03:04:00.000Z" - extract time portion
                                                        const timeOnly = timeStr.split('T')[1].split('.')[0]; // Gets "03:04:00"
                                                        const [hour, minute] = timeOnly.split(':');
                                                        return `${hour}:${minute}`; // Display as "03:04"
                                                    } else if (timeStr.includes(':')) {
                                                        // Format: "03:04" or "03:04:00"
                                                        const [hour, minute] = timeStr.split(':');
                                                        return `${hour}:${minute}`; // Display as "03:04"
                                                    }

                                                    return 'Select Time';
                                                })() : 'Select Time'}
                                            </span>
                                            <span className="time-arrow">⏱️</span>
                                        </button>
                                    </div>
                                </div>

                            </div>

                            {/* Row 2: Country and Place */}
                            <div className="form-row country-place-row">
                                {/* Country Selector */}
                                <div className="form-field form-field-country-small">
                                    <label className="form-label">Country</label>
                                    <div className="country-dropdown-container country-compact">
                                        <div
                                            className={`country-dropdown-trigger country-compact-size ${showCountryDropdown ? 'active' : ''}`}
                                            onClick={toggleCountryDropdown}
                                        >
                                            <div className="country-dropdown-content country-compact-content">
                                                <span className="country-code">{selectedCountry.code.toUpperCase()}</span>
                                                <span className={`country-arrow ${showCountryDropdown ? 'up' : 'down'}`}>
                                                    {showCountryDropdown ? '▲' : '▼'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Country Dropdown Menu */}
                                        {showCountryDropdown && (
                                            <div className="country-dropdown-menu country-compact-menu">
                                                {loadingCountries ? (
                                                    <div className="dropdown-loading">Loading countries...</div>
                                                ) : (
                                                    placeCountries.map((country) => (
                                                        <div
                                                            key={country.iso}
                                                            className={`country-dropdown-item ${selectedCountry.code === country.iso?.toLowerCase() ? 'selected' : ''}`}
                                                            onClick={() => handleCountrySelect({
                                                                name: country.name,
                                                                code: country.iso?.toLowerCase() || country.code,
                                                                flag: country.flag
                                                            })}
                                                        >
                                                            <span className="country-name">{country.name}</span>
                                                            <span className="country-code-small">({country.iso || country.code.toUpperCase()})</span>
                                                            {selectedCountry.code === country.iso?.toLowerCase() && (
                                                                <span className="country-selected-icon">✓</span>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Place Selector */}
                                <div className="form-field form-field-place-wide">
                                    <label className="form-label">City</label>
                                    <div className="place-dropdown-container place-wide">
                                        <div
                                            className={`place-dropdown-trigger place-wide-size ${showSuggestions ? 'active' : ''}`}
                                            onClick={() => {
                                                setShowSuggestions(!showSuggestions);
                                                const container = document.querySelector('.place-dropdown-container.place-wide');
                                                if (container) {
                                                    if (!showSuggestions) {
                                                        container.classList.add('active');
                                                    } else {
                                                        container.classList.remove('active');
                                                    }
                                                }
                                            }}
                                        >
                                            <div className="place-dropdown-content">
                                                <span className="place-dropdown-icon">🏙️</span>
                                                <div className="place-dropdown-text">
                                                    {profileData.birth_place || `Select city in ${selectedCountry.name}`}
                                                </div>
                                                <span className={`place-dropdown-arrow ${showSuggestions ? 'up' : 'down'}`}>
                                                    {showSuggestions ? '▲' : '▼'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Search Input */}
                                        {showSuggestions && (
                                            <div className="place-search-container">
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => handleSearchQueryChange(e.target.value)}
                                                    onKeyDown={handlePlaceInputKeyDown}
                                                    placeholder={`Type city in ${selectedCountry.name}...`}
                                                    className="place-search-input"
                                                    autoComplete="off"
                                                    autoFocus
                                                />
                                                {isLoadingPlaces && (
                                                    <div className="place-loading-icon">
                                                        <span style={{ animation: 'spin 1s linear infinite' }}>🔄</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Dropdown Menu */}
                                        {showSuggestions && (
                                            <div className="place-dropdown-menu" role="listbox">
                                                {placeSuggestions.length > 0 ? (
                                                    placeSuggestions.map((place, index) => (
                                                        <div
                                                            key={place.place_id || index}
                                                            className="place-dropdown-item"
                                                            onClick={() => handlePlaceSelect(place)}
                                                            onKeyDown={(e) => handlePlaceKeyDown(e, place)}
                                                            tabIndex={0}
                                                            role="option"
                                                            aria-selected={index === 0}
                                                        >
                                                            <div className="place-item-content">
                                                                <div className="place-item-icon">📍</div>
                                                                <div className="place-item-details">
                                                                    <div className="place-item-main">
                                                                        {place.main_text}
                                                                        {place.importance > 0.5 && (
                                                                            <span className="place-item-popular">⭐</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="place-item-secondary">
                                                                        {place.secondary_text}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : searchQuery.length > 2 && !isLoadingPlaces ? (
                                                    <div className="place-dropdown-no-results">
                                                        <div className="no-results-icon">🔍</div>
                                                        <div className="no-results-text">
                                                            No cities found for "{searchQuery}" in {selectedCountry.name}
                                                            <br />
                                                            <small>Try different spelling or nearby city</small>
                                                        </div>
                                                    </div>
                                                ) : searchQuery.length === 0 ? (
                                                    <div className="place-dropdown-hint">
                                                        <div className="hint-icon">💡</div>
                                                        <div className="hint-text">
                                                            Start typing to search cities in {selectedCountry.name}...
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-buttons">

                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span>⏳</span>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>

                                <span>Update Profile</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {showDatePicker && (
                <div className="picker-overlay" onClick={(e) => e.target === e.currentTarget && setShowDatePicker(false)}>
                    <div className="scroll-picker-modal">
                        <div className="scroll-picker-header">
                            <h3>Select Date of Birth</h3>
                        </div>

                        <div className="scroll-picker-content">
                            <div className="scroll-wheels">
                                {/* Day Wheel */}
                                <div className="scroll-wheel">
                                    <div className="wheel-label">Day</div>
                                    <div className="wheel-container">
                                        {days.slice(0, getDaysInMonth()).map(day => (
                                            <div
                                                key={day}
                                                className={`wheel-item ${profileData.birth_day == day ? 'selected' : ''}`}
                                                onClick={() => handleProfileDataChange('birth_day', day)}
                                            >
                                                {day.toString().padStart(2, '0')}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Month Wheel */}
                                <div className="scroll-wheel">
                                    <div className="wheel-label">Month</div>
                                    <div className="wheel-container">
                                        {months.map(month => (
                                            <div
                                                key={month.value}
                                                className={`wheel-item ${profileData.birth_month == month.value ? 'selected' : ''}`}
                                                onClick={() => handleProfileDataChange('birth_month', month.value)}
                                            >
                                                {month.name.substring(0, 3).toUpperCase()}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Year Wheel */}
                                <div className="scroll-wheel">
                                    <div className="wheel-label">Year</div>
                                    <div className="wheel-container">
                                        {years.map(year => (
                                            <div
                                                key={year}
                                                className={`wheel-item ${profileData.birth_year == year ? 'selected' : ''}`}
                                                onClick={() => handleProfileDataChange('birth_year', year)}
                                            >
                                                {year}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="picker-buttons">
                            <button
                                className="picker-btn picker-btn-cancel"
                                onClick={() => setShowDatePicker(false)}
                            >
                                CANCEL
                            </button>
                            <button
                                className="picker-btn picker-btn-ok"
                                onClick={() => setShowDatePicker(false)}
                                disabled={!profileData.birth_day || !profileData.birth_month || !profileData.birth_year}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {showTimePicker && (
                <div className="picker-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        setShowTimePicker(false);
                        setSelectedHour(null);
                        setSelectedMinute(null);
                    }
                }}>
                    <div className="scroll-picker-modal">
                        {/* Header */}
                        <div className="scroll-picker-header">
                            <h3>Select Birth Time In 24H</h3>
                        </div>

                        {/* Scroll Wheels Content */}
                        <div className="scroll-picker-content">
                            <div className="scroll-wheels">
                                {/* Hour Wheel */}
                                <div className="scroll-wheel">
                                    <div className="wheel-label">HOUR</div>
                                    <div className="wheel-container">
                                        {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map((hour) => (
                                            <div
                                                key={`hour-${hour}`}
                                                className={`wheel-item ${selectedHour === hour ? 'selected' : ''}`}
                                                onClick={() => setSelectedHour(hour)}
                                            >
                                                {hour}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Minute Wheel */}
                                <div className="scroll-wheel">
                                    <div className="wheel-label">MINUTE</div>
                                    <div className="wheel-container">
                                        {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map((minute) => (
                                            <div
                                                key={`minute-${minute}`}
                                                className={`wheel-item ${selectedMinute === minute ? 'selected' : ''}`}
                                                onClick={() => setSelectedMinute(minute)}
                                            >
                                                {minute}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="picker-buttons">
                            <button
                                className="picker-btn picker-btn-cancel"
                                onClick={() => {
                                    setShowTimePicker(false);
                                    setSelectedHour(null);
                                    setSelectedMinute(null);
                                }}
                            >
                                CANCEL
                            </button>
                            <button
                                className="picker-btn picker-btn-ok"
                                onClick={() => {
                                    if (selectedHour !== null && selectedMinute !== null) {
                                        const formattedTime = `${selectedHour}:${selectedMinute}`;
                                        console.log('⏰ Time selected:', formattedTime);

                                        handleProfileDataChange('birth_time', formattedTime);  // ✅ Changed to birth_time

                                        setShowTimePicker(false);
                                        setSelectedHour(null);
                                        setSelectedMinute(null);
                                    }
                                }}
                                disabled={selectedHour === null || selectedMinute === null}
                            >
                                OK
                            </button>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Profile;
