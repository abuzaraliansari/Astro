import axios from 'axios';

// ✅ STRICT: Force local backend only - NO direct API calls
const BACKEND_URL = process.env.REACT_APP_BACKEND || 'https://babralauatapi-d9abe9h8frescchd.centralindia-01.azurewebsites.net';

console.log('🔧 API Configuration:', {
  backendUrl: BACKEND_URL,
  isProduction: process.env.NODE_ENV === 'production'
});

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 300000
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('📤 STRICT API REQUEST TO BACKEND ONLY:', {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      hasData: !!config.data,
      timestamp: new Date().toISOString()
    });
    return config;
  },
  (error) => {
    console.error('📤 REQUEST SETUP ERROR:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('📥 BACKEND RESPONSE SUCCESS:', {
      status: response.status,
      url: response.config.url,
      hasData: !!response.data,
      source: response.data?.source || 'MISSING_SOURCE',
      provider: response.data?.provider || 'MISSING_PROVIDER',
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error) => {
    console.error('📥 BACKEND RESPONSE ERROR:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
  }
);

// ✅ STRICT: searchPlaces MUST go through backend - NO EXCEPTIONS
export const searchPlaces = async (query, country = 'IN') => {
  try {
    console.log('🔍 SEARCHING PLACES THROUGH BACKEND ONLY:', {
      query,
      country,
      backendUrl: BACKEND_URL,
      note: 'NO DIRECT API CALLS ALLOWED'
    });

    // ✅ FORCE CHECK: Backend must be available
    const response = await api.post('/astro/places/search', {
      query: query.trim(),
      country: country
    });

    // ✅ STRICT VERIFICATION: Must come from local backend
    if (!response.data.source || !response.data.source.includes('LOCAL_API')) {
      console.error('🚨 CRITICAL: Response did not come from local backend!');
      console.error('🚨 Response source:', response.data.source);
      console.error('🚨 This means your backend is not configured correctly!');
      throw new Error('Backend verification failed - response not from local API');
    }

    if (!response.data.provider || !response.data.provider.includes('Backend')) {
      console.warn('⚠️ Provider verification failed:', response.data.provider);
    }

    console.log('✅ VERIFIED BACKEND RESPONSE:', {
      success: response.data.success,
      count: response.data.places?.length || 0,
      provider: response.data.provider,
      source: response.data.source,
      debug: response.data.debug
    });

    return response;
  } catch (error) {
    console.error('❌ BACKEND SEARCH ERROR:', error);

    // ✅ NO FALLBACK - Force failure when backend is down
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('🚨 BACKEND IS DOWN - NO DIRECT API FALLBACK ALLOWED');
      throw new Error('❌ Backend server is not running! Please start your local API server on port 4000.');
    }

    if (error.message?.includes('Backend verification failed')) {
      throw new Error('❌ Backend response verification failed - check your backend configuration.');
    }

    throw error;
  }
};

// ✅ All other functions remain the same
export const getPlaceDetails = async (placeId) => {
  try {
    const response = await api.get(`/astro/places/details/${placeId}`);
    return response;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running!');
    }
    throw error;
  }
};

export const sendMessage = (text) => api.post('/astro/message', { message: text });
export const googleSignup = (googleToken, profile = {}) => api.post('/astro/signup', { token: googleToken, profile });
export const googleLogin = (googleToken) => api.post('/astro/login', { token: googleToken });


