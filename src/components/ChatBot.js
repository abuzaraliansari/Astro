import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { sendMessage, getAllPrompts, searchPlaces, saveChatMessage, getChatHistory, deleteChatHistory, getUserSettings, updateUserSettings, spendCredits, getUserCredits } from '../api';
import InsufficientCreditsModal from './InsufficientCreditsModal';
import ReactMarkdown from 'react-markdown';

function ChatBot() {
  const { user, deductCredits, getReligionGreeting, getReligionBlessing, refreshCredits } = useAuth();
  const navigate = useNavigate();
  const effectRan = useRef(false);
  const searchTimeoutRef = useRef(null);
  const placeInputRef = useRef(null);

  const [hasInitialized, setHasInitialized] = useState(false);
  const [prompts, setPrompts] = useState(null);
  const [promptsLoading, setPromptsLoading] = useState(true);

  // Enhanced state management with response length preference and language
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isFirstQuestion, setIsFirstQuestion] = useState(true);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [requiredCredits, setRequiredCredits] = useState(0);
  const [draftMessage, setDraftMessage] = useState('');


  const [selectedLanguage, setSelectedLanguage] = useState(
    user?.settings?.Language || 'ENGLISH'  // ✅ Use settings.Language from login
  );
  const [userSettings, setUserSettings] = useState(null);

  const [responseType, setResponseType] = useState(() => {
    // Load from user settings in DB, default to NORMAL
    const savedType = user?.settings?.responseType || 'NORMAL';
    console.log('🎬 INITIAL responseType from DB:', savedType);
    return savedType;
  });

  const [shortResponse, setShortResponse] = useState(true); // For response length toggle
  const [promptsData, setPromptsData] = useState(null); // For prompts loaded from backend
  const [messageType, setMessageType] = useState('NORMAL'); // For message type (if used)
  // Helper for religion instruction (define as needed)
  const religionInstruction = '';
    const getPrompt = (path, fallback = '') => {
    if (!prompts) return fallback;

    const keys = path.split('.');
    let result = prompts;

    for (const key of keys) {
      result = result?.[key];
      if (result === undefined) return fallback;
    }

    return result || fallback;
  };

  // Helper for shortLimit (define as needed)
  const shortLimit = shortResponse ? getPrompt('base.RESPONSE_SHORT', 'Keep response SHORT (30-50 words max). Simple language.') : getPrompt('base.RESPONSE_DETAILED', 'Provide detailed response.');

  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // ✅ NEW: Birth Details Modal States (same as Auth.js)
  const [showBirthDetailsPopup, setShowBirthDetailsPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [clockMode, setClockMode] = useState('hour');
  const [showReligionDropdown, setShowReligionDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [tempBirthProfile, setTempBirthProfile] = useState(null); // ✅ Temporary profile storage
  const [showSettings, setShowSettings] = useState(false);

  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const LANGUAGES = [
    { key: 'ENGLISH', displayName: 'English' },
    { key: 'HINDI', displayName: 'हिंदी (Hindi)' },
    { key: 'HINGLISH', displayName: 'Hinglish (Hindi + English)' }
  ];
  const languageInstructions = {
    ENGLISH: "Please respond in fluent English.",
    HINDI: "[translate:कृपया हिंदी में उत्तर दें।]",
    HINGLISH: "Please respond in friendly, engaging Hinglish using simple Hindi in Roman script and English mix. Avoid pure English."
  };

  const instructionsMap = {
    'ENGLISH': 'Please respond in fluent English.',
    'HINDI': '[translate:कृपया हिंदी में उत्तर दें।]',
    'HINGLISH': 'Please respond in friendly, engaging Hinglish using simple Hindi words written in Latin script.'
  };

  const greetings = {
    ENGLISH: "✨ Welcome! Your cosmic journey with Guru ji begins... ✨",
    HINDI: "✨ स्वागत है! आपकी ज्योतिषीय यात्रा गुरु जी के साथ शुरू होती है... ✨",
    HINGLISH: "✨ Namaste! Aapki cosmic journey Guru ji ke saath shuru hoti hai... ✨"
  };


  const languageInstruction = instructionsMap[selectedLanguage] || instructionsMap['ENGLISH'];

  // ✅ Birth Details State (same structure as Auth.js)
  const [birthDetails, setBirthDetails] = useState({
    full_name: '',
    religion: 'Hindu',
    birth_day: '',
    birth_month: '',
    birth_year: '',
    birth_time: '',
    birth_place: '',
    timezone: 'Asia/Kolkata'
  });

  // ✅ Country and location state (same as Auth.js)
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'India',
    code: 'in',
    flag: '🇮🇳'
  });

  // ✅ Religion options with icons (same as Auth.js)
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

  // ✅ Countries list (same as Auth.js)
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

  // ✅ Date picker options (same as Auth.js)
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

  // ✅ Load prompts from backend
  const loadPrompts = async () => {
    try {
      setPromptsLoading(true);
      console.log('🔄 Loading prompts from backend API...');

      const response = await getAllPrompts();

      if (response.data.success) {
        setPrompts(response.data.data);
        console.log('✅ Prompts loaded from backend API successfully');
        console.log('📜 Prompts version:', response.data.data?.version || 'unknown');
        console.log('🌍 Languages available:', Object.keys(response.data.data?.languages || {}).join(', '));
        console.log('User language from settings:', user?.settings?.Language);
        console.log('Dropdown selectedLanguage:', selectedLanguage);

      } else {
        console.error('❌ Failed to load prompts:', response.data.error);
      }
    } catch (error) {
      console.error('❌ Error loading prompts from backend API:', error);
    } finally {
      setPromptsLoading(false);
    }
  };

  // Move getPrompt and related helpers here

  const getReligionPrompt = (religion, type = 'CONTEXT') => {
    const religionKey = religion?.toUpperCase() || 'HINDU';
    return getPrompt(`religion.${religionKey}.${type}`, getPrompt(`religion.HINDU.${type}`));
  };

  const getRandomTypingMessage = (religion) => {
    const religionKey = religion?.toUpperCase() || 'HINDU';
    const messages = getPrompt(`typing.${religionKey}`, []);
    console.log('🧘 Typing messages for', religionKey, messages);

    if (Array.isArray(messages) && messages.length > 0) {
      return messages[Math.floor(Math.random() * messages.length)];
    }

    return "🔮 Guru ji is consulting the cosmic energies... ✨";
  };


  // ✅ Get response instruction based on type
  const getResponseInstruction = () => {
    switch (responseType) {
      case 'QUICK':
        return getPrompt('base.RESPONSE_QUICK', 'Keep response SHORT (30-50 words max).');
      case 'NORMAL':
        return getPrompt('base.RESPONSE_NORMAL', 'Keep response MODERATE (80-150 words).');
      case 'DETAILED':
        return getPrompt('base.RESPONSE_DETAILED', 'Provide detailed response (180-250 words).');
      default:
        return getPrompt('base.RESPONSE_NORMAL', 'Keep response MODERATE (80-150 words).');
    }
  };

  // ✅ NEW: Fetch latest preferred language from backend
  /*
 const fetchPreferredLanguage = async () => {
    if (!user?.id) return;

    try {
      console.log('🌍 Fetching latest preferred language from backend...');
      const response = await getUserPreferences(user.id);

      if (response.data?.preferred_language) {
        const fetchedLanguage = response.data.preferred_language;
        console.log('✅ Fetched preferred language from backend:', fetchedLanguage);
        setSelectedLanguage(fetchedLanguage);

        // Optionally save to localStorage as well
        if (user?.id) {
          localStorage.setItem(`astroguru_language_${user.id}`, fetchedLanguage);
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch preferred language:', error);
      // Fallback to default if fetch fails
      setSelectedLanguage('ENGLISH');
    }
  };
*/
  // ✅ UPDATED: Fetch preferred language on component mount
  // ✅ NEW: Fetch settings on component mount
  // ✅ NEW with proper dependency array
  // ✅ UPDATED: Fetch settings on component mount - ALWAYS RUN FIRST
  useEffect(() => {
    console.log('🔄 DEBUG: Settings useEffect triggered');
    console.log('🔄 DEBUG: user?.userId:', user?.userId);
    console.log('🔄 DEBUG: prompts loaded:', !!prompts);

    // ✅ Run as soon as user is available, don't wait for hasInitialized
    if (user?.userId && prompts) {
      console.log('✅ Conditions met, calling fetchUserSettings IMMEDIATELY');
      fetchUserSettings();
    } else {
      console.log('⚠️ Conditions not met:', {
        hasUserId: !!user?.userId,
        hasPrompts: !!prompts
      });
    }
  }, [user?.userId, prompts]); // ✅ REMOVED hasInitialized dependency




  // ✅ UPDATED: Handle language selection with backend update

  // ✅ NEW: Update language setting in database
  // ✅ UPDATED: Update language setting with better flow
  const handleLanguageSelect = async (langKey) => {
    console.log('═══════════════════════════════════════════════');
    console.log('🔧 handleLanguageSelect called with:', langKey);
    console.log('🔧 Current userSettings:', userSettings);
    console.log('🔧 userSettings.SettingId:', userSettings?.SettingId);
    console.log('═══════════════════════════════════════════════');

    if (!userSettings?.SettingId && !user?.settings?.settingId) {
      console.error('❌ No settingId available anywhere!');
      return;
    }

    const settingIdToUse = userSettings?.SettingId || user?.settings?.settingId;
    console.log('🔧 Using settingId:', settingIdToUse);

    // ✅ Optimistic UI update
    setSelectedLanguage(langKey);
    setShowLanguageDropdown(false);

    try {
      console.log('⚙️ Updating language setting to:', langKey);
      console.log('⚙️ With settingId:', settingIdToUse);

      const response = await updateUserSettings(settingIdToUse, {
        Language: langKey,
        ModifiedBy: user?.full_name || 'User'
      });

      console.log('📥 Update response:', response.data);

      if (response.data.message === 'Settings updated successfully') {
        console.log('✅ Language setting updated successfully in database');

        // ✅ Refresh settings from database
        console.log('🔄 Refreshing settings from database...');
        await fetchUserSettings();

        console.log('✅ Settings refreshed, new language should be:', langKey);
        console.log('═══════════════════════════════════════════════');
      }
    } catch (error) {
      console.error('❌ Failed to update language setting:', error);
      console.error('❌ Error details:', error.response?.data || error.message);

      // Revert to previous setting
      await fetchUserSettings();
      console.log('═══════════════════════════════════════════════');
    }
  };

  // ✅ NEW: Cycle through response types on click
 const toggleResponseType = async () => {
  setResponseType((current) => {
    let next;
    if (current === 'QUICK') next = 'NORMAL';
    else if (current === 'NORMAL') next = 'DETAILED';
    else next = 'QUICK';

    // Update in DB
    if (userSettings?.SettingId || user?.settings?.settingId) {
      const settingIdToUse = userSettings?.SettingId || user?.settings?.settingId;
      updateUserSettings(settingIdToUse, {
        MessageType: next,
        ModifiedBy: user?.full_name || 'User'
      });
    }
    return next;
  });
};



  // ✅ Full 100 suggestion questions grouped by category
  const allSuggestions = [
    // 🌌 Life Purpose & General (1–20)
    "What is my life purpose according to my birth chart?",
    "Am I destined for fame or recognition?",
    "Which phase of life will be most successful for me?",
    "What is my true personality based on my horoscope?",
    "Will I have a stable and peaceful life?",
    "Am I facing any doshas (manglik, kaal sarp, pitru dosh, etc.) in my chart?",
    "Will I travel abroad permanently?",
    "Which country or city is best for me to live in?",
    "Will I achieve spiritual growth in this lifetime?",
    "What are my strengths and weaknesses astrologically?",
    "What past life karma is affecting my present?",
    "Which planetary period (Mahadasha) will change my life?",
    "Am I under Shani Sade Sati or Dhaiya? What does it mean?",
    "How will my 2025 (or any year) be astrologically?",
    "What is my lucky gemstone?",
    "Which god/goddess should I worship for success?",
    "What are my lucky colors and numbers?",
    "When will I find peace and stability in life?",
    "Is my destiny strong or weak?",
    "What remedies can balance my planets?",

    // 💼 Career & Education (21–40)
    "Which career suits me best – job, business, or creative field?",
    "Am I in the right profession according to astrology?",
    "When will I get a stable job?",
    "Will I get a government job?",
    "Do I have chances to clear competitive exams?",
    "Should I pursue higher education or work?",
    "Will I be successful if I study abroad?",
    "Which field of study is best for me?",
    "When will I get a promotion?",
    "Will I face sudden job loss or instability?",
    "Is freelancing/business good for me?",
    "What kind of business will bring me success?",
    "Do I have chances to become a leader/CEO?",
    "Which planets control my professional life?",
    "What is the right time to switch jobs?",
    "Will I work in IT/finance/arts/medicine (specific field)?",
    "Is foreign career growth indicated in my chart?",
    "How can I overcome obstacles in my career?",
    "Will my hard work be rewarded soon?",
    "Which period will bring the peak of my career success?",

    // ❤️ Love & Relationships (41–60)
    "When will I meet my soulmate?",
    "Is love marriage or arranged marriage in my destiny?",
    "Will my family approve of my love marriage?",
    "Is my partner loyal and compatible with me?",
    "Do I have chances of inter-caste or inter-religion marriage?",
    "When will I get married?",
    "Will I have more than one marriage?",
    "How will my married life be?",
    "Do I have chances of separation or divorce?",
    "Will I reunite with my ex-partner?",
    "What kind of life partner is destined for me?",
    "Which zodiac sign is most compatible with me?",
    "Will I face delays in marriage?",
    "Are there any marriage-related doshas in my kundli?",
    "Will my partner support my career?",
    "Will I have a love story that lasts forever?",
    "How many children will I have?",
    "Will my children be successful?",
    "What remedies can improve my married life?",
    "How will my relationship with in-laws be?",

    // 💰 Finance & Wealth (61–80)
    "Will I ever become rich?",
    "When will I see financial stability?",
    "Which source of income is most favorable for me?",
    "Do I have chances of sudden wealth?",
    "Will I win a lottery or jackpot?",
    "Are there financial ups and downs in my horoscope?",
    "Which investments are good for me – stock, gold, or property?",
    "Will I inherit property from family?",
    "Is real estate a good option for me?",
    "When will I clear my debts?",
    "Will I face financial losses in the future?",
    "What is the right time to buy a house?",
    "What is the right time to buy a vehicle?",
    "Do I have dhan yoga in my horoscope?",
    "Will I be financially independent?",
    "Should I take financial risks now?",
    "Will I become a self-made millionaire?",
    "What is the financial impact of my current planetary period?",
    "Which planet rules my wealth?",
    "What remedies can improve my financial growth?",

    // 🧘 Health & Well-being (81–90)
    "What health problems are shown in my horoscope?",
    "Do I have a long life?",
    "Will I suffer from chronic illness?",
    "How can I maintain good health astrologically?",
    "Which planet affects my health the most?",
    "Will I recover from my current illness?",
    "Do I need to be careful about accidents?",
    "What is the best time for surgery or treatment?",
    "Which yoga or meditation will suit me?",
    "Which remedies protect me from health issues?",

    // 🌠 Spirituality & Miscellaneous (91–100)
    "What is my spiritual path?",
    "Do I have a strong intuition or psychic abilities?",
    "Will I ever become a spiritual leader or healer?",
    "Which mantra or puja is best for me?",
    "How do planets affect my karma?",
    "What lessons am I supposed to learn in this life?",
    "Do I have yogas for moksha (liberation)?",
    "Which deity should I worship for blessings?",
    "Are my dreams connected to astrology?",
    "How can I balance my mind, body, and soul using astrology?",

    // 🌌 जीवन उद्देश्य (1–20)
    "मेरी जन्म कुंडली के अनुसार मेरा जीवन उद्देश्य क्या है?",
    "क्या मैं प्रसिद्धि या पहचान के लिए नियत हूं?",
    "मेरे जीवन का कौन सा चरण सबसे सफल होगा?",
    "मेरी कुंडली के अनुसार मेरा असली व्यक्तित्व क्या है?",
    "क्या मेरा जीवन स्थिर और शांतिपूर्ण होगा?",
    "क्या मेरी कुंडली में कोई दोष (मंगलिक, कालसर्प, पितृ दोष आदि) है?",
    "क्या मैं स्थायी रूप से विदेश यात्रा करूंगा?",
    "मेरे लिए कौन सा देश या शहर सबसे अच्छा रहेगा?",
    "क्या मुझे इस जीवन में आध्यात्मिक उन्नति मिलेगी?",
    "मेरी ज्योतिषीय ताकतें और कमजोरियां क्या हैं?",
    "कौन सा पिछले जन्म का कर्म मेरे वर्तमान को प्रभावित कर रहा है?",
    "कौन सी महादशा मेरे जीवन को बदल देगी?",
    "क्या मैं शनि साढ़े साती या ढैय्या से गुजर रहा हूं? इसका क्या मतलब है?",
    "मेरा 2025 (या कोई भी वर्ष) ज्योतिषीय रूप से कैसा होगा?",
    "मेरा भाग्यशाली रत्न कौन सा है?",
    "सफलता के लिए मुझे किस देवता/देवी की पूजा करनी चाहिए?",
    "मेरे शुभ रंग और अंक कौन से हैं?",
    "मुझे जीवन में शांति और स्थिरता कब मिलेगी?",
    "क्या मेरी किस्मत मजबूत है या कमजोर?",
    "मेरे ग्रहों को संतुलित करने के लिए क्या उपाय हैं?",

    // 💼 करियर और शिक्षा (21–40)
    "मेरे लिए कौन सा करियर सही है – नौकरी, व्यवसाय या रचनात्मक क्षेत्र?",
    "क्या मैं ज्योतिष के अनुसार सही पेशे में हूं?",
    "मुझे स्थायी नौकरी कब मिलेगी?",
    "क्या मुझे सरकारी नौकरी मिलेगी?",
    "क्या मेरे पास प्रतियोगी परीक्षाओं में सफल होने के योग हैं?",
    "क्या मुझे उच्च शिक्षा लेनी चाहिए या काम करना चाहिए?",
    "क्या मैं विदेश में पढ़ाई करके सफल होऊंगा?",
    "मेरे लिए कौन सा अध्ययन क्षेत्र सबसे अच्छा है?",
    "मुझे पदोन्नति कब मिलेगी?",
    "क्या मुझे अचानक नौकरी छूटने या अस्थिरता का सामना करना पड़ेगा?",
    "क्या मेरे लिए फ्रीलांसिंग/व्यवसाय अच्छा रहेगा?",
    "किस प्रकार का व्यवसाय मुझे सफलता देगा?",
    "क्या मेरे पास नेता/सीईओ बनने के योग हैं?",
    "कौन से ग्रह मेरे पेशेवर जीवन को नियंत्रित करते हैं?",
    "नौकरी बदलने का सही समय कब है?",
    "क्या मैं आईटी/वित्त/कला/चिकित्सा (विशिष्ट क्षेत्र) में काम करूंगा?",
    "क्या मेरी कुंडली में विदेश करियर का संकेत है?",
    "मैं अपने करियर में बाधाओं को कैसे दूर करूं?",
    "क्या मेरी मेहनत का फल जल्द मिलेगा?",
    "मेरे करियर की सफलता का शिखर किस अवधि में आएगा?",

    // ❤️ प्रेम और संबंध (41–60)
    "मैं अपने जीवन साथी से कब मिलूंगा?",
    "क्या मेरी नियति में लव मैरिज है या अरेंज मैरिज?",
    "क्या मेरा परिवार मेरी लव मैरिज को स्वीकार करेगा?",
    "क्या मेरा साथी वफादार और अनुकूल होगा?",
    "क्या मेरे पास अंतरजातीय या अंतरधार्मिक विवाह के योग हैं?",
    "मेरी शादी कब होगी?",
    "क्या मेरी एक से अधिक शादी होगी?",
    "मेरा वैवाहिक जीवन कैसा रहेगा?",
    "क्या मेरे पास अलगाव या तलाक के योग हैं?",
    "क्या मैं अपने पूर्व साथी से दोबारा मिलूंगा?",
    "मेरे लिए किस प्रकार का जीवनसाथी नियत है?",
    "कौन सा राशि चिह्न मेरे लिए सबसे अनुकूल है?",
    "क्या मेरी शादी में देरी होगी?",
    "क्या मेरी कुंडली में विवाह से संबंधित कोई दोष है?",
    "क्या मेरा साथी मेरे करियर को समर्थन देगा?",
    "क्या मेरी प्रेम कहानी हमेशा के लिए चलेगी?",
    "मेरे कितने बच्चे होंगे?",
    "क्या मेरे बच्चे सफल होंगे?",
    "मेरे वैवाहिक जीवन को बेहतर बनाने के उपाय क्या हैं?",
    "ससुराल पक्ष के साथ मेरा संबंध कैसा रहेगा?",

    // 💰 वित्त और धन (61–80)
    "क्या मैं कभी अमीर बनूंगा?",
    "मुझे वित्तीय स्थिरता कब मिलेगी?",
    "मेरे लिए कौन सा आय स्रोत सबसे अनुकूल है?",
    "क्या मेरे पास अचानक धन प्राप्ति के योग हैं?",
    "क्या मैं लॉटरी या जैकपॉट जीतूंगा?",
    "क्या मेरी कुंडली में वित्तीय उतार-चढ़ाव हैं?",
    "मेरे लिए कौन सा निवेश अच्छा रहेगा – शेयर, सोना या संपत्ति?",
    "क्या मुझे परिवार से संपत्ति विरासत में मिलेगी?",
    "क्या मेरे लिए रियल एस्टेट अच्छा विकल्प है?",
    "मैं अपने कर्ज कब चुकाऊंगा?",
    "क्या मुझे भविष्य में वित्तीय नुकसान का सामना करना पड़ेगा?",
    "घर खरीदने का सही समय कब है?",
    "वाहन खरीदने का सही समय कब है?",
    "क्या मेरी कुंडली में धन योग है?",
    "क्या मैं आर्थिक रूप से स्वतंत्र होऊंगा?",
    "क्या मुझे अभी वित्तीय जोखिम लेना चाहिए?",
    "क्या मैं सेल्फ-मेड करोड़पति बनूंगा?",
    "मेरे वर्तमान ग्रह काल का मेरे वित्त पर क्या प्रभाव है?",
    "कौन सा ग्रह मेरी संपत्ति को नियंत्रित करता है?",
    "मेरी आर्थिक वृद्धि को बेहतर करने के उपाय क्या हैं?",

    // 🧘 स्वास्थ्य और कल्याण (81–90)
    "मेरी कुंडली में कौन सी स्वास्थ्य समस्याएं दिखाई देती हैं?",
    "क्या मेरी लंबी उम्र है?",
    "क्या मैं किसी पुरानी बीमारी से पीड़ित रहूंगा?",
    "मैं ज्योतिषीय रूप से अच्छा स्वास्थ्य कैसे बनाए रखूं?",
    "कौन सा ग्रह मेरे स्वास्थ्य को सबसे ज्यादा प्रभावित करता है?",
    "क्या मैं अपनी वर्तमान बीमारी से ठीक हो जाऊंगा?",
    "क्या मुझे दुर्घटनाओं से सावधान रहना चाहिए?",
    "सर्जरी या इलाज के लिए सबसे अच्छा समय कब है?",
    "मेरे लिए कौन सा योग या ध्यान सबसे उपयुक्त होगा?",
    "कौन से उपाय मुझे स्वास्थ्य समस्याओं से बचाते हैं?",

    // 🌠 अध्यात्म और विविध (91–100)
    "मेरा आध्यात्मिक मार्ग क्या है?",
    "क्या मेरे पास मजबूत अंतर्ज्ञान या मानसिक क्षमताएं हैं?",
    "क्या मैं कभी आध्यात्मिक नेता या हीलर बनूंगा?",
    "मेरे लिए कौन सा मंत्र या पूजा सबसे अच्छा है?",
    "ग्रह मेरे कर्मों को कैसे प्रभावित करते हैं?",
    "मुझे इस जीवन में कौन से सबक सीखने हैं?",
    "क्या मेरी कुंडली में मोक्ष योग है?",
    "आशीर्वाद के लिए मुझे किस देवता की पूजा करनी चाहिए?",
    "क्या मेरे सपने ज्योतिष से जुड़े हुए हैं?",
    "मैं ज्योतिष के माध्यम से मन, शरीर और आत्मा का संतुलन कैसे बना सकता हूं?",

    "Meri kundli ke hisaab se mera life purpose kya hai?",
    "Kya main fame ya recognition ke liye destined hoon?",
    "Mere life ka kaunsa phase sabse successful hoga?",
    "Meri kundli ke hisaab se mera asli personality kya hai?",
    "Kya mera jeevan stable aur peaceful hoga?",
    "Kya meri kundli me dosh (Manglik, Kaal Sarp, Pitru Dosh, etc.) hai?",
    "Kya main permanently abroad shift ho jaunga?",
    "Mere liye kaunsa desh ya sheher best hoga?",
    "Kya main is janam me spiritual growth paaunga?",
    "Meri kundli ke strengths aur weaknesses kya hain?",
    "Kaunsa past life karma meri life ko affect kar raha hai?",
    "Kaunsi Mahadasha meri zindagi badal degi?",
    "Kya main Shani Sade Sati ya Dhaiya me hoon? Uska matlab kya hai?",
    "Mera 2025 (ya koi bhi year) jyotish ke hisaab se kaisa hoga?",
    "Mera lucky gemstone kaunsa hai?",
    "Success ke liye mujhe kis devta/devi ki pooja karni chahiye?",
    "Mere lucky colors aur numbers kaunse hain?",
    "Mujhe shanti aur stability life me kab milegi?",
    "Meri destiny strong hai ya weak?",
    "Mere grahon ko balance karne ke liye kya upay hain?",

    // 💼 Career & Education (21–40)
    "Mere liye kaunsa career sahi hai – job, business ya creative field?",
    "Kya main astrology ke hisaab se right profession me hoon?",
    "Mujhe stable job kab milegi?",
    "Kya mujhe government job milegi?",
    "Kya mere paas competitive exams clear karne ke chances hain?",
    "Mujhe higher education pursue karni chahiye ya work karna chahiye?",
    "Kya main abroad study karke successful ho paunga?",
    "Mere liye kaunsa field of study best hai?",
    "Mujhe promotion kab milega?",
    "Kya mujhe sudden job loss ya instability ka samna karna padega?",
    "Kya freelancing/business mere liye sahi hai?",
    "Kaunsa business mujhe success dilayega?",
    "Kya mere paas leader/CEO banne ke chances hain?",
    "Kaunse grah mere professional life ko control karte hain?",
    "Job switch karne ka sahi time kab hai?",
    "Kya main IT/finance/arts/medicine (specific field) me kaam karunga?",
    "Kya meri kundli me foreign career growth ke yog hain?",
    "Main apne career ke obstacles kaise overcome karun?",
    "Kya meri hard work ka fal jaldi milega?",
    "Mere career success ka peak period kaunsa hoga?",

    // ❤️ Love & Relationships (41–60)
    "Main apne soulmate se kab milunga?",
    "Meri destiny me love marriage hai ya arranged marriage?",
    "Kya mera family meri love marriage approve karega?",
    "Kya mera partner vafadar aur anukool hoga?",
    "Kya mere paas inter-caste ya inter-religion marriage ke chances hain?",
    "Meri shaadi kab hogi?",
    "Kya meri ek se zyada shaadi hogi?",
    "Mera married life kaisa hoga?",
    "Kya mere paas separation ya divorce ke chances hain?",
    "Kya main apne ex-partner ke saath wapas milunga?",
    "Mere liye kaunsa life partner destined hai?",
    "Kaunsi zodiac sign mere liye sabse compatible hai?",
    "Kya meri shaadi me delay hoga?",
    "Kya meri kundli me marriage related dosh hain?",
    "Kya mera partner meri career support karega?",
    "Kya meri love story hamesha ke liye chalegi?",
    "Mere kitne bachche honge?",
    "Kya mere bachche successful honge?",
    "Mere married life ko improve karne ke upay kya hain?",
    "Mera relationship in-laws ke saath kaisa hoga?",

    // 💰 Finance & Wealth (61–80)
    "Kya main kabhi ameer banunga?",
    "Mujhe financial stability kab milegi?",
    "Mere liye kaunsa income source sabse favorable hai?",
    "Kya mere paas sudden wealth ke chances hain?",
    "Kya main lottery ya jackpot jeetunga?",
    "Kya meri kundli me financial ups and downs hain?",
    "Mere liye kaunsa investment best hai – shares, sona ya property?",
    "Kya mujhe family se property inherit hogi?",
    "Kya real estate mere liye achha option hai?",
    "Main apne debts kab clear karunga?",
    "Kya mujhe future me financial losses face karne padenge?",
    "House buy karne ka sahi time kab hai?",
    "Vehicle kharidne ka sahi time kab hai?",
    "Kya meri kundli me dhan yoga hai?",
    "Kya main financially independent banunga?",
    "Kya mujhe abhi financial risk lena chahiye?",
    "Kya main self-made millionaire banunga?",
    "Mere current planetary period ka financial impact kya hai?",
    "Kaunsa grah meri wealth rule karta hai?",
    "Meri financial growth improve karne ke upay kya hain?",

    // 🧘 Health & Well-being (81–90)
    "Meri kundli me kaunse health problems dikh rahe hain?",
    "Kya meri long life hai?",
    "Kya main chronic illness se suffer karunga?",
    "Main astrology ke hisaab se good health kaise maintain karun?",
    "Kaunsa grah mere health ko sabse zyada affect karta hai?",
    "Kya main apni current illness se recover karunga?",
    "Kya mujhe accidents se bachna chahiye?",
    "Surgery ya treatment ke liye sabse acha time kab hai?",
    "Mere liye kaunsa yoga ya meditation best hoga?",
    "Kaunse upay mujhe health issues se protect karte hain?",

    // 🌠 Spirituality & Misc (91–100)
    "Mera spiritual path kya hai?",
    "Kya mere paas strong intuition ya psychic abilities hain?",
    "Kya main kabhi spiritual leader ya healer banunga?",
    "Mere liye kaunsa mantra ya puja best hai?",
    "Planets mere karma ko kaise affect karte hain?",
    "Mujhe is life me kaunse lessons seekhne hain?",
    "Kya meri kundli me moksha yog hai?",
    "Blessings ke liye mujhe kis devta ki pooja karni chahiye?",
    "Kya mere sapne astrology se connected hain?",
    "Main astrology ke through mind, body aur soul ka balance kaise banaun?"

  ];



  const handleInputWithSuggestions = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length > 1) {
      const matches = allSuggestions
        .filter(q => q.toLowerCase().includes(value.toLowerCase()))
      // only top 3
      setFilteredSuggestions(matches);
    } else {
      setFilteredSuggestions([]);
    }
  };





  // ✅ NEW: Get language instruction from backend
  const getLanguageInstruction = (languageKey) => {
    const instruction = getPrompt(`languages.${languageKey}.INSTRUCTION`, getPrompt('languages.ENGLISH.INSTRUCTION', 'Respond in clear English only.'));
    console.log(`🌍 Language instruction for ${languageKey}:`, instruction);
    return instruction;
  };

  // ✅ NEW: Get language display name
  const getLanguageDisplayName = (languageKey) => {
    return getPrompt(`languages.${languageKey}.DISPLAY_NAME`, languageKey);
  };

  // ✅ NEW: Get available languages from backend
  const getAvailableLanguages = () => {
    const languages = getPrompt('languages', {});
    return Object.keys(languages).map(key => ({
      key,
      displayName: languages[key]?.DISPLAY_NAME || key
    }));
  };

  // ✅ NEW: Fetch user settings from database
  // ✅ NEW: Fetch user settings from database with DEBUG LOGS
  // ✅ UPDATED: Fetch user settings from database with comprehensive logging
  const fetchUserSettings = async () => {
    console.log('═══════════════════════════════════════════════');
    console.log('🔍 DEBUG: fetchUserSettings START');
    console.log('🔍 DEBUG: user object:', user);
    console.log('🔍 DEBUG: user.userId:', user?.userId);
    console.log('═══════════════════════════════════════════════');

    if (!user?.userId) {
      console.log('⚠️ No userId available for fetching settings');
      console.log('⚠️ DEBUG: user.settings from login:', user?.settings);

      // Fallback to user.settings from login if available
      if (user?.settings) {
        console.log('✅ Using settings from login response');
        const settings = user.settings;
        setUserSettings(settings);
        setSelectedLanguage(settings.Language || 'ENGLISH');
        setShortResponse(settings.MessageType === 'SHORT_LIMIT');

        console.log('✅ Fallback settings applied:', {
          language: settings.Language,
          messageType: settings.MessageType,
          shortResponse: settings.MessageType === 'SHORT_LIMIT'
        });
      } else {
        console.log('⚠️ No settings available, using defaults');
        setSelectedLanguage('ENGLISH');
        setShortResponse(true);
      }
      return;
    }

    try {
      console.log('⚙️ FETCHING user settings from database for userId:', user.userId);
      const response = await getUserSettings(user.userId);

      console.log('📥 DEBUG: API response:', response);
      console.log('📥 DEBUG: API response.data:', response.data);

      if (response.data) {
        const settings = response.data;

        console.log('✅ User settings fetched from database:', settings);
        console.log('📊 Settings breakdown:', {
          SettingId: settings.SettingId,
          Language: settings.Language,
          MessageType: settings.MessageType,
          IsActive: settings.IsActive
        });

        // ✅ Update all states in sequence with logging
        console.log('🔧 Step 1: Updating userSettings state...');
        setUserSettings(settings);

        console.log('🔧 Step 2: Updating selectedLanguage to:', settings.Language || 'ENGLISH');
        setSelectedLanguage(settings.Language || 'ENGLISH');

        console.log('🔧 Step 3: Updating shortResponse to:', settings.MessageType === 'SHORT_LIMIT');
        setShortResponse(settings.MessageType === 'SHORT_LIMIT');

        // ✅ Force a re-render after state updates
        setTimeout(() => {
          console.log('🎯 VERIFICATION after state updates:');
          console.log('🎯 selectedLanguage should be:', settings.Language);
          console.log('🎯 shortResponse should be:', settings.MessageType === 'SHORT_LIMIT');
        }, 100);

        console.log('⚙️ Settings successfully applied to UI');
        console.log('═══════════════════════════════════════════════');

      } else {
        console.error('❌ No data in response');
        throw new Error('No settings data received');
      }
    } catch (error) {
      console.error('❌ Failed to fetch user settings:', error);
      console.error('❌ Error details:', error.response?.data || error.message);

      // Fallback to defaults
      console.log('⚠️ Falling back to defaults');
      setSelectedLanguage('ENGLISH');
      setShortResponse(true);

      console.log('═══════════════════════════════════════════════');
    }
  };




  const replaceTemplate = (template, replacements) => {
    let result = template;
    Object.keys(replacements).forEach(key => {
      const placeholder = `{${key}}`;
      result = result.replace(
        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        replacements[key] || ''
      );
    });
    return result;
  };

  // ✅ VALIDATION FUNCTIONS (same as Auth.js)
  const validateBirthDetails = () => {
    const required = ['full_name', 'religion', 'birth_day', 'birth_month', 'birth_year', 'birth_time', 'birth_place'];
    const missing = required.filter(field => !birthDetails[field]);

    if (missing.length > 0) {
      console.log(`⚠️ Please fill in all required fields: ${missing.join(', ')}`);
      return false;
    }
    return true;
  };

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

  // ✅ BIRTH DETAILS MANAGEMENT FUNCTIONS (same as Auth.js)
  const handleBirthDetailsChange = (field, value) => {
    setBirthDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearBirthDetails = () => {
    setBirthDetails({
      full_name: '',
      religion: 'Hindu',
      birth_day: '',
      birth_month: '',
      birth_year: '',
      birth_time: '',
      birth_place: '',
      timezone: 'Asia/Kolkata'
    });
    setPlaceSuggestions([]);
    setShowSuggestions(false);
  };

  // ✅ RELIGION SELECTION FUNCTIONS (same as Auth.js)
  const handleReligionSelect = (religion) => {
    handleBirthDetailsChange('religion', religion.value);
    setShowReligionDropdown(false);
  };

  const toggleReligionDropdown = () => {
    setShowReligionDropdown(!showReligionDropdown);
  };

  // ✅ COUNTRY SELECTION FUNCTIONS (same as Auth.js)
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    handleBirthDetailsChange('birth_place', '');
    setPlaceSuggestions([]);
    setSearchQuery('');
  };

  const toggleCountryDropdown = () => {
    setShowCountryDropdown(!showCountryDropdown);
  };

  // ✅ LOCATION SEARCH FUNCTIONS (same as Auth.js)
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
      let formattedPlace = '';

      if (place.main_text && place.secondary_text) {
        const mainText = place.main_text.trim();
        const secondaryText = place.secondary_text.trim();
        formattedPlace = `${mainText}, ${secondaryText}`;
      } else {
        formattedPlace = place.description || place.formatted_address || place.main_text || 'Selected Location';
      }

      handleBirthDetailsChange('birth_place', formattedPlace);
      setShowSuggestions(false);
      setTimeout(() => setPlaceSuggestions([]), 200);
    } catch (error) {
      console.error('❌ Error selecting place:', error);
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

  // ✅ CLOCK HELPER FUNCTIONS (same as Auth.js)
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

  // ✅ DATE & TIME HANDLERS (same as Auth.js)
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

  // ✅ NEW: Birth Details Modal Functions
  const openBirthDetailsPopup = () => {
    console.log('🎉 Opening birth details popup for temporary profile');
    setShowBirthDetailsPopup(true);
    // Reset birth details
    clearBirthDetails();
  };

  const closeBirthDetailsPopup = () => {
    console.log('❌ Closing birth details popup');
    setShowBirthDetailsPopup(false);
    setShowReligionDropdown(false);
    setShowCountryDropdown(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowSuggestions(false);
    setSearchQuery('');
    clearBirthDetails();
  };

  // ✅ NEW: Handle temporary birth details save
  const handleRegistrationComplete = () => {
    // Validate required fields
    if (!validateBirthDetails() || !isValidDate()) {
      alert('Please fill all required fields with valid information');
      return;
    }

    setIsLoading(true);

    try {
      // Create temporary birth profile
      const birthDate = `${birthDetails.birth_year}-${birthDetails.birth_month.toString().padStart(2, '0')}-${birthDetails.birth_day.toString().padStart(2, '0')}`;

      const tempProfile = {
        ...birthDetails,
        birth_date: birthDate,
        given_name: birthDetails.full_name.split(' ')[0],
        timestamp: new Date().toISOString()
      };

      // Store in session (temporary)
      setTempBirthProfile(tempProfile);
      sessionStorage.setItem('astroguru_temp_profile', JSON.stringify(tempProfile));

      console.log('✅ Temporary birth profile created:', tempProfile);

      // Close popup
      closeBirthDetailsPopup();

      // Show success message
      push({
        message: `**🎉 Welcome ${tempProfile.given_name}!** Your profile has been created for this session. I now have access to your birth details: **Born on ${tempProfile.birth_date} at ${tempProfile.birth_time} in ${tempProfile.birth_place}, ${selectedCountry.name}** (${tempProfile.religion} spiritual context). Ask me any astrological question and I'll provide personalized insights! ✨`,
        direction: 'incoming',
        sender: 'assistant',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error creating temporary profile:', error);
      alert('Error creating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  /*
    useEffect(() => {
      if (user?.preferred_language && user.preferred_language !== selectedLanguage) {
        setSelectedLanguage(user.preferred_language);
      }
    }, [user?.preferred_language]);
  */
  // ✅ Sync selectedLanguage when user.settings changes from login
  useEffect(() => {
    if (user?.settings?.Language && user.settings.Language !== selectedLanguage) {
      console.log('🔄 Syncing language from user.settings:', user.settings.Language);
      setSelectedLanguage(user.settings.Language);
    }
  }, [user?.settings?.Language]);

  // Load temporary profile from session storage
  useEffect(() => {
    const savedTempProfile = sessionStorage.getItem('astroguru_temp_profile');
    if (savedTempProfile) {
      try {
        const profile = JSON.parse(savedTempProfile);
        setTempBirthProfile(profile);
        console.log('🔄 Loaded temporary profile from session:', profile);
      } catch (error) {
        console.error('❌ Error loading temporary profile:', error);
        sessionStorage.removeItem('astroguru_temp_profile');
      }
    }
  }, []);

  // ✅ Initialize prompts on component mount
  useEffect(() => {
    loadPrompts();
  }, []);
  /*
    // ✅ Load language preference from localStorage
    const loadLanguagePreference = () => {
      if (!user?.id) return 'ENGLISH';
  
      const savedLanguage = localStorage.getItem(`astroguru_language_${user.id}`);
      return savedLanguage || 'ENGLISH';
    };
  */
  // ✅ UPDATED: Load chat history from database
  const loadChatHistory = async () => {
    if (!user?.id) return [];

    try {
      console.log('📜 Loading chat history from database for user:', user.id);
      const response = await getChatHistory(user.id);

      if (response.data.success) {
        const groupedMessages = response.data.data;

        // Flatten grouped messages into a single array for display
        const allMessages = [];
        Object.keys(groupedMessages).sort().forEach(dateKey => {
          groupedMessages[dateKey].forEach(msg => {
            allMessages.push({
              message: msg.message,
              direction: msg.direction,
              sender: msg.sender,
              timestamp: msg.timestamp
            });
          });
        });

        console.log(`✅ Loaded ${allMessages.length} messages from database`);
        return allMessages;
      }
    } catch (error) {
      console.error('❌ Error loading chat history from database:', error);
    }

    return [];
  };

  // Load first question status from localStorage
  const loadFirstQuestionStatus = () => {
    if (!user?.id) return true;

    const savedStatus = localStorage.getItem(`astroguru_first_question_${user.id}`);
    return savedStatus ? JSON.parse(savedStatus) : true;
  };

  // ✅ Load short response preference from localStorage
  const loadResponsePreference = () => {
    if (!user?.id) return true;

    const savedPreference = localStorage.getItem(`astroguru_short_response_${user.id}`);
    return savedPreference ? JSON.parse(savedPreference) : true;
  };

  // Load draft message from localStorage
  const loadDraftMessage = () => {
    if (!user?.id) return '';

    const savedDraft = localStorage.getItem(`astroguru_draft_${user.id}`);
    return savedDraft || '';
  };

  // ✅ Load free horoscope status from localStorage
  const loadFreeHoroscopeStatus = () => {
    if (!user?.id) return false;

    const savedStatus = localStorage.getItem(`astroguru_free_horoscope_${user.id}`);
    return savedStatus ? JSON.parse(savedStatus) : false;
  };

  // ✅ UPDATED: Initialize with database chat history
  useEffect(() => {
    if (user?.userId && !hasInitialized && prompts) {
      const loadInitialData = async () => {
        // ✅ STEP 1: Fetch settings FIRST
        console.log('🔧 Step 1: Fetching user settings...');
        await fetchUserSettings();

        // ✅ STEP 2: Then load chat history
        console.log('📚 Step 2: Loading chat history...');
        const savedMessages = await loadChatHistory();
        const savedFirstQuestion = savedMessages.length === 0;
        const savedDraft = loadDraftMessage();
        const savedResponsePreference = loadResponsePreference();

        setMessages(savedMessages);
        setIsFirstQuestion(savedFirstQuestion);
        setDraftMessage(savedDraft);
        setInputValue(savedDraft);
        setShortResponse(savedResponsePreference);
        setHasInitialized(true);

        console.log('📚 Loaded chat data from DATABASE:', {
          messagesCount: savedMessages.length,
          isFirstQuestion: savedFirstQuestion,
          hasDraft: !!savedDraft,
          shortResponse: savedResponsePreference,
          language: userSettings?.Language || selectedLanguage,
          religion: user.religion,
          promptsVersion: prompts?.version
        });
      };
      loadInitialData();
    }
  }, [user?.userId, hasInitialized, prompts]);


  // Save first question status whenever it changes
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`astroguru_first_question_${user.id}`, JSON.stringify(isFirstQuestion));
    }
  }, [isFirstQuestion, user?.id]);

  // ✅ Save response preference whenever it changes
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`astroguru_short_response_${user.id}`, JSON.stringify(shortResponse));
    }
  }, [shortResponse, user?.id]);

  // ✅ NEW: Save language preference whenever it changes

  // Save draft message whenever input changes
  useEffect(() => {
    if (user?.id) {
      setDraftMessage(inputValue);
      localStorage.setItem(`astroguru_draft_${user.id}`, inputValue);
    }
  }, [inputValue, user?.id]);

  // ✅ Enhanced auto-welcome trigger with one-time horoscope check
  useEffect(() => {
    if (
      user?.id &&
      hasInitialized &&
      messages.length === 0 &&
      effectRan.current === false &&
      prompts
    ) {
      console.log('🎯 Running initial welcome with Backend Prompts');
      effectRan.current = true;

      setTimeout(() => {
        showWelcomeAndHoroscope();
      }, 100);
    }
  }, [user?.id, hasInitialized, messages.length, prompts]);

  // ✅ Body class management for modals (same as Auth.js)
  useEffect(() => {
    if (showDatePicker || showTimePicker) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showDatePicker, showTimePicker]);

  useEffect(() => {
    const chatContainer = document.querySelector('.chatbot-container');
    if (chatContainer) {
      if (tempBirthProfile) {
        chatContainer.classList.add('has-temp-profile');
      } else {
        chatContainer.classList.remove('has-temp-profile');
      }
    }
  }, [tempBirthProfile]);

  useEffect(() => {
    if (showBirthDetailsPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showBirthDetailsPopup]);

  // ✅ NEW: Close dropdowns when clicking outside (same as Auth.js)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const countryDropdown = document.querySelector('.country-dropdown-container');
      const placeDropdown = document.querySelector('.place-dropdown-container');
      const religionDropdown = document.querySelector('.religion-dropdown-container');
      const languageDropdown = document.querySelector('.language-dropdown-container');

      if (countryDropdown && !countryDropdown.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (placeDropdown && !placeDropdown.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (religionDropdown && !religionDropdown.contains(event.target)) {
        setShowReligionDropdown(false);
      }
      if (languageDropdown && !languageDropdown.contains(event.target)) {
        setShowLanguageDropdown(false);
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

  useEffect(() => {
    if (!showSettings) return;

    const handleClickOutside = (event) => {
      const settingsEl = document.querySelector('.settings-row');
      if (settingsEl && !settingsEl.contains(event.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showSettings]);

  // ✅ Force UI update when settings change
  // ✅ NEW: Force language dropdown to update when selectedLanguage changes
  // Save settings when they change
  // ✅ Save settings to DB when they change
  useEffect(() => {
    if (user?.id && promptsData) {
      const saveSettings = async () => {
        try {
          console.log('💾 Saving settings to DB:', {
            language: selectedLanguage,
            messageType: messageType,
            responseType: responseType
          });

          await updateUserSettings({
            userId: user.id,
            language: selectedLanguage,
            messageType: messageType,
            responseType: responseType
          });

          console.log('✅ Settings saved successfully');
        } catch (error) {
          console.error('❌ Error saving settings:', error);
        }
      };

      // Debounce save by 500ms to avoid too many API calls
      const timeoutId = setTimeout(saveSettings, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedLanguage, messageType, responseType, user?.id]);





  // ✅ UPDATED: Clear chat from database
  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear all messages? This will permanently delete your chat history from the database.')) {
      try {
        console.log('🗑️ Deleting chat history from database...');
        const response = await deleteChatHistory(user.id);

        if (response.data.success) {
          setMessages([]);
          setIsFirstQuestion(true);
          setTempBirthProfile(null);
          sessionStorage.removeItem('astroguru_temp_profile');
          if (user?.id) {
            localStorage.removeItem(`astroguru_first_question_${user.id}`);
          }
          setShowSettings(false);
          console.log('✅ Chat history deleted from database:', response.data.deletedCount, 'messages');
        }
      } catch (error) {
        console.error('❌ Error deleting chat history:', error);
        alert('Failed to delete chat history. Please try again.');
      }
    }
  };

  const push = msg => setMessages(prev => [...prev, msg]);

  // ✅ UPDATED: Backend-based religion-specific Guru messages
  const getRandomGuruMessage = () => {
    const religion = tempBirthProfile?.religion || user?.religion || 'Hindu';
    return getRandomTypingMessage(religion);
  };

  // ✅ UPDATED: Backend-based user profile context with temporary birth details
  const getUserProfileContext = () => {
    if (!prompts) return '';

    const profile = tempBirthProfile || user;
    const religion = profile?.religion || 'Hindu';
    const guruBase = getPrompt('base.GURU_BASE', 'You are Guru ji, wise astrologer.');
    const responseLength = shortResponse ?
      getPrompt('base.RESPONSE_SHORT', 'Keep response SHORT (30-50 words max). Simple language.') :
      getPrompt('base.RESPONSE_DETAILED', 'Provide detailed response.');



    const religionContext = getReligionPrompt(religion);
    const guruTone = getPrompt('base.GURU_TONE', 'Warm, caring tone.');

    const languageInstruction = getLanguageInstruction(selectedLanguage);
    const languageTemplate = replaceTemplate(
      getPrompt('template.LANGUAGEINSTRUCTION', '**IMPORTANT:** {{languageInstruction}}'),
      { languageInstruction }
    );


    const userProfile = replaceTemplate(
      getPrompt('template.USER_PROFILE', 'User: {name}, {religion}, Born: {birthDate} at {birthTime} in {birthPlace}.'),
      {
        name: profile?.given_name || profile?.full_name?.split(' ')[0] || 'Beta',
        religion: religion,
        birthDate: profile?.birth_date || 'unknown',
        birthTime: profile?.birth_time || 'unknown',
        birthPlace: profile?.birth_place || 'unknown'
      }
    );

    const profileType = tempBirthProfile ?
      '\n\nNote: Using temporary birth profile provided by user for this session.' :
      '\n\nNote: Using registered user profile.';

    return `${guruBase} ${responseLength}\n\n${religionContext}\n\n${userProfile}${profileType}\n\n${guruTone}\n\n${languageTemplate}`;
  };

  // ✅ UPDATED: Enhanced welcome message with backend-based greeting
  // ✅ UPDATED: Enhanced welcome message that WAITS for settings
  const showWelcomeAndHoroscope = async () => {
    console.log('═══════════════════════════════════════════════');
    console.log('✨ showWelcomeAndHoroscope START');
    console.log('✨ Current selectedLanguage:', selectedLanguage);
    console.log('✨ Current userSettings:', userSettings);
    console.log('✨ Current shortResponse:', shortResponse);
    console.log('═══════════════════════════════════════════════');

    // ✅ WAIT for settings to load if not already loaded
    if (!userSettings && user?.userId) {
      console.log('⏳ Settings not loaded yet, fetching now...');
      await fetchUserSettings();

      // ✅ Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('✅ Settings should be loaded now');
      console.log('✅ selectedLanguage after fetch:', selectedLanguage);
    }

    const profile = tempBirthProfile || user;
    const userName = profile?.full_name || profile?.given_name || profile?.name || 'seeker';
    const religionGreeting = getReligionGreeting(profile?.religion);
    const religionBlessing = getReligionBlessing(profile?.religion);

    // Check if free horoscope already provided
    const hasFreeHoroscope = loadFreeHoroscopeStatus();

    if (hasFreeHoroscope) {
      console.log('🔮 Free horoscope already provided to user, showing welcome only');

      // ✅ Use CURRENT selectedLanguage from state (should be from DB now)
      const currentLang = selectedLanguage || 'ENGLISH';
      console.log('🌍 Using language for welcome:', currentLang);

      const welcomeMessages = {
        'ENGLISH': `Welcome, ${userName}! 🌌 Your personalized cosmic journey begins here with Astro AI – guided by wisdom, powered by technology.`,
        'HINDI': `स्वागत है, ${userName} जी! 🌠 आपकी व्यक्तिगत ज्योतिषीय यात्रा अब Astro AI के साथ आरंभ होती है – ज्ञान और तकनीक का संगम।`,
        'HINGLISH': `Namaste ${userName} Ji! 🌟 Aapki personalized cosmic journey ab shuru hoti hai Astro AI ke saath – jahaan technology milti hai Guru ji ke gyaan se.`
      };

      const welcomeMessage = welcomeMessages[currentLang] || welcomeMessages['ENGLISH'];

      console.log('📤 Sending welcome message in', currentLang);

      push({
        message: welcomeMessage,
        direction: 'incoming',
        sender: 'assistant',
        timestamp: new Date().toISOString()
      });

      console.log('═══════════════════════════════════════════════');
      return;
    }

    // Show typing indicator for combined message
    setIsTyping(true);

    try {
      // ✅ Use settings-based language and response length
      const currentLang = selectedLanguage || 'ENGLISH';
      const currentShortResponse = shortResponse;

      console.log('🔮 Generating horoscope with settings:', {
        language: currentLang,
        shortResponse: currentShortResponse
      });

      // Prepare horoscope query
      const religion = profile?.religion || 'Hindu';
      const guruBase = getPrompt('base.GURU_BASE', 'You are Guru ji, wise astrologer.');

      // ✅ Use current settings for response length
      const responseLength = currentShortResponse
        ? getPrompt('base.RESPONSE_SHORT', 'Keep response SHORT (30-50 words max). Simple language.')
        : getPrompt('base.RESPONSE_DETAILED', 'Provide detailed response.');

      const horoscopePrompt = getPrompt('template.HOROSCOPE_PROMPT', 'Provide today\'s horoscope in 25-30 words. Keep positive, actionable.');
      const religionContext = getReligionPrompt(religion);

      // ✅ Use current language setting
      const languageInstruction = getLanguageInstruction(currentLang);

      const languageTemplate = replaceTemplate(
        getPrompt('template.LANGUAGE_INSTRUCTION', '**IMPORTANT:** {{languageInstruction}}'),
        { languageInstruction }
      );

      const userInfo = replaceTemplate(
        `User: {{name}}, {{religion}} religion. Birth: {{birthDate}}.`,
        {
          name: userName,
          religion: religion,
          birthDate: profile?.birth_date || 'unknown'
        }
      );

      const horoscopeQuery = `${guruBase}\n${responseLength}\n${userInfo}\n${horoscopePrompt}\n${religionContext}\n${languageTemplate}`;

      console.log(`🔮 Loading personalized horoscope for ${religion} devotee in ${currentLang} (FREE)`);
      console.log('📤 Horoscope query:', horoscopeQuery);

      // Get horoscope from API
      const response = await sendMessage(horoscopeQuery);
      console.log('📥 Horoscope API response:', response);

      const horoscopeReply = response?.reply || response?.data?.reply || response?.message || 'The stars are aligning favorably for you today.';
      console.log('✨ Horoscope reply extracted:', horoscopeReply);

      // ✅ Language-specific welcome with horoscope using CURRENT language
      const welcomeIntros = {
        'ENGLISH': `Welcome, ${userName}! 🌌 Your personalized cosmic journey begins here with Astro AI. Today's cosmic guidance reveals:`,
        'HINDI': `स्वागत है, ${userName} जी! 🌠 आपकी व्यक्तिगत ज्योतिषीय यात्रा अब Astro AI के साथ आरंभ होती है। आज का ज्योतिषीय मार्गदर्शन:`,
        'HINGLISH': `Namaste ${userName} Ji! 🌟 Aapki personalized cosmic journey ab shuru hoti hai Astro AI ke saath. Aaj ka cosmic guidance:`
      };

      const welcomeIntro = welcomeIntros[currentLang] || welcomeIntros['ENGLISH'];

      console.log('📤 Sending welcome with horoscope in', currentLang);

      setTimeout(() => {
        push({
          message: `${welcomeIntro}\n\n${horoscopeReply}`,
          direction: 'incoming',
          sender: 'assistant',
          timestamp: new Date().toISOString()
        });

        // Mark free horoscope as provided
        if (user?.id) {
          localStorage.setItem(`astroguru_free_horoscope_${user.id}`, JSON.stringify(true));
          console.log('✅ Free horoscope marked as provided for user');
        }

        setIsTyping(false);
      }, 1000);

    } catch (err) {
      console.error('Horoscope loading error:', err);

      // ✅ Use current language for fallback too
      const currentLang = selectedLanguage || 'ENGLISH';

      const fallbackMessages = {
        'ENGLISH': `Welcome, ${userName}! 🌌 Your personalized cosmic journey begins here with Astro AI. Today's cosmic guidance reveals:\n\nThe celestial energies are particularly favorable for you today. Your birth chart indicates strong planetary support for new beginnings and spiritual growth. 🙏`,
        'HINDI': `स्वागत है, ${userName} जी! 🌠 आपकी व्यक्तिगत ज्योतिषीय यात्रा अब Astro AI के साथ आरंभ होती है। आज का ज्योतिषीय मार्गदर्शन:\n\nआज आपके लिए खगोलीय ऊर्जा विशेष रूप से अनुकूल है। आपकी जन्म कुंडली नई शुरुआत और आध्यात्मिक विकास के लिए मजबूत ग्रह समर्थन दर्शाती है। 🙏`,
        'HINGLISH': `Namaste ${userName} Ji! 🌟 Aapki personalized cosmic journey ab shuru hoti hai Astro AI ke saath. Aaj ka cosmic guidance:\n\nAaj aapke liye celestial energies bahut favorable hain. Aapki birth chart naye beginnings aur spiritual growth ke liye strong planetary support dikhati hai. 🙏`
      };

      const fallbackMessage = fallbackMessages[currentLang] || fallbackMessages['ENGLISH'];

      setTimeout(() => {
        push({
          message: fallbackMessage,
          direction: 'incoming',
          sender: 'assistant',
          timestamp: new Date().toISOString()
        });

        if (user?.id) {
          localStorage.setItem(`astroguru_free_horoscope_${user.id}`, JSON.stringify(true));
          console.log('✅ Free horoscope marked as provided for user (fallback)');
        }

        setIsTyping(false);
      }, 1000);
    }

    console.log('═══════════════════════════════════════════════');
  };

  // Clear draft when message is successfully sent
  const clearDraft = () => {
    if (user?.id) {
      setDraftMessage('');
      localStorage.removeItem(`astroguru_draft_${user.id}`);
    }
  };

  // ✅ UPDATED: Handle send with database storage - SAVE ONLY USER MESSAGE
  // ✅ UPDATED: Handle send with credit deduction based on message type
  async function handleSend() {
    if (!inputValue.trim()) return;

    setFilteredSuggestions([]);
    setShowSuggestions(false);

    // ✅ Store the ORIGINAL user message (without prompts)
    const originalUserMessage = inputValue.trim();

    const userMessage = {
      message: originalUserMessage,
      direction: 'outgoing',
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    push(userMessage);

    const profile = tempBirthProfile || user;
    const religion = profile?.religion || 'Hindu';

    const baseContext = getUserProfileContext();
    const questionTemplate = replaceTemplate(
      getPrompt('template.QUESTION_TEMPLATE', 'Respond as Guru ji with {religion} context.'),
      { religion: religion }
    );
    //const shortLimit = shortResponse ? getPrompt('template.SHORT_LIMIT', 'Max 40-50 words.') : '';
    const responseInstruction = getResponseInstruction();

    const systemPrompt = `
  ${getPrompt('base.GURU_BASE', 'You are Guru ji, wise astrologer.')}
  ${getPrompt('base.GURU_TONE', 'Warm, caring tone.')}
  ${responseInstruction}
  ${religionInstruction}
  ${languageInstruction}
`.trim();

    // ✅ This is ONLY for AI processing - NOT for database
    const fullMessageWithProfile = `${baseContext}\n\nQuestion: "I am ${religion}. ${originalUserMessage}"\n\n${questionTemplate}${shortResponse ? ` ${shortLimit}` : ''}`;

    console.log(`🔮 Sending message with ${religion} context and ${selectedLanguage} language`);
    console.log('👤 User original message:', originalUserMessage);
    console.log('🤖 Full AI prompt:', fullMessageWithProfile);
    if (tempBirthProfile) {
      console.log('🎭 Using temporary birth profile:', tempBirthProfile.full_name);
    }

    setInputValue('');
    clearDraft();
    setIsTyping(true);

    try {
      // ═══════════════════════════════════════════════════════════════════════════
      // 💸 STEP 1: DEDUCT CREDITS BASED ON MESSAGE TYPE
      // ═══════════════════════════════════════════════════════════════════════════

      // Determine spend_type_id based on message type
      let spendTypeId;
      let creditsRequired;

      if (userSettings?.MessageType === 'SHORT_LIMIT' || shortResponse) {
        spendTypeId = 1; // Short message
        creditsRequired = 10; // Assuming 1 credit for short
      } else if (userSettings?.MessageType === 'DETAILED') {
        spendTypeId = 2; // Detailed message
        creditsRequired = 15; // Assuming 5 credits for detailed
      } else {
        spendTypeId = 3; // Medium message
        creditsRequired = 20; // Assuming 3 credits for medium
      }

      console.log('💳 Deducting credits:', {
        userId: user.userId,
        spendTypeId,
        messageType: userSettings?.MessageType || (shortResponse ? 'SHORT_LIMIT' : 'DETAILED'),
        creditsRequired
      });

      // Check if user has enough credits
      if (user.credits < creditsRequired) {
        setRequiredCredits(creditsRequired);
        setShowInsufficientModal(true);
        setIsTyping(false);
        console.log('❌ Insufficient credits - need:', creditsRequired, 'have:', user.credits);

        // Remove user message since we couldn't process it
        setMessages(prev => prev.slice(0, -1));
        setInputValue(originalUserMessage); // Restore input
        return;
      }

      // ✅ Call spendCredits API
      const spendResponse = await spendCredits(
        user.userId,
        spendTypeId,
        `Chat question: ${originalUserMessage.substring(0, 50)}...`,
        null
      );

      if (!spendResponse.data.success) {
        throw new Error('Failed to deduct credits');
      }

      console.log('✅ Credits deducted successfully:', spendResponse.data);
      console.log('💰 New balance:', spendResponse.data.balance.currentCredits);

      // ═══════════════════════════════════════════════════════════════════════════
      // 🔄 STEP 2: REFRESH USER CREDITS
      // ═══════════════════════════════════════════════════════════════════════════

      // Refresh credits in AuthContext
      if (typeof refreshCredits === 'function') {
        await refreshCredits();
        console.log('✅ Credits refreshed in AuthContext');
      } else {
        console.warn('⚠️ refreshCredits function not available in AuthContext');
      }

      // ═══════════════════════════════════════════════════════════════════════════
      // 💬 STEP 3: SEND MESSAGE AND GET AI RESPONSE
      // ═══════════════════════════════════════════════════════════════════════════

      console.log('💾 Saving message to database with AI response...');
      const { data } = await saveChatMessage(
        user.id,
        originalUserMessage,  // ✅ ORIGINAL user message for DB
        fullMessageWithProfile  // ✅ FULL prompt for AI
      );

      if (data.success) {
        push({
          message: data.reply,
          direction: 'incoming',
          sender: 'assistant',
          timestamp: new Date().toISOString()
        });
        console.log('✅ Message and response saved to database');

        // Update first question status
        setIsFirstQuestion(false);
      } else {
        throw new Error('Failed to save message');
      }

    } catch (err) {
      console.error('❌ Chat error:', err);

      const userName = profile?.given_name || profile?.name?.split(' ')[0] || 'beta';
      const religionBlessing = getReligionBlessing(profile?.religion);

      const errorTemplate = getPrompt('template.ERROR_NETWORK', 'the cosmic connection seems disturbed at this moment. May {blessing} be with you, the divine energies are temporarily realigning. Please try again in a moment, my child. **Peace be with you...** 🙏✨');
      const errorMessage = replaceTemplate(errorTemplate, { blessing: religionBlessing });

      push({
        message: `Forgive me ${userName}, ${errorMessage}`,
        direction: 'incoming',
        sender: 'assistant',
        timestamp: new Date().toISOString()
      });

      // Try to refund credits if message failed
      try {
        console.log('🔄 Attempting to refresh credits after error...');
        if (typeof refreshCredits === 'function') {
          await refreshCredits();
        }
      } catch (refreshErr) {
        console.error('❌ Failed to refresh credits:', refreshErr);
      }

    } finally {
      setIsTyping(false);
    }
  }



  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // ✅ Prevent default form submission
      setFilteredSuggestions([]); // ✅ Clear suggestions
      setShowSuggestions(false); // ✅ Hide suggestions box
      handleSend();
    }
  };


  const handleGetCredits = () => {
    console.log('📍 Going to credits page, draft preserved:', inputValue);
    navigate('/credits');
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleCloseInsufficientModal = () => {
    setShowInsufficientModal(false);
    console.log('💬 Modal closed, draft preserved:', inputValue);
  };

  // ✅ Toggle response length preference
  // ✅ NEW: Update message type setting in database
  // ✅ UPDATED: Toggle response length with better flow
  const toggleResponseLength = async () => {
    console.log('═══════════════════════════════════════════════');
    console.log('⚡ toggleResponseLength called');
    console.log('⚡ Current userSettings:', userSettings);
    console.log('⚡ Current shortResponse:', shortResponse);
    console.log('═══════════════════════════════════════════════');

    if (!userSettings?.SettingId && !user?.settings?.settingId) {
      console.error('❌ No settingId available anywhere!');
      return;
    }

    const settingIdToUse = userSettings?.SettingId || user?.settings?.settingId;
    console.log('⚡ Using settingId:', settingIdToUse);

    const newShortResponse = !shortResponse;
    const newMessageType = newShortResponse ? 'SHORT_LIMIT' : 'DETAILED';

    console.log('⚡ Toggling from', shortResponse ? 'SHORT_LIMIT' : 'DETAILED', 'to', newMessageType);

    // ✅ Optimistic UI update
    setShortResponse(newShortResponse);

    try {
      console.log('⚙️ Updating message type setting to:', newMessageType);
      console.log('⚙️ With settingId:', settingIdToUse);

      const response = await updateUserSettings(settingIdToUse, {
        MessageType: newMessageType,
        ModifiedBy: user?.full_name || 'User'
      });

      console.log('📥 Update response:', response.data);

      if (response.data.message === 'Settings updated successfully') {
        console.log('✅ Message type setting updated successfully in database');

        // ✅ Refresh settings from database
        console.log('🔄 Refreshing settings from database...');
        await fetchUserSettings();

        console.log('✅ Settings refreshed, new message type should be:', newMessageType);
        console.log('═══════════════════════════════════════════════');
      }
    } catch (error) {
      console.error('❌ Failed to update message type setting:', error);
      console.error('❌ Error details:', error.response?.data || error.message);

      // Revert to previous setting
      setShortResponse(!newShortResponse);
      await fetchUserSettings();
      console.log('═══════════════════════════════════════════════');
    }
  };




  // ✅ NEW: Handle language selection


  const handleFreeKundli = () => {
    console.log('🔮 Free Kundli clicked for:', user?.full_name);
  };

  const handleBookPooja = () => {
    console.log('📖 Book Pooja clicked for:', user?.full_name);
  };

  const handleMoonTracker = () => {
    console.log('🌙 Moon Tracker clicked for:', user?.full_name);
  };

  // ✅ Show loading if prompts are still loading
  if (promptsLoading && !prompts) {
    return (
      <div className="chatbot-container">
        <div className="loading-prompts">
          <p>Loading cosmic wisdom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      {/* Credit Warning Banner */}
      {user?.credits < 10 && (
        <div className="credit-warning" onClick={handleGetCredits}>
          <span>⚠️ Low Credits! You have only {user?.credits} credits left, {user?.given_name || 'beta'}. Click to get more! 💎</span>
        </div>
      )}



      {/* ✅ Show temporary profile indicator */}


      {/* Main Chat Area */}
      <div className="chat-area">
        <div className="chat-header">
          {/*  <span>✨ {getReligionGreeting(tempBirthProfile?.religion || user?.religion)} {tempBirthProfile?.given_name || user?.full_name || user?.name || 'seeker'}! Your personalized cosmic journey with Guru ji begins... ✨</span>*/}

          <span>{greetings[selectedLanguage]}</span>
          <div className="settings-container">
            <div className="settings-row">
              {showSettings && (
                <>
                  {/* ✅ NEW: Ask for Other Birth Details Button */}
                  <button
                    className="language-toggle"
                    onClick={openBirthDetailsPopup}
                  >
                    <span className="ask-icon">👤</span>
                    <span className="ask-text">Ask for Other</span>
                  </button>

                  {/* ✅ Language Selection Dropdown */}
                  <div className="language-dropdown-container">
                    <button
                      className={`language-toggle ${showLanguageDropdown ? 'active' : ''}`}
                      onClick={() => {
                        console.log('🌍 Language button clicked');
                        console.log('🌍 Current selectedLanguage:', selectedLanguage);
                        console.log('🌍 Current userSettings:', userSettings);
                        setShowLanguageDropdown(!showLanguageDropdown);
                      }}
                    >
                      <span className="language-icon">🌍</span>
                      <span className="language-text">
                        {(() => {
                          const lang = LANGUAGES.find(lang => lang.key === selectedLanguage);
                          console.log('🌍 Finding language display for:', selectedLanguage);
                          console.log('🌍 Found language:', lang);
                          return lang?.displayName || selectedLanguage;
                        })()}
                      </span>
                      <span className={`language-arrow ${showLanguageDropdown ? 'open' : ''}`}>▼</span>
                    </button>


                    {showLanguageDropdown && (
                      <div className="language-dropdown">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.key}
                            className={`language-option ${selectedLanguage === lang.key ? 'selected' : ''}`}
                            onClick={() => handleLanguageSelect(lang.key)}
                          >
                            <span className="language-option-text">{lang.displayName}</span>
                            {selectedLanguage === lang.key && <span className="language-selected-icon">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>


                  {/* Response Length Toggle */}
                  <button
                    className="language-toggle"
                    onClick={toggleResponseType}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      padding: 0,
                      font: 'inherit'
                    }}
                  >
                    {responseType === 'QUICK' && '⚡ Quick Response'}
                    {responseType === 'NORMAL' && '💬 Normal Response'}
                    {responseType === 'DETAILED' && '📖 Detailed Response'}
                  </button>

                  {/* Clear Chat Button */}
                  <button
                    className="clear-chat-toggle"
                    onClick={handleClearChat}
                  >
                    <span className="clear-icon">🗑️</span>
                    <span className="clear-text">Clear All</span>
                  </button>
                  {tempBirthProfile && (
                    <div className="temp-profile-indicator">
                      <span className="temp-profile-icon">🎭</span>
                      <span className="temp-profile-text">
                        Using Profile: {tempBirthProfile.full_name} ({tempBirthProfile.religion})
                      </span>
                      <button
                        className="temp-profile-clear"
                        onClick={() => {
                          setTempBirthProfile(null);
                          sessionStorage.removeItem('astroguru_temp_profile');
                          console.log('🗑️ Temporary profile cleared');
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </>

              )}
              <button
                className={`settings-toggle ${showSettings ? 'active' : ''}`}
                onClick={() => setShowSettings(!showSettings)}
              >

                <span className="settings-icon">⚙️</span>
                <span className="settings-text">Settings</span>
                <span className={`settings-arrow ${showSettings ? 'open' : ''}`}>▼</span>
              </button>



            </div>
          </div>
        </div>
        {/* ✅ Horizontal Inline Settings */}

        {/* <div className="credit-info-bar">
          {messages.length <= 2 ?
            `🔮 Preparing your ${shortResponse ? 'quick' : 'detailed'} cosmic insights with ${(tempBirthProfile?.religion || user?.religion) || 'spiritual'} context in ${getLanguageDisplayName(selectedLanguage)}, ${tempBirthProfile?.given_name || user?.given_name || 'beta'}...` :
            (isFirstQuestion ?
              '🔮 First divine consultation costs 10 credits' :
              '💬 Follow-up spiritual guidance costs 5 credits each'
            )
          }
        </div>

        Enhanced Messages Container with Markdown Support */}
        <div className="messages-container">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.direction}`}>
              <div className={`message-bubble ${msg.direction}`}>
                {/* ReactMarkdown with enhanced styling */}
                <ReactMarkdown
                  components={{
                    strong: ({ children }) => (
                      <strong className="md-strong">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="md-emphasis">{children}</em>
                    ),
                    h1: ({ children }) => (
                      <h1 className="md-h1">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="md-h2">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="md-h3">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="md-paragraph">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="md-list">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="md-list">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="md-list-item">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="md-blockquote">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="md-code">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="md-pre">
                        {children}
                      </pre>
                    )
                  }}
                >
                  {msg.message}
                </ReactMarkdown>
              </div>

              <div className={`message-timestamp ${msg.direction}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}

          {/* Enhanced Typing Indicator */}
          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-bubble">
                {getRandomGuruMessage()}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Input Area 
        <div className="input-area">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputWithSuggestions}
            onKeyPress={handleKeyPress}
            placeholder="Your stars hold the answers ✨ Ask about life, career, love, health, or destiny – and get personalized guidance now!"
            className="chat-input"
          />
          {filteredSuggestions.length > 0 && (
            <div className="suggestion-box">
              {filteredSuggestions.map((s, i) => (
                <div
                  key={i}
                  className="suggestion-item"
                  onClick={() => {
                    setInputValue(s);
                    setFilteredSuggestions([]);
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className={`send-button ${inputValue.trim() && !isTyping ? 'active' : 'inactive'}`}
          >
            {isTyping ? 'Send' : 'Send'}
          </button>
        </div>
        */}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputWithSuggestions}
          onKeyPress={handleKeyPress}
          placeholder="Your stars hold the answers ✨ Ask about life, career, love, health, or destiny – and get personalized guidance now!"
          className="chat-input"
        />
        {filteredSuggestions.length > 0 && (
          <div className="suggestion-box">
            {filteredSuggestions.map((s, i) => (
              <div
                key={i}
                className="suggestion-item"
                onClick={() => {
                  setInputValue(s);
                  setFilteredSuggestions([]);
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isTyping}
          className={`send-button ${inputValue.trim() && !isTyping ? 'active' : 'inactive'}`}
        >
          {isTyping ? 'Send' : 'Send'}
        </button>
      </div>
      {/* ✅ BIRTH DETAILS MODAL - keeping all the existing modal code exactly as is */}
      {
        showBirthDetailsPopup && (
          <div className="modal-overlay">
            <div className="birth-details-modal">
              <button className="modal-close-btn" onClick={closeBirthDetailsPopup}>×</button>

              <div className="modal-header">

                <h2 className="modal-title">
                  Ask for Someone Else
                </h2>
                <p className="modal-subtitle">
                  Create a temporary cosmic profile for someone else.
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
                        placeholder="Enter their complete name"
                        className="form-input"
                      />
                    </div>

                    {/* ✅ Religion Dropdown */}
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
                          {showCountryDropdown && (
                            <div className="country-dropdown-menu country-compact-menu">
                              {countries.map((country) => (
                                <div
                                  key={country.code}
                                  className={`country-dropdown-item ${selectedCountry.code === country.code ? 'selected' : ''}`}
                                  onClick={() => handleCountrySelect(country)}
                                >
                                  <span className="country-flag">{country.flag}</span>
                                  <span className="country-name">{country.name}</span>
                                  <span className="country-code-small">({country.code.toUpperCase()})</span>
                                  {selectedCountry.code === country.code && (
                                    <span className="country-selected-icon">✓</span>
                                  )}
                                </div>
                              ))}
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

              <div className="modal-buttons">

                <button
                  className="btn-primary"
                  onClick={handleRegistrationComplete}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span>⏳</span>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>🎭</span>
                      <span>Create Temp Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* ✅ DATE PICKER MODAL - keeping exactly as is */}
      {
        showDatePicker && (
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
        )
      }

      {/* ✅ TIME PICKER MODAL - keeping exactly as is */}
      {
        showTimePicker && (
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
        )
      }

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showInsufficientModal}
        onClose={handleCloseInsufficientModal}
        requiredCredits={requiredCredits}
        currentCredits={user?.credits || 0}
      />
    </div >
  );
}

export default ChatBot;
