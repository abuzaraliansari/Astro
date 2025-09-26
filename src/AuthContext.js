import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserCredits, deductCredits as apiDeductCredits, addCredits as apiAddCredits } from './api';

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
          
          // ✅ UPDATED: Ensure all profile data exists with complete birth details AND religion
          const completeUserData = {
            ...userData,
            credits: userData.credits || 20,
            full_name: userData.full_name || userData.name || '',
            email: userData.email || '',
            religion: userData.religion || 'Hindu', // ✅ NEW: Default religion
            timezone: userData.timezone || 'Asia/Kolkata',
            birth_time: userData.birth_time || '',
            birth_date: userData.birth_date || '',
            birth_place: userData.birth_place || ''
          };
          
          setUser(completeUserData);
          console.log('💾 Loaded user data from localStorage with religion:', completeUserData.religion);
          
          // ✅ Sync credits from database after loading from localStorage
          if (completeUserData.id) {
            try {
              console.log('🔄 Syncing credits from database...');
              const response = await getUserCredits(completeUserData.id);
              if (response.data.success) {
                const syncedUserData = {
                  ...completeUserData,
                  credits: response.data.credits
                };
                setUser(syncedUserData);
                localStorage.setItem('astroguru_user', JSON.stringify(syncedUserData));
                console.log('✅ Credits synced from database:', response.data.credits);
              }
            } catch (error) {
              console.error('❌ Failed to sync credits from database:', error);
              // Continue with localStorage data if sync fails
            }
          }
        } catch (error) {
          console.error('❌ Error parsing stored user:', error);
          localStorage.removeItem('astroguru_user');
        }
      }
      setLoading(false);
    };

    loadStoredUser();
  }, []);

  // ✅ Enhanced login function with database sync and religion support
  const login = async (userData) => {
    // ✅ UPDATED: Store complete user data including birth details AND religion from API response
    const completeUserData = {
      ...userData,
      credits: userData.credits || 20,
      full_name: userData.full_name || userData.name || '',
      email: userData.email || '',
      religion: userData.religion || 'Hindu', // ✅ NEW: Include religion from signup
      timezone: userData.timezone || 'Asia/Kolkata',
      birth_time: userData.birth_time || '',
      birth_date: userData.birth_date || '',
      birth_place: userData.birth_place || ''
    };
    
    console.log('💾 Storing complete user data with religion:', completeUserData.religion);
    setUser(completeUserData);
    localStorage.setItem('astroguru_user', JSON.stringify(completeUserData));

    // ✅ Sync credits from database after login
    if (completeUserData.id) {
      try {
        console.log('🔄 Syncing credits from database after login...');
        const response = await getUserCredits(completeUserData.id);
        if (response.data.success) {
          const syncedUserData = {
            ...completeUserData,
            credits: response.data.credits
          };
          setUser(syncedUserData);
          localStorage.setItem('astroguru_user', JSON.stringify(syncedUserData));
          console.log('✅ Credits synced from database after login:', response.data.credits);
        }
      } catch (error) {
        console.error('❌ Failed to sync credits after login:', error);
      }
    }
  };

  // ✅ Database-integrated credit deduction
  const deductCredits = async (amount, reason = 'Question asked') => {
    if (!user?.id) {
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
      console.log(`💸 Deducting ${amount} credits for: ${reason}`);
      const response = await apiDeductCredits(user.id, amount, reason);
      
      if (response.data.success) {
        // Update local user state with database response
        const updatedUserData = {
          ...user,
          credits: response.data.currentCredits
        };
        setUser(updatedUserData);
        localStorage.setItem('astroguru_user', JSON.stringify(updatedUserData));
        
        console.log('✅ Credits deducted successfully:', {
          previous: response.data.previousCredits,
          deducted: response.data.deductedAmount,
          current: response.data.currentCredits
        });
        
        return {
          success: true,
          previousCredits: response.data.previousCredits,
          deductedAmount: response.data.deductedAmount,
          currentCredits: response.data.currentCredits,
          reason: reason
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
          currentCredits: error.response.data.currentCredits || user.credits,
          requiredCredits: error.response.data.requiredCredits || amount
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
    if (!user?.id) {
      console.error('❌ Cannot add credits: User not found');
      return {
        success: false,
        error: 'User not found'
      };
    }

    try {
      console.log(`💰 Adding ${amount} credits for: ${reason}`);
      const response = await apiAddCredits(user.id, amount, reason, packageInfo);
      
      if (response.data.success) {
        // Update local user state with database response
        const updatedUserData = {
          ...user,
          credits: response.data.currentCredits
        };
        setUser(updatedUserData);
        localStorage.setItem('astroguru_user', JSON.stringify(updatedUserData));
        
        console.log('✅ Credits added successfully:', {
          previous: response.data.previousCredits,
          added: response.data.addedAmount,
          current: response.data.currentCredits
        });
        
        return {
          success: true,
          previousCredits: response.data.previousCredits,
          addedAmount: response.data.addedAmount,
          currentCredits: response.data.currentCredits,
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

  // ✅ Refresh credits from database
  const refreshCredits = async () => {
    if (!user?.id) {
      console.log('⚠️ Cannot refresh credits: No user ID');
      return;
    }
    
    try {
      console.log('🔄 Refreshing credits from database...');
      const response = await getUserCredits(user.id);
      if (response.data.success) {
        const updatedUserData = {
          ...user,
          credits: response.data.credits
        };
        setUser(updatedUserData);
        localStorage.setItem('astroguru_user', JSON.stringify(updatedUserData));
        console.log('✅ Credits refreshed:', response.data.credits);
        return response.data.credits;
      }
    } catch (error) {
      console.error('❌ Failed to refresh credits:', error);
    }
  };

  // ✅ Legacy updateCredits function (for backward compatibility)
  const updateCredits = (newCredits) => {
    console.log('⚠️ updateCredits (legacy) called with:', newCredits);
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
    if (user?.id) {
      localStorage.removeItem(`astroguru_chat_${user.id}`);
      localStorage.removeItem(`astroguru_first_question_${user.id}`);
      localStorage.removeItem(`astroguru_draft_${user.id}`);
      localStorage.removeItem(`astroguru_short_response_${user.id}`);
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
