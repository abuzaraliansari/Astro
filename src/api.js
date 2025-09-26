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
  timeout: 15000
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
    const response = await api.post('/asto/places/search', {
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
    const response = await api.get(`/asto/places/details/${placeId}`);
    return response;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Backend server is not running!');
    }
    throw error;
  }
};

export const sendMessage = (text) => api.post('/asto/message', { message: text });
export const googleSignup = (googleToken, profile = {}) => api.post('/asto/signup', { token: googleToken, profile });
export const googleLogin = (googleToken) => api.post('/asto/login', { token: googleToken });
export const getUserProfile = (userId) => api.get(`/asto/profile/${userId}`);
export const getUserCredits = (userId) => api.get(`/asto/credits/${userId}`);
export const deductCredits = (userId, amount, reason = 'Question asked') => 
  api.post(`/asto/credits/${userId}/deduct`, { amount, reason });
export const addCredits = (userId, amount, reason = 'Credits purchased', packageInfo = null) => 
  api.post(`/asto/credits/${userId}/add`, { amount, reason, packageInfo });
export const getCreditHistory = (userId) => api.get(`/asto/credits/${userId}/history`);

// ✅ NEW: Backend prompt API functions
export const getAllPrompts = async () => {
  return api.get('/asto/prompt');
};

export const getPrompt = async (path) => {
  return api.get(`/asto/prompt/get/${path}`);
};

export const getTypingMessages = async (religion = 'HINDU') => {
  return api.get(`/asto/prompt/typing/${religion}`);
};

export const getReligionData = async (religion = 'HINDU') => {
  return api.get(`/asto/prompt/religion/${religion}`);
};

export const getPromptsVersion = async () => {
  return api.get('/asto/prompt/version');
};

export const reloadPrompts = async () => {
  return api.post('/asto/prompt/reload');
};


export const healthCheck = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return response;
  } catch (error) {
    throw error;
  }
};

export { api };
export default {
  searchPlaces,
  getPlaceDetails,
  sendMessage,
  googleSignup,
  googleLogin,
  getUserProfile,
  getUserCredits,
  deductCredits,
  addCredits,
  getCreditHistory,
  getAllPrompts,
  getPrompt,
  getTypingMessages,
  getReligionData,
  getPromptsVersion,
  reloadPrompts,
  healthCheck,
  api
};
