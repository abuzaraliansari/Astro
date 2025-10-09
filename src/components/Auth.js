// ================================
// IMPORTS & DEPENDENCIES  
// ================================
import React, { useState, useEffect, useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Capacitor } from '@capacitor/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { googleSignup, googleLogin, searchPlaces, createSession, endSession, getAllCountries, getPopularCountries, getCountriesByRegion, getAllRegions } from '../api';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// ================================
// MAIN COMPONENT
// ================================
const Auth = ({ onLoginSuccess }) => {
  // ================================
  // HOOKS & BASIC STATE
  // ================================
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Core auth state
  const [isSignup, setIsSignup] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [googleCredential, setGoogleCredential] = useState(null);


  // Add these with other state declarations
  const [placeCountries, setPlaceCountries] = useState([]);
  const [phoneCountries, setPhoneCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [showPhoneCodeDropdown, setShowPhoneCodeDropdown] = useState(false);


  // ================================
  // MODAL & UI STATE  
  // ================================
  const [showBirthDetailsPopup, setShowBirthDetailsPopup] = useState(false);
  const [showWaitingListModal, setShowWaitingListModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [googleUserInfo, setGoogleUserInfo] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [clockMode, setClockMode] = useState('hour');

  const [showReligionDropdown, setShowReligionDropdown] = useState(false);
  // ================================
  // LOCATION & SEARCH STATE
  // ================================
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'India',
    code: 'in',
    flag: '🇮🇳'
  });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  // Add this with other state declarations
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ================================
  // REFS & CONSTANTS
  // ================================
  const placeInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const contactNumber = '+91-9990553762';

  // ================================
  // BIRTH DETAILS STATE
  // ================================
  const [birthDetails, setBirthDetails] = useState({
    full_name: '',
    religion: 'Hindu',
    birth_day: '',
    birth_month: '',
    birth_year: '',
    birth_time: '',
    birth_place: '',
    timezone: 'Asia/Kolkata',
    country: 'India',
    country_code: 'in',
    mobile_number: '',          // ✅ ADD THIS
    country_code_no: '+91'      // ✅ ADD THIS
  });


  // ================================
  // DATA CONSTANTS
  // ================================

  // ✅ NEW: Religion options
  const religions = [
    { value: 'Hindu', label: 'Hindu', icon: '🕉️' },
    { value: 'Islam', label: 'Islam', icon: '☪️' },
    { value: 'Christianity', label: 'Christianity', icon: '✝️' },
    { value: 'Sikhism', label: 'Sikhism', icon: '☬' },
    { value: 'Buddhism', label: 'Buddhism', icon: '☸️' },
    { value: 'Jainism', label: 'Jainism', icon: '🤚' },
    { value: 'Judaism', label: 'Judaism', icon: '✡️' },
    { value: 'Zoroastrianism', label: 'Zoroastrianism', icon: '🔥' },
    { value: 'Bahai', label: 'Baháʼí', icon: '⭐' },
    { value: 'Other', label: 'Other', icon: '🌍' }
  ];

  // Country options
  const countries = [
    { name: 'India', code: 'in', flag: '🇮🇳' },
    { name: 'United States', code: 'us', flag: '🇺🇸' },
    { name: 'United Kingdom', code: 'gb', flag: '🇬🇧' },
    { name: 'Canada', code: 'ca', flag: '🇨🇦' },
    { name: 'Australia', code: 'au', flag: '🇦🇺' },
    { name: 'Germany', code: 'de', flag: '🇩🇪' },
    { name: 'France', code: 'fr', flag: '🇫🇷' },
    { name: 'Italy', code: 'it', flag: '🇮🇹' },
    { name: 'Spain', code: 'es', flag: '🇪🇸' },
    { name: 'Netherlands', code: 'nl', flag: '🇳🇱' },
    { name: 'Switzerland', code: 'ch', flag: '🇨🇭' },
    { name: 'Sweden', code: 'se', flag: '🇸🇪' },
    { name: 'Norway', code: 'no', flag: '🇳🇴' },
    { name: 'Denmark', code: 'dk', flag: '🇩🇰' },
    { name: 'Japan', code: 'jp', flag: '🇯🇵' },
    { name: 'South Korea', code: 'kr', flag: '🇰🇷' },
    { name: 'China', code: 'cn', flag: '🇨🇳' },
    { name: 'Singapore', code: 'sg', flag: '🇸🇬' },
    { name: 'Malaysia', code: 'my', flag: '🇲🇾' },
    { name: 'Thailand', code: 'th', flag: '🇹🇭' },
    { name: 'UAE', code: 'ae', flag: '🇦🇪' },
    { name: 'Saudi Arabia', code: 'sa', flag: '🇸🇦' },
    { name: 'South Africa', code: 'za', flag: '🇿🇦' },
    { name: 'Brazil', code: 'br', flag: '🇧🇷' },
    { name: 'Mexico', code: 'mx', flag: '🇲🇽' },
    { name: 'Argentina', code: 'ar', flag: '🇦🇷' },
    { name: 'New Zealand', code: 'nz', flag: '🇳🇿' }
  ];

  // Date picker options
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // ================================
  // PLATFORM CONFIGURATION
  // ================================
  const WEB_CLIENT_ID = process.env.REACT_APP_GOOGLE_WEB_CLIENT_ID ||
    "1039681193782-obmnqsvo8dvct21i1fum6dov74i0iqn2.apps.googleusercontent.com";
  const isNative = Capacitor.isNativePlatform && Capacitor.isNativePlatform();

  // ================================
  // VALIDATION FUNCTIONS
  // ================================
  const validateBirthDetails = () => {
    const required = ['full_name', 'religion', 'birth_day', 'birth_month', 'birth_year', 'birth_time', 'birth_place'];
    const missing = required.filter(field => !birthDetails[field]);

    if (missing.length > 0) {
      setMessage(`⚠️ Please fill in all required fields: ${missing.join(', ')}`);
      return false;
    }
    return true;
  };
  // ✅ NEW: Religion selection handler
  const handleReligionSelect = (religion) => {
    handleBirthDetailsChange('religion', religion.value);
    setShowReligionDropdown(false);
  };

  const toggleReligionDropdown = () => {
    setShowReligionDropdown(!showReligionDropdown);
  };


  // ✅ NEW: Handle Registration Completion
  // ✅ NEW: Handle Registration Completion with DEBUG LOGS
  const handleRegistrationComplete = async () => {
    console.log('🚀 ========== REGISTRATION START ==========');
    console.log('📋 Current birthDetails:', birthDetails);
    console.log('📍 Selected place:', selectedPlace);
    console.log('🌍 Selected country:', selectedCountry);
    console.log('🔑 Google credential:', googleCredential ? 'EXISTS' : 'MISSING');

    // ✅ Step 1: Validate Full Name
    console.log('✓ Step 1: Validating full name...');
    if (!birthDetails.full_name || !birthDetails.full_name.trim()) {
      console.error('❌ Validation failed: Full name is empty');
      setMessage('Please enter your full name');
      return;
    }
    console.log('✅ Full name valid:', birthDetails.full_name);

    // ✅ Step 2: Validate Religion
    console.log('✓ Step 2: Validating religion...');
    if (!birthDetails.religion) {
      console.error('❌ Validation failed: Religion not selected');
      setMessage('Please select your religion');
      return;
    }
    console.log('✅ Religion valid:', birthDetails.religion);

    // ✅ Step 3: Validate Date
    console.log('✓ Step 3: Validating birth date...');
    console.log('Date values:', {
      day: birthDetails.birth_day,
      month: birthDetails.birth_month,
      year: birthDetails.birth_year
    });

    if (!isValidDate()) {
      console.error('❌ Validation failed: Invalid birth date');
      setMessage('Please select a valid birth date');
      return;
    }
    console.log('✅ Birth date valid');

    // ✅ Step 4: Validate Time
    console.log('✓ Step 4: Validating birth time...');
    if (!birthDetails.birth_time || !birthDetails.birth_time.trim()) {
      console.error('❌ Validation failed: Birth time is empty');
      setMessage('Please select your birth time');
      return;
    }
    console.log('✅ Birth time valid:', birthDetails.birth_time);

    // ✅ Step 5: Validate Place
    console.log('✓ Step 5: Validating birth place...');
    console.log('Place validation:', {
      birthPlace: birthDetails.birth_place,
      selectedPlace: selectedPlace,
      hasCoordinates: selectedPlace ? {
        lat: selectedPlace.latitude,
        lng: selectedPlace.longitude
      } : 'No coordinates'
    });

    if (!birthDetails.birth_place || !birthDetails.birth_place.trim() || !selectedPlace) {
      console.error('❌ Validation failed: Birth place not selected');
      setMessage('Please select your birth place');
      return;
    }
    console.log('✅ Birth place valid');

    console.log('✅ All validations passed! Proceeding with registration...');

    setIsLoading(true);
    setMessage('Completing registration...');

    try {
      // ✅ Step 6: Format Birth Date
      console.log('✓ Step 6: Formatting birth date...');
      const birthDate = `${birthDetails.birth_year}-${birthDetails.birth_month.toString().padStart(2, '0')}-${birthDetails.birth_day.toString().padStart(2, '0')}`;
      console.log('✅ Formatted birth date:', birthDate);

      // ✅ Step 7: Get Referral Code
      console.log('✓ Step 7: Checking for referral code...');
      const pendingReferralCode = localStorage.getItem('pending_referral_code');
      console.log('Referral code:', pendingReferralCode || 'None');

      // ✅ Step 8: Prepare Registration Data
      console.log('✓ Step 8: Preparing registration data...');
      const registrationData = {
        token: googleCredential,
        profile: {
          full_name: birthDetails.full_name.trim(),
          religion: birthDetails.religion,
          birth_date: birthDate,
          birth_time: birthDetails.birth_time,
          birth_place: selectedPlace?.description || birthDetails.birth_place,
          country_code: selectedPlace?.country_code || selectedCountry.code.toUpperCase(),
          latitude: selectedPlace?.latitude || null,
          longitude: selectedPlace?.longitude || null,
          mobile_number: birthDetails.mobile_number || null,
          country_code_no: birthDetails.country_code_no || '+91',
          referredBy: pendingReferralCode || null
        }
      };

      console.log('📦 Registration data prepared:');
      console.log(JSON.stringify(registrationData, null, 2));

      // ✅ Step 9: Call Signup API
      console.log('✓ Step 9: Calling googleSignup API...');
      console.log('API call parameters:', {
        credential: googleCredential ? 'EXISTS (length: ' + googleCredential.length + ')' : 'MISSING',
        profile: registrationData.profile
      });

      const response = await googleSignup(googleCredential, registrationData.profile);

      console.log('✅ API Response received:', response);
      console.log('Response data:', response.data);

      // ✅ Step 10: Handle Success Response
      if (response.data.success) {
        console.log('🎉 Registration successful!');
        console.log('User data:', response.data.user);
        console.log('Waiting list status:', response.data.waitingList);

        // Clear referral code after successful use
        localStorage.removeItem('pending_referral_code');
        console.log('✅ Referral code cleared from localStorage');

        if (response.data.waitingList) {
          console.log('📋 User added to waiting list');
          setShowWaitingListModal(true);
          setShowBirthDetailsPopup(false);
          setMessage(response.data.message);

          if (response.data.userData?.referrerMilestoneReached) {
            console.log('🎉 Referrer reached milestone!', response.data.userData.milestoneDetails);
          }
        } else {
          console.log('✅ User activated - proceeding to home');
          setUser(response.data.user);
          setMessage(response.data.message);

          if (onLoginSuccess) {
            console.log('✅ Calling onLoginSuccess callback');
            onLoginSuccess(response.data.user);
          }

          setShowBirthDetailsPopup(false);
          console.log('🏠 Navigating to home in 2 seconds...');
          setTimeout(() => navigate('/home'), 2000);
        }

        // Cleanup
        console.log('🧹 Cleaning up form data...');
        clearBirthDetails();
        setSelectedPlace(null);
        setGoogleCredential(null);
        setGoogleUserInfo(null);
        console.log('✅ Cleanup complete');

      } else {
        console.error('❌ Registration failed - success: false');
        throw new Error(response.data.error || 'Registration failed');
      }

    } catch (error) {
      console.error('💥 ========== REGISTRATION ERROR ==========');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);

      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        console.error('Error response headers:', error.response.headers);
      }

      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('📋 Processing error response data:', errorData);

        if (errorData.waitingList) {
          console.log('📋 Error: User on waiting list');
          setShowWaitingListModal(true);
          setShowBirthDetailsPopup(false);
          setMessage(errorData.message);
        } else if (errorData.userExists) {
          console.log('👤 Error: User already exists');
          setMessage(errorData.message);
          setShowBirthDetailsPopup(false);

          setTimeout(() => {
            console.log('🔄 Switching to login mode...');
            setIsSignup(false);
            setMessage('Account exists. Switched to login mode.');
          }, 3000);
        } else {
          console.error('❌ Other error:', errorData.message);
          setMessage(errorData.message || 'Registration failed');
        }
      } else {
        console.error('🌐 Network error - no response from server');
        setMessage('Network error. Please check your connection.');
      }

      console.error('========== ERROR HANDLING COMPLETE ==========');
    } finally {
      console.log('🏁 Registration process finished');
      setIsLoading(false);
    }
  };



  // ================================
  // CLOCK HELPER FUNCTIONS
  // ================================
  const getHourAngle = () => {
    if (!birthDetails.birth_time) return 0;
    const [hours, minutes] = birthDetails.birth_time.split(':');
    const hour12 = parseInt(hours) % 12;
    return (hour12 * 30) + (parseInt(minutes) * 0.5);
  };

  const getMinuteAngle = () => {
    if (!birthDetails.birth_time) return 0;
    const [hours, minutes] = birthDetails.birth_time.split(':');
    return parseInt(minutes) * 6;
  };

  const getTimePeriod = () => {
    if (!birthDetails.birth_time) return 'AM';
    const [hours] = birthDetails.birth_time.split(':');
    return parseInt(hours) >= 12 ? 'PM' : 'AM';
  };

  const getSelectedHour = () => {
    if (!birthDetails.birth_time) return 12;
    const [hours] = birthDetails.birth_time.split(':');
    const hour24 = parseInt(hours);
    return hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  };

  const getSelectedMinute = () => {
    if (!birthDetails.birth_time) return 0;
    const [hours, minutes] = birthDetails.birth_time.split(':');
    return parseInt(minutes);
  };

  const formatTimeDisplay = (timeString) => {
    if (!timeString) return 'Select Birth Time';
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`;
  };

  // ================================
  // DATE & TIME HANDLERS
  // ================================
  const handleHourClick = (hour) => {
    const currentPeriod = getTimePeriod();
    let hour24 = hour;

    if (currentPeriod === 'PM' && hour !== 12) {
      hour24 = hour + 12;
    } else if (currentPeriod === 'AM' && hour === 12) {
      hour24 = 0;
    }

    const currentMinute = birthDetails.birth_time ?
      birthDetails.birth_time.split(':')[1] : '00';

    const newTime = `${hour24.toString().padStart(2, '0')}:${currentMinute}`;
    handleBirthDetailsChange('birth_time', newTime);
    setClockMode('minute');
  };

  const handleMinuteClick = (minute) => {
    const currentHour = birthDetails.birth_time ?
      birthDetails.birth_time.split(':')[0] : '12';

    const newTime = `${currentHour}:${minute.toString().padStart(2, '0')}`;
    handleBirthDetailsChange('birth_time', newTime);
  };

  const toggleAMPM = (period) => {
    if (!birthDetails.birth_time) {
      handleBirthDetailsChange('birth_time', period === 'AM' ? '09:00' : '21:00');
      return;
    }

    const [hours, minutes] = birthDetails.birth_time.split(':');
    let newHour = parseInt(hours);

    if (period === 'AM' && newHour >= 12) {
      newHour -= 12;
    } else if (period === 'PM' && newHour < 12) {
      newHour += 12;
    }

    const formattedTime = `${newHour.toString().padStart(2, '0')}:${minutes}`;
    handleBirthDetailsChange('birth_time', formattedTime);
  };

  // ================================
  // LOCATION SEARCH FUNCTIONS
  // ================================
  const handleSearchQueryChange = async (value) => {
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value || value.length < 2) {
      setPlaceSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoadingPlaces(true);
      try {
        const response = await searchPlaces(value, selectedCountry.code.toUpperCase());
        if (response.data && response.data.success) {
          const suggestions = response.data.places || [];
          setPlaceSuggestions(suggestions);
        } else {
          setPlaceSuggestions([]);
        }
      } catch (error) {
        console.error('❌ Place search error:', error);
        setPlaceSuggestions([]);
      } finally {
        setIsLoadingPlaces(false);
      }
    }, 300);
  };

  const handlePlaceSelect = (place) => {
    try {
      console.log('📍 Place selected with coordinates:', {
        description: place.description,
        latitude: place.latitude,
        longitude: place.longitude,
        country: place.country_code
      });

      // Store full place object with coordinates
      setSelectedPlace(place);

      // Format display text
      let formattedPlace;
      if (place.main_text && place.secondary_text) {
        const mainText = place.main_text.trim();
        const secondaryText = place.secondary_text.trim();
        formattedPlace = `${mainText}, ${secondaryText}`;
      } else {
        formattedPlace = place.description || place.formatted_address || place.main_text || 'Selected Location';
      }

      // ✅ FIXED: Use birth_place with underscore
      handleBirthDetailsChange('birth_place', formattedPlace);
      setShowSuggestions(false);
      setSearchQuery(formattedPlace);  // ✅ Update search query to show selected place

      setTimeout(() => {
        setPlaceSuggestions([]);
      }, 200);
    } catch (error) {
      console.error('Error selecting place:', error);
      setPlaceSuggestions([]);
      setShowSuggestions(false);
    }
  };



  const handlePlaceKeyDown = (event, place) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlePlaceSelect(place);
    } else if (event.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handlePlaceInputKeyDown = (event) => {
    if (event.key === 'Escape') {
      setShowSuggestions(false);
      setPlaceSuggestions([]);
    }
  };

  // ================================
  // COUNTRY SELECTION FUNCTIONS
  // ================================
  const handleCountrySelect = (country) => {
    console.log('🌍 Country selected:', country);
    setSelectedCountry(country);
    setShowCountryDropdown(false);

    // ✅ FIXED: Update birthDetails with country info
    setBirthDetails(prev => ({
      ...prev,
      country: country.name,
      country_code: country.code
    }));

    // Clear place selection when country changes
    handleBirthDetailsChange('birth_place', '');
    setPlaceSuggestions([]);
    setSearchQuery('');
    setSelectedPlace(null);
  };


  const toggleCountryDropdown = () => {
    setShowCountryDropdown(!showCountryDropdown);
  };

  // ================================
  // FORM VALIDATION FUNCTIONS
  // ================================
  const isValidDate = () => {
    const { birth_day, birth_month, birth_year } = birthDetails;
    if (!birth_day || !birth_month || !birth_year) return false;

    const day = parseInt(birth_day);
    const month = parseInt(birth_month);
    const year = parseInt(birth_year);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;
  };

  const getDaysInMonth = () => {
    if (!birthDetails.birth_month || !birthDetails.birth_year) return 31;
    const month = parseInt(birthDetails.birth_month);
    const year = parseInt(birthDetails.birth_year);
    return new Date(year, month, 0).getDate();
  };

  // ================================
  // BIRTH DETAILS MANAGEMENT
  // ================================
  const handleBirthDetailsChange = (field, value) => {
    if (field === 'country') {
      // Assume you have a countries list or object to find country code by name
      const selectedCountry = countries.find(c => c.name === value);
      setBirthDetails(prev => ({
        ...prev,
        country: value,
        country_code: selectedCountry ? selectedCountry.code : '' // set country code too
      }));
    } else {
      setBirthDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };


  const clearBirthDetails = () => {
    setBirthDetails({
      full_name: '',  // ✅ FIXED: with underscore
      religion: 'Hindu',
      birth_day: '',  // ✅ FIXED: with underscore
      birth_month: '',  // ✅ FIXED: with underscore
      birth_year: '',  // ✅ FIXED: with underscore
      birth_time: '',  // ✅ FIXED: with underscore
      birth_place: '',  // ✅ FIXED: with underscore
      timezone: 'Asia/Kolkata',
      country: 'India',
      country_code: 'in'
    });
    setPlaceSuggestions([]);
    setShowSuggestions(false);
    setSelectedPlace(null);
    setSearchQuery('');  // ✅ Clear search query too
  };



  // ================================
  // ✅ UPDATED GOOGLE AUTHENTICATION - INTEGRATES WITH YOUR BACKEND
  // ================================
  // UPDATED GOOGLE AUTHENTICATION - INTEGRATES WITH YOUR BACKEND + SESSION CREATION
  const handleGoogleAuth = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setMessage('Google authentication failed. Please try again.');
      return;
    }

    setIsLoading(true);
    setMessage('Connecting to the cosmos...');
    console.log('Starting Google authentication...');

    try {
      // Store the credential for potential registration
      setGoogleCredential(credentialResponse.credential);

      // Decode the JWT token to get user info for display purposes
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      const userInfo = JSON.parse(jsonPayload);
      console.log('Google user info:', userInfo);
      setGoogleUserInfo(userInfo);

      // Try login first (your existing googleLogin function handles user existence check)
      try {
        console.log('Attempting login first...');
        const response = await googleLogin(credentialResponse.credential);

        if (response.data.success) {
          // Login successful - user exists and is active
          console.log('✅ Login successful!');
          console.log('👤 User data:', response.data.user);

          setUser(response.data.user);
          setMessage(response.data.message);

          // ✅ NEW: CREATE SESSION AFTER SUCCESSFUL LOGIN
          try {
            console.log('🔐 Creating session for user:', response.data.user.id);
            // ✅ CORRECT - Use userId (database ID)
            const sessionResponse = await createSession(response.data.user.userId);


            if (sessionResponse.data.success) {
              console.log('✅ Session created successfully:', {
                sessionId: sessionResponse.data.session.sessionId,
                userName: sessionResponse.data.session.userName
              });

              // Store session info in localStorage
              localStorage.setItem('astroguru_session_id', sessionResponse.data.session.sessionId);
              localStorage.setItem('astroguru_user_id', response.data.user.id);
            } else {
              console.warn('⚠️ Session creation failed, but login successful');
            }
          } catch (sessionError) {
            console.error('❌ Session creation error:', sessionError);
            // Don't block login if session creation fails
            console.warn('⚠️ Continuing login without session tracking');
          }

          // Continue with login flow
          if (onLoginSuccess) {
            onLoginSuccess(response.data.user);
          }

          setTimeout(() => navigate('/home'), 1500);
        }
      } catch (loginError) {
        console.log('Login attempt result:', loginError.response?.data);

        if (loginError.response?.data) {
          const errorData = loginError.response.data;

          if (errorData.waitingList) {
            // User exists but inactive - show waiting list modal
            console.log('User exists but not active - showing waiting list modal');
            setShowWaitingListModal(true);
            setMessage('');
          } else if (errorData.needsSignup) {
            // User doesn't exist - show registration modal
            console.log('New user - showing registration modal');
            setBirthDetails((prev) => ({ ...prev, fullname: userInfo.name }));
            setShowBirthDetailsPopup(true);
            setMessage('');
          } else {
            // Other login errors
            setMessage(errorData.message || 'Login failed');
          }
        } else {
          // Network or other errors
          setMessage('Network error. Please check your connection.');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setMessage('Authentication failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };


  const handleNativeGoogleAuth = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      await GoogleAuth.initialize({
        clientId: WEB_CLIENT_ID,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });

      const result = await GoogleAuth.signIn();
      const credential = result.authentication?.idToken || result.idToken;

      if (!credential) {
        throw new Error('No ID token received from Google Auth');
      }

      // Use the same logic as web Google auth
      await handleGoogleAuth({ credential });

    } catch (err) {
      console.error('❌ Native Google Auth Failed:', err);

      if (err.message?.includes('popup_closed_by_user')) {
        setMessage('⚠️ Sign-in was cancelled. Please try again.');
      } else if (err.message?.includes('SIGN_IN_CANCELLED')) {
        setMessage('⚠️ Sign-in was cancelled by user.');
      } else if (err.message?.includes('NETWORK_ERROR')) {
        setMessage('❌ Network error. Please check your internet connection.');
      } else {
        setMessage(`❌ Google authentication failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const performLogin = async (credential) => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await googleLogin(credential);

      if (response.data.success) {
        setUser(response.data.user);
        setMessage(response.data.message);
        if (onLoginSuccess) onLoginSuccess(response.data.user);
        setTimeout(() => navigate('/home'), 1500);
      }
    } catch (err) {
      console.error('❌ Login error:', err);

      if (err.response?.data) {
        const errorData = err.response.data;

        if (errorData.waitingList) {
          setShowWaitingListModal(true);
          setMessage('');
        } else if (errorData.needsSignup && !isSignup) {
          setMessage(`❌ ${errorData.message}`);
          setTimeout(() => {
            setIsSignup(true);
            setMessage('Switched to signup mode. Please create an account first.');
          }, 3000);
        } else {
          setMessage(`❌ ${errorData.message || 'Login failed'}`);
        }
      } else {
        setMessage('❌ Network error. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ================================
  // BIRTH DETAILS SUBMISSION
  // ================================
  const handleBirthDetailsSubmit = async () => {
    // Validation
    if (!birthDetails.full_name.trim()) {
      setMessage('❌ Please enter your full name');
      return;
    }
    if (!isValidDate()) {
      setMessage('❌ Please select a valid birth date');
      return;
    }
    if (!birthDetails.birth_time.trim()) {
      setMessage('❌ Please enter your birth time');
      return;
    }
    if (!birthDetails.birth_place.trim()) {
      setMessage('❌ Please enter your birth place');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const birthDate = `${birthDetails.birth_year}-${birthDetails.birth_month.toString().padStart(2, '0')}-${birthDetails.birth_day.toString().padStart(2, '0')}`;
      const profile = {
        full_name: birthDetails.full_name.trim(),
        birth_date: birthDate,
        birth_time: birthDetails.birth_time,
        birth_place: birthDetails.birth_place.trim(),
        timezone: birthDetails.timezone
      };

      const response = await googleSignup(googleCredential, profile);

      if (response.data.success) {
        if (response.data.waitingList) {
          setShowWaitingListModal(true);
          setShowBirthDetailsPopup(false);
          clearBirthDetails();
          setGoogleCredential(null);
        } else {
          setUser(response.data.user);
          setMessage(response.data.message);
          if (onLoginSuccess) onLoginSuccess(response.data.user);
          setShowBirthDetailsPopup(false);
          clearBirthDetails();
          setGoogleCredential(null);
          setTimeout(() => navigate('/home'), 2000);
        }
      }
    } catch (err) {
      console.error('❌ Signup error:', err);

      if (err.response?.data) {
        const errorData = err.response.data;

        if (errorData.waitingList) {
          setShowWaitingListModal(true);
          setShowBirthDetailsPopup(false);
          clearBirthDetails();
          setGoogleCredential(null);
        } else if (errorData.userExists) {
          setMessage(`❌ ${errorData.message}`);
          setShowBirthDetailsPopup(false);
          clearBirthDetails();
          setGoogleCredential(null);
          setTimeout(() => {
            setIsSignup(false);
            setMessage('Account exists. Switched to login mode.');
          }, 3000);
        } else {
          setMessage(`❌ ${errorData.message || 'Signup failed'}`);
        }
      } else {
        setMessage('❌ Network error. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ================================
  // MODAL CONTROL FUNCTIONS
  // ================================
  const closeBirthDetailsPopup = () => {
    setShowBirthDetailsPopup(false);
    clearBirthDetails();
    setGoogleCredential(null);
    setGoogleUserInfo(null);
    setMessage('');
  };

  const closeWaitingListModal = () => {
    setShowWaitingListModal(false);
    setGoogleCredential(null);
    setGoogleUserInfo(null);
  };

  const handleModeChange = (newMode) => {
    setIsSignup(newMode);
    setMessage('');
    if (showBirthDetailsPopup) closeBirthDetailsPopup();
    if (showWaitingListModal) closeWaitingListModal();
  };

  const copyContactNumber = () => {
    navigator.clipboard.writeText(contactNumber);
    alert('📞 Contact number copied to clipboard!');
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      // Get all dropdown containers
      const countryDropdown = document.querySelector('.country-dropdown-container:not(.phone-code-dropdown)');
      const placeDropdown = document.querySelector('.place-dropdown-container');
      const religionDropdown = document.querySelector('.religion-dropdown-container');
      const phoneCodeDropdown = document.querySelector('.phone-code-dropdown'); // ✅ Specific class

      if (countryDropdown && !countryDropdown.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (placeDropdown && !placeDropdown.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (religionDropdown && !religionDropdown.contains(event.target)) {
        setShowReligionDropdown(false);
      }
      if (phoneCodeDropdown && !phoneCodeDropdown.contains(event.target)) {
        setShowPhoneCodeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);



  // Load countries from backend
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoadingCountries(true);
        console.log('🌍 Loading countries from backend...');

        // Use getAllCountries() - returns all countries with phone codes, flags, etc.
        const response = await getAllCountries();

        if (response.data.success) {
          const countries = response.data.countries;

          // Set both lists (for place selector and phone code selector)
          setPlaceCountries(countries);
          setPhoneCountries(countries);

          console.log('✅ Countries loaded:', countries.length);
        }
      } catch (error) {
        console.error('❌ Failed to load countries:', error);

        // Fallback to minimal list if backend fails
        const fallback = [
          { name: 'India', flag: '🇮🇳', code: '+91', iso: 'IN' },
          { name: 'United States', flag: '🇺🇸', code: '+1', iso: 'US' },
          { name: 'United Kingdom', flag: '🇬🇧', code: '+44', iso: 'GB' }
        ];
        setPlaceCountries(fallback);
        setPhoneCountries(fallback);
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountries();
  }, []);


  useEffect(() => {
    // Check for referral code in URL (e.g., ?ref=K0ABUZARSUI7)
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');

    if (refCode) {
      console.log('🎫 Referral code detected in URL:', refCode);
      localStorage.setItem('pending_referral_code', refCode);
      setMessage(`🎁 Welcome! Signing up with referral code: ${refCode}`);

      // Optional: Remove the ref parameter from URL to clean it up
      const url = new URL(window.location);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url);
    }
  }, []);

  // ================================
  // USEEFFECT HOOKS
  // ================================

  // Body class management for modals
  useEffect(() => {
    if (showDatePicker || showTimePicker) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showDatePicker, showTimePicker]);

  // Google Auth initialization
  useEffect(() => {
    const initializeGoogleAuth = async () => {
      if (isNative) {
        try {
          await GoogleAuth.initialize({
            clientId: WEB_CLIENT_ID,
            scopes: ['profile', 'email'],
            grantOfflineAccess: true,
          });
        } catch (error) {
          console.error('❌ GoogleAuth initialization error:', error);
          setMessage('⚠️ Google Auth initialization failed. Please check your setup.');
        }
      }
    };
    initializeGoogleAuth();
  }, [isNative, WEB_CLIENT_ID]);

  // ================================
  // RENDER COMPONENT
  // ================================
  return (
    <div className="auth-container">
      {/* Background Elements */}
      <div className="bg-element-auth sparkle">✨</div>
      <div className="bg-element-auth moon">🌙</div>
      <div className="bg-element-auth crystal">🔮</div>
      <div className="bg-element-auth star">⭐</div>

      {/* Main Auth Container */}
      <div className="auth-main-container">
        {/* Header Section */}
        <div className="auth-header">
          <div className="auth-logo">⭐</div>
          <h1 className="auth-title">ASTROGURU</h1>
          <p className="auth-subtitle">✨ Your Gateway to Cosmic Wisdom ✨</p>
        </div>

        {/* Toggle Section */}
        <div className="auth-toggle">
          <button
            onClick={() => handleModeChange(true)}
            className={`toggle-btn ${isSignup ? 'active' : ''}`}
          >
            📝 Sign Up
          </button>
          <button
            onClick={() => handleModeChange(false)}
            className={`toggle-btn ${!isSignup ? 'active' : ''}`}
          >
            🔑 Login
          </button>
        </div>

        {/* Message Section */}
        {message && (
          <div className={`status-message ${message.includes('❌') ? 'error' :
            message.includes('⚠️') ? 'warning' : 'success'
            }`}>
            {message}
          </div>
        )}

        {/* Google Auth Section */}
        <div className="google-auth-container">
          <p className="auth-instruction">
            {isLoading ?
              '🌟 Connecting to the cosmos...' :
              isSignup ? '🚀 Sign up with Google' : '🔑 Sign in with Google'
            }
          </p>

          <div className="google-login-wrapper">
            {isNative ? (
              <button
                className="google-native-btn"
                onClick={handleNativeGoogleAuth}
                disabled={isLoading}
              >
                <span style={{ marginRight: 8, fontSize: 20 }}>🌐</span>
                {isSignup ? 'Sign up with Google' : 'Sign in with Google'}
              </button>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleAuth}
                onError={(error) => {
                  console.error('❌ Web Google Auth Failed:', error);
                  if (error === 'popup_closed_by_user') {
                    setMessage('⚠️ Sign-in popup was closed. Please try again.');
                  } else {
                    setMessage('❌ Google authentication failed. Please try again.');
                  }
                }}
                theme="filled_blue"
                size="large"
                text={isSignup ? "signup_with" : "signin_with"}
                shape="rectangular"
                width="300"
                disabled={isLoading}
              />
            )}
          </div>
        </div>

        {/* Features Preview */}
        <div className="features-preview">
          <div className="feature-preview kundli">
            <div className="preview-icon">🔮</div>
            <div className="preview-text">Free Kundli</div>
          </div>
          <div className="feature-preview pooja">
            <div className="preview-icon">📖</div>
            <div className="preview-text">Book Pooja</div>
          </div>
          <div className="feature-preview moon">
            <div className="preview-icon">🌙</div>
            <div className="preview-text">Moon Track</div>
          </div>
        </div>

        {/* Info Text */}
        <p className="auth-info-text">
          {isSignup ? (
            <>
              Secure signup with Google • Birth details for accurate readings<br />
              🌟 Account activation required • Contact support for access 🌟
            </>
          ) : (
            <>
              Secure login with Google • Continue your journey<br />
              🌟 Only activated accounts can login 🌟
            </>
          )}
        </p>
      </div>

      {/* ================================ */}
      {/* BIRTH DETAILS MODAL */}
      {/* ================================ */}
      {showBirthDetailsPopup && (
        <div className="modal-overlay">
          <div className="birth-details-modal">
            <button className="modal-close-btn" onClick={closeBirthDetailsPopup}>×</button>

            <div className="modal-header">
              <div className="modal-icon">🎉</div>
              <h2 className="modal-title">
                Welcome, {googleUserInfo?.name}!
              </h2>
              <p className="modal-subtitle">
                You are not registered in AstroGuru. Please register to complete your cosmic profile.
                <br />
                <strong>Complete Your Cosmic Profile</strong>
                <br />
                Please provide your birth details for accurate astrological readings and personalized Kundli.
              </p>
            </div>

            <div className="birth-form">
              <div className="form-grid">
                {/* Full Name Field */}
                <div className="form-row name-religion-row">
                  {/* Full Name Field */}
                  <div className="form-field form-field-name">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      value={birthDetails.full_name}
                      onChange={(e) => handleBirthDetailsChange('full_name', e.target.value)}
                      placeholder="Enter your complete name"
                      className="form-input"
                    />
                  </div>

                  {/* ✅ NEW: Religion Dropdown */}
                  <div className="form-field form-field-religion">
                    <label className="form-label">Religion *</label>
                    <div className="religion-dropdown-container">
                      <div
                        className={`religion-dropdown-trigger ${showReligionDropdown ? 'active' : ''}`}
                        onClick={toggleReligionDropdown}
                      >
                        <div className="religion-dropdown-content">
                          <span className="religion-icon">
                            {religions.find(r => r.value === birthDetails.religion)?.icon || '🕉️'}
                          </span>
                          <span className="religion-text">
                            {religions.find(r => r.value === birthDetails.religion)?.label || 'Hindu'}
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
                              className={`religion-dropdown-item ${birthDetails.religion === religion.value ? 'selected' : ''}`}
                              onClick={() => handleReligionSelect(religion)}
                            >
                              <span className="religion-icon">{religion.icon}</span>
                              <span className="religion-name">{religion.label}</span>
                              {birthDetails.religion === religion.value && (
                                <span className="religion-selected-icon">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>


                {/* Date/Time/Location Fields */}
                <div className="form-grid-optimized">
                  {/* Row 1: Date and Time */}
                  <div className="form-row">
                    {/* Date Picker */}
                    <div className="form-field form-field-half">
                      <label className="form-label">Date of Birth *</label>
                      <div className="mobile-date-picker">
                        <button
                          type="button"
                          className="mobile-date-btn uniform-size"
                          onClick={() => {
                            console.log('📅 Date picker button clicked!');
                            setShowDatePicker(true);
                          }}
                        >
                          <span className="date-icon">📅</span>
                          <span className="date-text">
                            {birthDetails.birth_day && birthDetails.birth_month && birthDetails.birth_year
                              ? `${birthDetails.birth_day.toString().padStart(2, '0')} ${months.find(m => m.value == birthDetails.birth_month)?.name.substring(0, 3)} ${birthDetails.birth_year}`
                              : 'Select Date'
                            }
                          </span>
                          <span className="date-arrow">▼</span>
                        </button>
                      </div>
                    </div>

                    {/* Time Picker */}
                    <div className="form-field form-field-half">
                      <label className="form-label">Birth Time *</label>
                      <div className="mobile-time-picker">
                        <button
                          type="button"
                          className="mobile-time-btn uniform-size"
                          onClick={() => {
                            console.log('🕐 Time picker button clicked!');
                            setClockMode('hour');
                            setShowTimePicker(true);
                          }}
                        >
                          <span className="time-icon">🕐</span>
                          <span className="time-text">
                            {birthDetails.birth_time
                              ? formatTimeDisplay(birthDetails.birth_time)
                              : 'Select Time'
                            }
                          </span>
                          <span className="time-arrow">▼</span>
                        </button>
                      </div>
                    </div>
                  </div>


                  {/* Mobile Number Row */}
                  <div className="form-row mobile-number-row">
                    {/* Phone Code Selector */}
                    <div className="form-field form-field-country-small">
                      <label className="form-label">No. Code</label>
                      <div className="country-dropdown-container country-compact phone-code-dropdown">
                        <div
                          className={`country-dropdown-trigger country-compact-size ${showPhoneCodeDropdown ? 'active' : ''}`}
                          onClick={() => setShowPhoneCodeDropdown(!showPhoneCodeDropdown)}
                        >
                          <div className="country-dropdown-content country-compact-content">
                            <span className="country-flag">
                              {phoneCountries.find(c => c.code === birthDetails.country_code_no)?.flag || '🇮🇳'}
                            </span>
                            <span className="country-code">
                              {birthDetails.country_code_no || '+91'}
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
                                  className={`country-dropdown-item ${birthDetails.country_code_no === country.code ? 'selected' : ''}`}
                                  onClick={() => {
                                    handleBirthDetailsChange('country_code_no', country.code);
                                    setShowPhoneCodeDropdown(false);
                                  }}
                                >
                                  <span className="country-flag">{country.flag}</span>
                                  <span className="country-code-small">({country.code})</span>
                                  {birthDetails.country_code_no === country.code && (
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
                        value={birthDetails.mobile_number || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          if (value.length <= 15) {
                            handleBirthDetailsChange('mobile_number', value);
                          }
                        }}
                        placeholder="Enter mobile number"
                        className="form-input"
                        maxLength="15"
                      />
                    </div>
                  </div>




                  {/* Row 2: Country and Place */}
                  <div className="form-row country-place-row">
                    {/* Country Selector */}
                    <div className="form-field form-field-country-small">
                      <label className="form-label">Country *</label>
                      <div className="country-dropdown-container country-compact">
                        <div
                          className={`country-dropdown-trigger country-compact-size ${showCountryDropdown ? 'active' : ''}`}
                          onClick={toggleCountryDropdown}
                        >
                          <div className="country-dropdown-content country-compact-content">
                            <span className="country-flag">{selectedCountry.flag}</span>
                            <span className="country-code">{selectedCountry.code.toUpperCase()}</span>
                            <span className={`country-arrow ${showCountryDropdown ? 'up' : 'down'}`}>
                              {showCountryDropdown ? '▲' : '▼'}
                            </span>
                          </div>
                        </div>

                        {/* Country Dropdown Menu */}
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
                      <label className="form-label">Birth Place *</label>
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
                              {birthDetails.birth_place || `Select city in ${selectedCountry.name}`}
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

            <div className="form-info">
              🔮 Your birth details are used to generate accurate astrological charts and personalized readings. All information is kept confidential and secure.
            </div>

            <div className="modal-buttons">
              <button
                className="btn-secondary"
                onClick={closeBirthDetailsPopup}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleRegistrationComplete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span>⏳</span>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Complete Registration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================ */}
      {/* DATE PICKER MODAL */}
      {/* ================================ */}
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
                        className={`wheel-item ${birthDetails.birth_day == day ? 'selected' : ''}`}
                        onClick={() => handleBirthDetailsChange('birth_day', day)}
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
                        className={`wheel-item ${birthDetails.birth_month == month.value ? 'selected' : ''}`}
                        onClick={() => handleBirthDetailsChange('birth_month', month.value)}
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
                        className={`wheel-item ${birthDetails.birth_year == year ? 'selected' : ''}`}
                        onClick={() => handleBirthDetailsChange('birth_year', year)}
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
                disabled={!birthDetails.birth_day || !birthDetails.birth_month || !birthDetails.birth_year}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================ */}
      {/* TIME PICKER MODAL */}
      {/* ================================ */}
      {showTimePicker && (
        <div className="picker-overlay" onClick={(e) => e.target === e.currentTarget && setShowTimePicker(false)}>
          <div className="clock-picker-modal">
            <div className="clock-time-display">
              {birthDetails.birth_time ? formatTimeDisplay(birthDetails.birth_time) : '12:00 PM'}
            </div>

            <div className="analog-clock">
              {/* Mode Toggle */}
              <div className="clock-mode-toggle">
                <button
                  className={`mode-btn ${clockMode === 'hour' ? 'active' : ''}`}
                  onClick={() => setClockMode('hour')}
                >
                  Hour
                </button>
                <button
                  className={`mode-btn ${clockMode === 'minute' ? 'active' : ''}`}
                  onClick={() => setClockMode('minute')}
                >
                  Minute
                </button>
              </div>

              <div className="clock-face">
                {/* Hour Mode */}
                {clockMode === 'hour' &&
                  [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(hour => (
                    <div
                      key={hour}
                      className={`hour-number hour-${hour} ${getSelectedHour() === hour ? 'selected' : ''}`}
                      onClick={() => handleHourClick(hour)}
                    >
                      {hour}
                    </div>
                  ))
                }

                {/* Minute Mode */}
                {clockMode === 'minute' &&
                  [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((minute, index) => (
                    <div
                      key={minute}
                      className={`minute-number minute-${index} ${getSelectedMinute() === minute ? 'selected' : ''}`}
                      onClick={() => handleMinuteClick(minute)}
                    >
                      {minute.toString().padStart(2, '0')}
                    </div>
                  ))
                }

                {/* Clock Hands */}
                <div className="clock-center"></div>
                <div
                  className="clock-hand hour-hand"
                  style={{
                    transform: `rotate(${getHourAngle()}deg)`
                  }}
                ></div>
                <div
                  className="clock-hand minute-hand"
                  style={{
                    transform: `rotate(${getMinuteAngle()}deg)`
                  }}
                ></div>
              </div>

              {/* AM/PM Toggle */}
              <div className="am-pm-toggle">
                <button
                  className={`am-pm-btn ${getTimePeriod() === 'AM' ? 'active' : ''}`}
                  onClick={() => toggleAMPM('AM')}
                >
                  AM
                </button>
                <button
                  className={`am-pm-btn ${getTimePeriod() === 'PM' ? 'active' : ''}`}
                  onClick={() => toggleAMPM('PM')}
                >
                  PM
                </button>
              </div>
            </div>

            <div className="time-input-fallback">
              <input
                type="time"
                value={birthDetails.birth_time}
                onChange={(e) => handleBirthDetailsChange('birth_time', e.target.value)}
                className="time-input-hidden"
              />
            </div>

            <div className="picker-buttons">
              <button
                className="picker-btn picker-btn-cancel"
                onClick={() => setShowTimePicker(false)}
              >
                CANCEL
              </button>
              <button
                className="picker-btn picker-btn-ok"
                onClick={() => setShowTimePicker(false)}
                disabled={!birthDetails.birth_time}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================ */}
      {/* WAITING LIST MODAL */}
      {/* ================================ */}
      {showWaitingListModal && (
        <div className="modal-overlay">
          <div className="birth-details-modal">
            <button
              className="modal-close-btn"
              onClick={closeWaitingListModal}
            >
              ✕
            </button>

            <div className="modal-header">
              <div className="modal-icon">⏳</div>
              <h2 className="modal-title">You're on the Waiting List!</h2>
              <p className="modal-subtitle">
                Welcome back, {googleUserInfo?.name}! Your account is currently in our waiting list.
                We'll notify you as soon as your access is activated.
              </p>
            </div>

            <div className="waiting-info">
              <div className="waiting-status">
                <div className="status-icon">📧</div>
                <div className="status-text">
                  <strong>Email:</strong> {googleUserInfo?.email}
                </div>
              </div>
              <div className="waiting-status">
                <div className="status-icon">📅</div>
                <div className="status-text">
                  <strong>Status:</strong> Pending Activation
                </div>
              </div>
              <div className="waiting-message">
                <p>🌟 Thank you for your interest in AstroGuru! We're working hard to provide the best cosmic experience.</p>
                <p>💌 You'll receive an email notification once your account is activated.</p>
                <p>📞 For faster activation, contact M.A. at {contactNumber}</p>
              </div>
              <div className="contact-section">
                <button className="contact-btn" onClick={copyContactNumber}>
                  📞 Copy Contact Number
                </button>
              </div>
            </div>

            <div className="modal-buttons">
              <button
                className="btn-secondary"
                onClick={closeWaitingListModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copyright */}
      <div className="auth-copyright">
        © 2025 AstroGuru • Secure Authentication • Activation Required
      </div>
    </div>
  );
};

export default Auth;
