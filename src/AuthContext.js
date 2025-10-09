import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserCredits, deductCredits as apiDeductCredits, addCredits as apiAddCredits, getUserPreferences } from './api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Enhanced user loading with database credit sync and religion support
  useEffect(() => {
    const loadStoredUser = async () => {
      const storedUser = localStorage.getItem('astroguru_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('🔄 Loaded stored user:', userData);

          // ✅ Use userData.userId (database ID), NOT userData.id (google_id)
          if (userData.userId) {
            try {
              // ✅ Load preferences using DATABASE userId
              try {
                const prefResponse = await getUserPreferences(userData.userId);
                if (prefResponse?.data) {
                  const { preferred_language, country_code } = prefResponse.data;
                  userData.preferred_language = preferred_language || 'ENGLISH';
                  userData.country_code = country_code || userData.country_code || 'IN';
                  console.log('✅ Loaded user preferences from backend:', prefResponse.data);
                }
              } catch (prefError) {
                console.warn('⚠️ Could not load preferences (404 - endpoint may not exist):', prefError.message);
                // Continue with defaults
              }

              // ✅ Load credits from credit_balance_summary
              const creditsResponse = await getUserCredits(userData.userId);
              if (creditsResponse?.data?.success) {
                userData.credits = creditsResponse.data.balance.currentCredits;
                userData.credits_limit = creditsResponse.data.balance.creditsLimit;
                console.log('✅ Synced credits from database:', {
                  current: userData.credits,
                  limit: userData.credits_limit
                });
              }
            } catch (e) {
              console.error('Failed to sync user data from backend:', e);
            }
          }

          setUser(userData);
          localStorage.setItem('astroguru_user', JSON.stringify(userData));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('astroguru_user');
        }
      }
      setLoading(false);
    };

    loadStoredUser();
  }, []);

  // ✅ Enhanced login function with database sync and religion support
  const login = async (userData) => {
    console.log('🔐 Login initiated for user:', userData.email);

    // Use values from login response directly
    let preferredLanguage = userData.preferred_language || 'ENGLISH';
    let currentCredits = userData.credits || 20;
    let creditsLimit = userData.credits_limit || 0;

    // ✅ Use userData.userId (database ID), NOT userData.id (google_id)
    if (userData.userId) {
      try {
        console.log('📊 Fetching user data for userId:', userData.userId);

        // ✅ Load preferences using DATABASE userId
        try {
          const prefResponse = await getUserPreferences(userData.userId);
          if (prefResponse?.data?.preferred_language) {
            preferredLanguage = prefResponse.data.preferred_language;
            console.log('✅ Loaded preference:', preferredLanguage);
          }
        } catch (prefError) {
          console.warn('⚠️ Could not load preferences (404 - endpoint may not exist):', prefError.message);
          // Continue with default language
        }

        // ✅ Load credits from credit_balance_summary using DATABASE userId
        const creditsResponse = await getUserCredits(userData.userId);
        if (creditsResponse?.data?.success) {
          currentCredits = creditsResponse.data.balance.currentCredits;
          creditsLimit = creditsResponse.data.balance.creditsLimit;
          console.log('✅ Loaded credits from database:', {
            current: currentCredits,
            limit: creditsLimit
          });
        }
      } catch (err) {
        console.warn('Could not fetch user data from database, using login data:', err.message);
      }
    } else {
      console.warn('⚠️ No userId found in userData - skipping database sync');
    }

    const completeUserData = {
      ...userData,
      preferred_language: preferredLanguage,
      credits: currentCredits,
      credits_limit: creditsLimit
    };

    setUser(completeUserData);
    localStorage.setItem('astroguru_user', JSON.stringify(completeUserData));
    console.log('👋 User logged in with complete data:', completeUserData);
  };

  // ✅ Database-integrated credit deduction
  const deductCredits = async (amount, reason = 'Question asked') => {
    if (!user?.userId) {  // ✅ FIXED: Use userId
      console.error('❌ Cannot deduct credits: User not found');
      return {
        success: false,
        error: 'User not found',
        currentCredits: user?.credits || 0
      };
    }

    // Check local credits first for immediate feedback
    if (user.credits < amount) {
      console.log('💰 Insufficient local credits detected');
      return {
        success: false,
        error: 'Insufficient credits',
        currentCredits: user.credits,
        requiredCredits: amount
      };
    }

    try {
      console.log(`💸 Deducting ${amount} credits for userId ${user.userId}: ${reason}`);
      const response = await apiDeductCredits(user.userId, amount, reason);  // ✅ FIXED: Use userId
      
      if (response.data.success) {
        // ✅ Update with response from credit_balance_summary
        const updatedUserData = {
          ...user,
          credits: response.data.balance.currentCredits
        };
        setUser(updatedUserData);
        localStorage.setItem('astroguru_user', JSON.stringify(updatedUserData));
        
        console.log('✅ Credits deducted successfully:', {
          previous: response.data.balance.previousCredits,
          deducted: response.data.balance.deductedAmount,
          current: response.data.balance.currentCredits
        });
        
        return {
          success: true,
          previousCredits: response.data.balance.previousCredits,
          deductedAmount: response.data.balance.deductedAmount,
          currentCredits: response.data.balance.currentCredits,
          reason: reason,
          message: response.data.message
        };
      } else {
        console.error('❌ Failed to deduct credits:', response.data.error);
        return {
          success: false,
          error: response.data.error,
          currentCredits: user.credits
        };
      }
    } catch (error) {
      console.error('❌ Credit deduction error:', error);
      
      // Handle insufficient credits from API
      if (error.response?.data?.error === 'Insufficient credits') {
        return {
          success: false,
          error: 'Insufficient credits',
          currentCredits: error.response.data.balance?.currentCredits || user.credits,
          requiredCredits: error.response.data.balance?.requiredCredits || amount
        };
      }
      
      return {
        success: false,
        error: 'Network error. Please try again.',
        currentCredits: user.credits
      };
    }
  };

  // ✅ Database-integrated credit addition
  const addCredits = async (amount, reason = 'Credits purchased', packageInfo = null) => {
    if (!user?.userId) {  // ✅ FIXED: Use userId
      console.error('❌ Cannot add credits: User not found');
      return {
        success: false,
        error: 'User not found'
      };
    }

    try {
      console.log(`💰 Adding ${amount} credits for userId ${user.userId}: ${reason}`);
      const response = await apiAddCredits(user.userId, amount, reason, packageInfo);  // ✅ FIXED: Use userId
      
      if (response.data.success) {
        // ✅ Update with response from credit_balance_summary
        const updatedUserData = {
          ...user,
          credits: response.data.balance.currentCredits
        };
        setUser(updatedUserData);
        localStorage.setItem('astroguru_user', JSON.stringify(updatedUserData));
        
        console.log('✅ Credits added successfully:', {
          previous: response.data.balance.previousCredits,
          added: response.data.balance.addedAmount,
          current: response.data.balance.currentCredits
        });
        
        return {
          success: true,
          previousCredits: response.data.balance.previousCredits,
          addedAmount: response.data.balance.addedAmount,
          currentCredits: response.data.balance.currentCredits,
          reason: reason,
          packageInfo: packageInfo,
          message: response.data.message
        };
      } else {
        console.error('❌ Failed to add credits:', response.data.error);
        return {
          success: false,
          error: response.data.error
        };
      }
    } catch (error) {
      console.error('❌ Credit addition error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  };

  // ✅ Refresh credits from database (credit_balance_summary)
  const refreshCredits = async () => {
    if (!user?.userId) {  // ✅ FIXED: Use userId
      console.log('⚠️ Cannot refresh credits: No user ID');
      return;
    }
    
    try {
      console.log('🔄 Refreshing credits from credit_balance_summary for userId:', user.userId);
      const response = await getUserCredits(user.userId);  // ✅ FIXED: Use userId
      if (response.data.success) {
        const updatedUserData = {
          ...user,
          credits: response.data.balance.currentCredits,
          credits_limit: response.data.balance.creditsLimit
        };
        setUser(updatedUserData);
        localStorage.setItem('astroguru_user', JSON.stringify(updatedUserData));
        console.log('✅ Credits refreshed from database:', {
          current: response.data.balance.currentCredits,
          limit: response.data.balance.creditsLimit
        });
        return response.data.balance.currentCredits;
      }
    } catch (error) {
      console.error('❌ Failed to refresh credits:', error);
    }
  };

  // ✅ Legacy updateCredits function (for backward compatibility)
  const updateCredits = (newCredits) => {
    console.log('⚠️ updateCredits (legacy) called with:', newCredits);
    console.log('⚠️ WARNING: This is a local-only update. Use addCredits/deductCredits for database sync.');
    const updatedUser = { ...user, credits: newCredits };
    setUser(updatedUser);
    localStorage.setItem('astroguru_user', JSON.stringify(updatedUser));
  };

  // ✅ Check if user has enough credits
  const hasEnoughCredits = (amount) => {
    return user?.credits >= amount;
  };

  // ✅ Get credit cost for different actions
  const getCreditCost = (action = 'question', isFirstQuestion = false) => {
    switch (action) {
      case 'question':
        return isFirstQuestion ? 10 : 5;
      case 'detailed_reading':
        return 15;
      case 'compatibility':
        return 8;
      default:
        return 5;
    }
  };

  // ✅ NEW: Get religion-specific greeting
  const getReligionGreeting = (religion) => {
    const greetings = {
      'Islam': 'Assalamu Alaikum',
      'Christianity': 'May God bless you',
      'Sikhism': 'Sat Sri Akal',
      'Buddhism': 'May Buddha\'s wisdom guide you',
      'Jainism': 'Jai Jinendra',
      'Judaism': 'Shalom',
      'Zoroastrianism': 'Asha Vahishta',
      'Bahai': 'Allah-u-Abha',
      'Hindu': 'Namaste',
      'Other': 'Divine blessings'
    };
    return greetings[religion] || 'Namaste';
  };

  // ✅ NEW: Get religion-specific blessing
  const getReligionBlessing = (religion) => {
    const blessings = {
      'Islam': 'Allah\'s blessings',
      'Christianity': 'God\'s grace',
      'Sikhism': 'Waheguru\'s blessings',
      'Buddhism': 'Buddha\'s wisdom',
      'Jainism': 'Tirthankara\'s guidance',
      'Judaism': 'Hashem\'s blessings',
      'Zoroastrianism': 'Ahura Mazda\'s light',
      'Bahai': 'Bahá\'u\'lláh\'s guidance',
      'Hindu': 'Divine blessings',
      'Other': 'Universal blessings'
    };
    return blessings[religion] || 'Divine blessings';
  };

  const logout = () => {
    console.log('👋 Logging out user');
    setUser(null);
    localStorage.removeItem('astroguru_user');
    
    // Clear user-specific localStorage items
    if (user?.userId) {  // ✅ FIXED: Use userId
      localStorage.removeItem(`astroguru_chat_${user.userId}`);
      localStorage.removeItem(`astroguru_first_question_${user.userId}`);
      localStorage.removeItem(`astroguru_draft_${user.userId}`);
      localStorage.removeItem(`astroguru_short_response_${user.userId}`);
    }
  };

  const value = {
    user,
    setUser: login, // Enhanced login with database sync
    logout,
    loading,
    
    // ✅ Database-integrated credit functions
    deductCredits,
    addCredits,
    refreshCredits,
    hasEnoughCredits,
    getCreditCost,
    
    // ✅ NEW: Religion-specific helper functions
    getReligionGreeting,
    getReligionBlessing,
    
    // ✅ Legacy functions (for backward compatibility)
    updateCredits // Kept for any existing code that might use it
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