// ✅ NEW: User Settings API Functions
export const getUserSettings = async (userId) => {
  try {
    console.log('⚙️ FETCHING USER SETTINGS THROUGH BACKEND:', { userId });

    const response = await api.get(`/astro/settings/user/${userId}`);

    console.log('✅ USER SETTINGS LOADED:', {
      success: true,
      settingId: response.data.SettingId,
      language: response.data.Language,
      messageType: response.data.MessageType
    });

    return response;
  } catch (error) {
    console.error('❌ GET USER SETTINGS ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

export const updateUserSettings = async (settingId, updates) => {
  try {
    console.log('⚙️ UPDATING USER SETTINGS THROUGH BACKEND:', {
      settingId,
      updates
    });

    const response = await api.put(`/astro/settings/${settingId}`, updates);

    console.log('✅ USER SETTINGS UPDATED:', {
      success: true,
      message: response.data.message,
      updatedFields: response.data.updatedFields
    });

    return response;
  } catch (error) {
    console.error('❌ UPDATE USER SETTINGS ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

// Get preferred language
export const updateUserPreferences = (userId, preferences) =>
  api.post(`/astro/user/preferences/${userId}`, preferences);

export const getUserPreferences = (userId) =>
  api.get(`/astro/user/preferences/${userId}`);





export const getUserProfile = (userId) => api.get(`/astro/profile/${userId}`);
export const deductCredits = (userId, amount, reason = 'Question asked') =>
  api.post(`/astro/credits/${userId}/deduct`, { amount, reason });
export const addCredits = (userId, amount, reason = 'Credits purchased', packageInfo = null) =>
  api.post(`/astro/credits/${userId}/add`, { amount, reason, packageInfo });
export const getCreditHistory = (userId) => api.get(`/astro/credits/${userId}/history`);


// Get user credits (unchanged)
export const getUserCredits = (userId) => api.get(`/astro/credits/${userId}`);

// ✅ NEW: Chat History API Functions
// ✅ UPDATED: Accept both user message and AI prompt
export const saveChatMessage = async (userId, userMessage, aiPrompt) => {
  try {
    console.log('💬 SAVING CHAT MESSAGE WITH HISTORY THROUGH BACKEND:', {
      userId,
      userMessageLength: userMessage?.length,
      aiPromptLength: aiPrompt?.length
    });

    // ✅ EXTENDED TIMEOUT: 150 seconds (2.5 minutes) for AI processing
    const response = await api.post('/astro/chat/save-message', {
      userId,
      userMessage,  // ✅ Original user message for DB
      aiPrompt      // ✅ Full prompt for AI
    }, {
      timeout: 30000  // 150 seconds = 2.5 minutes
    });

    console.log('✅ CHAT MESSAGE SAVED:', {
      success: response.data.success,
      hasReply: !!response.data.reply,
      timestamp: response.data.timestamp
    });

    return response;
  } catch (error) {
    console.error('❌ SAVE CHAT MESSAGE ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('⏱️ Request timeout - AI is taking longer than expected. Please try again.');
    }
    throw error;
  }
};


export const getChatHistory = async (userId) => {
  try {
    console.log('📜 FETCHING CHAT HISTORY THROUGH BACKEND:', { userId });

    const response = await api.get(`/astro/chat/history/${userId}`);

    console.log('✅ CHAT HISTORY LOADED:', {
      success: response.data.success,
      totalMessages: response.data.totalMessages,
      dateCount: Object.keys(response.data.data || {}).length
    });

    return response;
  } catch (error) {
    console.error('❌ GET CHAT HISTORY ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

export const deleteChatHistory = async (userId) => {
  try {
    console.log('🗑️ DELETING CHAT HISTORY THROUGH BACKEND:', { userId });

    const response = await api.delete(`/astro/chat/history/${userId}`);

    console.log('✅ CHAT HISTORY DELETED:', {
      success: response.data.success,
      deletedCount: response.data.deletedCount,
      message: response.data.message
    });

    return response;
  } catch (error) {
    console.error('❌ DELETE CHAT HISTORY ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};


// ✅ NEW: Backend prompt API functions
export const getAllPrompts = async () => {
  return api.get('/astro/prompt');
};

export const getPrompt = async (path) => {
  return api.get(`/astro/prompt/get/${path}`);
};

export const getTypingMessages = async (religion = 'HINDU') => {
  return api.get(`/astro/prompt/typing/${religion}`);
};

export const getReligionData = async (religion = 'HINDU') => {
  return api.get(`/astro/prompt/religion/${religion}`);
};

export const getPromptsVersion = async () => {
  return api.get('/astro/prompt/version');
};

export const reloadPrompts = async () => {
  return api.post('/astro/prompt/reload');
};


// ✅ NEW: CALL GURU API FUNCTIONS - Following your exact pattern
export const getAllGurus = async () => {
  try {
    console.log('🧙‍♂️ FETCHING ALL GURUS THROUGH BACKEND');
    const response = await api.get('/astro/call-guru/gurus');
    console.log('✅ GURUS LOADED:', {
      success: response.data.success,
      count: response.data.count,
      message: response.data.message
    });
    return response;
  } catch (error) {
    console.error('❌ GET GURUS ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

export const getAllConsultationTypes = async () => {
  try {
    console.log('🔮 FETCHING CONSULTATION TYPES THROUGH BACKEND');
    const response = await api.get('/astro/call-guru/consultation-types');
    console.log('✅ CONSULTATION TYPES LOADED:', {
      success: response.data.success,
      count: response.data.count,
      message: response.data.message
    });
    return response;
  } catch (error) {
    console.error('❌ GET CONSULTATION TYPES ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

export const getGuruAvailability = async (guruId, startDate = null, endDate = null) => {
  try {
    console.log('📅 FETCHING GURU AVAILABILITY THROUGH BACKEND:', {
      guruId,
      startDate,
      endDate
    });

    let url = `/astro/call-guru/availability/${guruId}`;
    const params = new URLSearchParams();

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await api.get(url);
    console.log('✅ GURU AVAILABILITY LOADED:', {
      success: response.data.success,
      count: response.data.count,
      guruId: response.data.guruId,
      dateRange: response.data.dateRange
    });
    return response;
  } catch (error) {
    console.error('❌ GET GURU AVAILABILITY ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

export const getWeekAvailability = async (startDate = null) => {
  try {
    console.log('📅 FETCHING WEEK AVAILABILITY THROUGH BACKEND:', { startDate });

    let url = '/astro/call-guru/availability/week';
    if (startDate) {
      url += `?startDate=${startDate}`;
    }

    const response = await api.get(url);
    console.log('✅ WEEK AVAILABILITY LOADED:', {
      success: response.data.success,
      count: response.data.count,
      dateRange: response.data.dateRange
    });
    return response;
  } catch (error) {
    console.error('❌ GET WEEK AVAILABILITY ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  try {
    console.log('📞 CREATING BOOKING THROUGH BACKEND:', {
      userId: bookingData.userId,
      guruId: bookingData.guruId,
      consultationTypeId: bookingData.consultationTypeId,
      bookingDate: bookingData.bookingDate,
      startHour: bookingData.startHour,
      startMinute: bookingData.startMinute
    });

    const response = await api.post('/astro/call-guru/bookings', bookingData);
    console.log('✅ BOOKING CREATED SUCCESSFULLY:', {
      success: response.data.success,
      bookingId: response.data.booking?.id,
      message: response.data.message
    });
    return response;
  } catch (error) {
    console.error('❌ CREATE BOOKING ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

export const getUserBookings = async (userId, status = null, limit = 50) => {
  try {
    console.log('📋 FETCHING USER BOOKINGS THROUGH BACKEND:', {
      userId,
      status,
      limit
    });

    let url = `/astro/call-guru/bookings/user/${userId}`;
    const params = new URLSearchParams();

    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await api.get(url);
    console.log('✅ USER BOOKINGS LOADED:', {
      success: response.data.success,
      count: response.data.count,
      userId: response.data.userId,
      filters: response.data.filters
    });
    return response;
  } catch (error) {
    console.error('❌ GET USER BOOKINGS ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

export const getBookingDetails = async (bookingId, userId = null) => {
  try {
    console.log('📋 FETCHING BOOKING DETAILS THROUGH BACKEND:', {
      bookingId,
      userId
    });

    let url = `/astro/call-guru/bookings/${bookingId}`;
    if (userId) {
      url += `?userId=${userId}`;
    }

    const response = await api.get(url);
    console.log('✅ BOOKING DETAILS LOADED:', {
      success: response.data.success,
      bookingId: response.data.data?.id,
      message: response.data.message
    });
    return response;
  } catch (error) {
    console.error('❌ GET BOOKING DETAILS ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

export const cancelBooking = async (bookingId, userId, reason = 'Cancelled by user') => {
  try {
    console.log('❌ CANCELLING BOOKING THROUGH BACKEND:', {
      bookingId,
      userId,
      reason
    });

    const response = await api.patch(`/astro/call-guru/bookings/${bookingId}/cancel`, {
      userId,
      reason
    });
    console.log('✅ BOOKING CANCELLED SUCCESSFULLY:', {
      success: response.data.success,
      bookingId: response.data.booking?.id,
      message: response.data.message
    });
    return response;
  } catch (error) {
    console.error('❌ CANCEL BOOKING ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};


export const healthCheck = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return response;
  } catch (error) {
    throw error;
  }
};

const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json', { timeout: 3000 });
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.warn('⚠️ Could not fetch IP address:', error);
    return 'unknown';
  }
};

// ✅ NEW: SESSION MANAGEMENT API FUNCTIONS
// ═══════════════════════════════════════════════════════

/**
 * Create a new session when user logs in
 * @param {number} userId - User ID from astroguru_users.id
 * @param {string} ipAddress - Client IP address (optional)
 * @param {string} deviceInfo - Browser/device info (optional)
 */
export const createSession = async (userId, ipAddress = null, deviceInfo = null) => {
  try {
    console.log('🔐 CREATING SESSION THROUGH BACKEND:', {
      userId,
      ipAddress: ipAddress || 'auto-detect',
      deviceInfo: deviceInfo || 'browser-default'
    });

    const response = await api.post('/astro/session/login', {
      userId,
      ipAddress: ipAddress || (await getClientIP()),
      deviceInfo: deviceInfo || navigator.userAgent
    });

    console.log('✅ SESSION CREATED:', {
      success: response.data.success,
      sessionId: response.data.session?.sessionId,
      userName: response.data.session?.userName,
      message: response.data.message
    });

    return response;
  } catch (error) {
    console.error('❌ CREATE SESSION ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

/**
 * End session when user logs out
 * @param {number} sessionId - Specific session ID (optional)
 * @param {number} userId - User ID (optional, required if no sessionId)
 */
export const endSession = async (sessionId = null, userId = null) => {
  try {
    console.log('🚪 ENDING SESSION THROUGH BACKEND:', {
      sessionId: sessionId || 'all',
      userId
    });

    const response = await api.post('/astro/session/logout', {
      sessionId,
      userId
    });

    console.log('✅ SESSION ENDED:', {
      success: response.data.success,
      sessionsEnded: response.data.sessionsEnded || 1,
      message: response.data.message
    });

    return response;
  } catch (error) {
    console.error('❌ END SESSION ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

/**
 * Get all sessions for a user (history)
 * @param {number} userId - User ID from astroguru_users.id
 */
export const getUserSessions = async (userId) => {
  try {
    console.log('📊 FETCHING USER SESSIONS THROUGH BACKEND:', { userId });

    const response = await api.get(`/astro/session/history/${userId}`);

    console.log('✅ USER SESSIONS LOADED:', {
      success: response.data.success,
      totalSessions: response.data.summary?.totalSessions,
      activeSessions: response.data.summary?.activeSessions,
      closedSessions: response.data.summary?.closedSessions
    });

    return response;
  } catch (error) {
    console.error('❌ GET USER SESSIONS ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

/**
 * Check if user has an active session
 * @param {number} userId - User ID from astroguru_users.id
 */
export const getActiveSession = async (userId) => {
  try {
    console.log('🔍 CHECKING ACTIVE SESSION THROUGH BACKEND:', { userId });

    const response = await api.get(`/astro/session/active/${userId}`);

    console.log('✅ ACTIVE SESSION CHECK:', {
      success: response.data.success,
      hasActiveSession: response.data.hasActiveSession,
      sessionId: response.data.session?.sessionId
    });

    return response;
  } catch (error) {
    console.error('❌ GET ACTIVE SESSION ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

/**
 * Helper function to get client IP address
 * @returns {Promise<string>} IP address or 'unknown'
 */


// ✅ NEW: REFERRAL CODE API FUNCTIONS
// ═══════════════════════════════════════════════════════

/**
 * Get user's referral code
 * @param {number} userId - User ID from astroguru_users.id
 */
export const getUserReferralCode = async (userId) => {
  try {
    console.log('🎫 FETCHING REFERRAL CODE THROUGH BACKEND:', { userId });

    const response = await api.get(`/astro/referral/${userId}`);

    console.log('✅ REFERRAL CODE LOADED:', {
      success: response.data.success,
      referralCode: response.data.referralCode,
      hasCode: response.data.hasReferralCode
    });

    return response;
  } catch (error) {
    console.error('❌ GET REFERRAL CODE ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

/**
 * Generate referral code for user
 * @param {number} userId - User ID
 * @param {boolean} forceRegenerate - Force regenerate if already exists
 */
export const generateUserReferralCode = async (userId, forceRegenerate = false) => {
  try {
    console.log('🎫 GENERATING REFERRAL CODE THROUGH BACKEND:', {
      userId,
      forceRegenerate
    });

    const response = await api.post('/astro/referral/generate', {
      userId,
      forceRegenerate
    });

    console.log('✅ REFERRAL CODE GENERATED:', {
      success: response.data.success,
      referralCode: response.data.referralCode,
      isNew: response.data.isNew
    });

    return response;
  } catch (error) {
    console.error('❌ GENERATE REFERRAL CODE ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

/**
 * Verify if referral code is valid
 * @param {string} code - Referral code to verify
 */
export const verifyReferralCode = async (code) => {
  try {
    console.log('🔍 VERIFYING REFERRAL CODE THROUGH BACKEND:', { code });

    const response = await api.get(`/astro/referral/verify/${code}`);

    console.log('✅ REFERRAL CODE VERIFIED:', {
      success: response.data.success,
      isValid: response.data.isValid,
      referredBy: response.data.referredBy
    });

    return response;
  } catch (error) {
    console.error('❌ VERIFY REFERRAL CODE ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};


export const getAllCountries = async () => {
  try {
    console.log('🌍 FETCHING ALL COUNTRIES THROUGH BACKEND');
    const response = await api.get('/astro/countries');
    console.log('✅ COUNTRIES LOADED:', {
      success: response.data.success,
      count: response.data.count,
      version: response.data.version
    });
    return response;
  } catch (error) {
    console.error('❌ GET ALL COUNTRIES ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

/**
 * Get popular countries (top 10)
 */
export const getPopularCountries = async () => {
  try {
    console.log('🌍 FETCHING POPULAR COUNTRIES THROUGH BACKEND');
    const response = await api.get('/astro/countries/popular');
    console.log('✅ POPULAR COUNTRIES LOADED:', {
      success: response.data.success,
      count: response.data.count
    });
    return response;
  } catch (error) {
    console.error('❌ GET POPULAR COUNTRIES ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

/**
 * Get countries by region
 * @param {string} region - Region name (e.g., 'South Asia', 'Middle East')
 */
export const getCountriesByRegion = async (region) => {
  try {
    console.log('🌍 FETCHING COUNTRIES BY REGION THROUGH BACKEND:', { region });
    const response = await api.get(`/astro/countries/region/${region}`);
    console.log('✅ COUNTRIES BY REGION LOADED:', {
      success: response.data.success,
      region: response.data.region,
      count: response.data.count
    });
    return response;
  } catch (error) {
    console.error('❌ GET COUNTRIES BY REGION ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

/**
 * Get all regions
 */
export const getAllRegions = async () => {
  try {
    console.log('🌍 FETCHING ALL REGIONS THROUGH BACKEND');
    const response = await api.get('/astro/countries/regions');
    console.log('✅ REGIONS LOADED:', {
      success: response.data.success,
      count: response.data.count
    });
    return response;
  } catch (error) {
    console.error('❌ GET ALL REGIONS ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

/**
 * Search countries by name, ISO code, or phone code
 * @param {string} query - Search query
 */
export const searchCountries = async (query) => {
  try {
    console.log('🔍 SEARCHING COUNTRIES THROUGH BACKEND:', { query });
    const response = await api.get(`/astro/countries/search/${query}`);
    console.log('✅ COUNTRIES SEARCH RESULTS:', {
      success: response.data.success,
      query: response.data.query,
      count: response.data.count
    });
    return response;
  } catch (error) {
    console.error('❌ SEARCH COUNTRIES ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};


// ✅ NEW: REFERRAL MILESTONE API FUNCTIONS
// ═══════════════════════════════════════════════════════

/**
 * Get all referral milestones configuration
 * @param {number} userId - Optional: User ID to include their progress
 */
export const getReferralMilestones = async (userId = null) => {
  try {
    console.log('🎯 FETCHING REFERRAL MILESTONES THROUGH BACKEND:', { userId });

    let url = '/astro/referral/milestones';
    if (userId) {
      url += `?userId=${userId}`;
    }

    const response = await api.get(url);

    console.log('✅ REFERRAL MILESTONES LOADED:', {
      success: response.data.success,
      totalMilestones: response.data.milestones?.length,
      hasUserProgress: !!response.data.userProgress,
      currentReferrals: response.data.currentReferrals
    });

    return response;
  } catch (error) {
    console.error('❌ GET REFERRAL MILESTONES ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

/**
 * Get user's referral progress and milestone status
 * @param {number} userId - User ID from astroguru_users.id
 */
export const getUserReferralProgress = async (userId) => {
  try {
    console.log('📊 FETCHING USER REFERRAL PROGRESS THROUGH BACKEND:', { userId });

    const response = await api.get(`/astro/referral/progress/${userId}`);

    console.log('✅ USER REFERRAL PROGRESS LOADED:', {
      success: response.data.success,
      referralCount: response.data.referralCount,
      completedMilestones: response.data.completedMilestones?.length,
      totalCreditsEarned: response.data.totalCreditsEarned,
      nextMilestone: response.data.progress?.nextMilestone?.name
    });

    return response;
  } catch (error) {
    console.error('❌ GET USER REFERRAL PROGRESS ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

/**
 * Get referral history for a user
 * @param {number} userId - User ID from astroguru_users.id
 */
export const getUserReferralHistory = async (userId) => {
  try {
    console.log('📜 FETCHING USER REFERRAL HISTORY THROUGH BACKEND:', { userId });

    const response = await api.get(`/astro/referral/history/${userId}`);

    console.log('✅ USER REFERRAL HISTORY LOADED:', {
      success: response.data.success,
      totalReferrals: response.data.totalReferrals,
      completedCount: response.data.completedCount,
      pendingCount: response.data.pendingCount
    });

    return response;
  } catch (error) {
    console.error('❌ GET USER REFERRAL HISTORY ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

/**
 * Get milestone rewards history for a user
 * @param {number} userId - User ID from astroguru_users.id
 */
export const getUserMilestoneRewards = async (userId) => {
  try {
    console.log('🏆 FETCHING USER MILESTONE REWARDS THROUGH BACKEND:', { userId });

    const response = await api.get(`/astro/referral/rewards/${userId}`);

    console.log('✅ USER MILESTONE REWARDS LOADED:', {
      success: response.data.success,
      totalRewards: response.data.totalRewards,
      totalCredits: response.data.totalCredits,
      rewardsCount: response.data.rewards?.length
    });

    return response;
  } catch (error) {
    console.error('❌ GET USER MILESTONE REWARDS ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

/**
 * Get referral leaderboard (top referrers)
 * @param {number} limit - Number of top referrers to fetch (default: 10)
 */
export const getReferralLeaderboard = async (limit = 10) => {
  try {
    console.log('🏆 FETCHING REFERRAL LEADERBOARD THROUGH BACKEND:', { limit });

    const response = await api.get(`/astro/referral/leaderboard?limit=${limit}`);

    console.log('✅ REFERRAL LEADERBOARD LOADED:', {
      success: response.data.success,
      topReferrersCount: response.data.topReferrers?.length,
      totalActive: response.data.totalActive
    });

    return response;
  } catch (error) {
    console.error('❌ GET REFERRAL LEADERBOARD ERROR:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running! Please start your API server.');
    }
    throw error;
  }
};

/**
 * Get all available credit packages
 * @returns {Promise} Array of credit packages
 */
export const getCreditPackages = () => {
  console.log('📦 Fetching credit packages from API...');
  return api.get('/astro/credit-packages');
};

/**
 * Get specific credit package by ID
 * @param {number} packageId - Package ID
 * @returns {Promise} Package details
 */
export const getCreditPackage = (packageId) => {
  console.log(`📦 Fetching credit package ${packageId}...`);
  return api.get(`/astro/credit-packages/${packageId}`);
};

/**
 * Get package summary by ID
 * @param {number} packageId - Package ID
 * @returns {Promise} Package summary
 */
export const getCreditPackageSummary = (packageId) => {
  console.log(`📊 Fetching package summary ${packageId}...`);
  return api.get(`/astro/credit-packages/${packageId}/summary`);
};

/**
 * Purchase credits
 * @param {number} userId - User ID
 * @param {number} packageId - Package ID
 * @param {string} transactionId - Transaction ID
 * @param {string} paymentGateway - Payment gateway (default: 'razorpay')
 * @param {string} paymentMethod - Payment method (default: 'online')
 * @returns {Promise} Purchase result
 */
export const purchaseCredits = (userId, packageId, transactionId, paymentGateway = 'razorpay', paymentMethod = 'online') => {
  console.log('💳 Processing credit purchase...');
  return api.post('/astro/credits/purchase', {
    userId,
    packageId,
    transactionId,
    paymentGateway,
    paymentMethod
  });
};

/**
 * Get all spend types
 * @returns {Promise} Array of spend types
 */
export const getSpendTypes = () => {
  console.log('💸 Fetching spend types...');
  return api.get('/astro/spend-types');
};

/**
 * Spend credits
 * @param {number} userId - User ID
 * @param {number} spendTypeId - Spend type ID
 * @param {number} customAmount - Custom amount (optional)
 * @param {string} description - Description (optional)
 * @returns {Promise} Spend result
 */
export const spendCredits = (userId, spendTypeId, description = null, promoCode = null) => {
  console.log('💸 Spending credits...', { userId, spendTypeId, description });
  return api.post('/astro/credits/spend', {
    userId,
    spendTypeId,
    description,
    promoCode
  });
};







export { api };



export default {
  searchPlaces,
  getPlaceDetails,
  sendMessage,
  googleSignup,
  googleLogin,
  getUserSettings,        // ✅ NEW
  updateUserSettings,
  getUserProfile,
  getUserCredits,
  deductCredits,
  addCredits,
  getCreditHistory,
  saveChatMessage,      // ✅ NEW
  getChatHistory,       // ✅ NEW
  deleteChatHistory,
  getAllPrompts,
  getPrompt,
  getTypingMessages,
  getReligionData,
  getPromptsVersion,
  reloadPrompts,
  healthCheck,
  getAllGurus,
  getAllConsultationTypes,
  getGuruAvailability,
  getWeekAvailability,
  createBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking,
  createSession,
  endSession,
  getUserSessions,
  getActiveSession,
  getUserReferralCode,
  generateUserReferralCode,
  verifyReferralCode,
  getAllCountries,           // ✅ NEW
  getPopularCountries,       // ✅ NEW
  getCountriesByRegion,      // ✅ NEW
  getAllRegions,             // ✅ NEW
  searchCountries,
  getReferralMilestones,      // ✅ NEW
  getUserReferralProgress,    // ✅ NEW
  getUserReferralHistory,     // ✅ NEW
  getUserMilestoneRewards,    // ✅ NEW
  getReferralLeaderboard,     // ✅ NEW
  getCreditPackageSummary,
  getCreditPackage,
  getCreditPackages,
  purchaseCredits,
  getSpendTypes,
  spendCredits,
  api
};
