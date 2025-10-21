import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { saveChatMessage, getChatHistory, deleteChatHistory, getQuickResponse, getUserSettings, updateUserSettings, spendCredits, searchPlaces, checkUserFeedback } from '../api';
import InsufficientCreditsModal from './InsufficientCreditsModal';
import ReactMarkdown from 'react-markdown';
import PROMPTS from '../config/prompts';

function ChatBot() {
  const { user, deductCredits, getReligionGreeting, getReligionBlessing, refreshCredits } = useAuth();
  const navigate = useNavigate();
  const effectRan = useRef(false);
  const searchTimeoutRef = useRef(null);
  const placeInputRef = useRef(null);
  const suggestionBoxRef = useRef(null);
  const isInitializing = useRef(false);
  const settingsRef = useRef(null);
  const responseTypeRef = useRef(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [showFeedbackNotification, setShowFeedbackNotification] = useState(false);
  const [showTypeWarning, setShowTypeWarning] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const messagesEndRef = useRef(null);
  const [lastMessageType, setLastMessageType] = useState(null);
  const analysisButtonsRef = useRef(null);
  const [hasFeedback, setHasFeedback] = useState(false);




  const [hasInitialized, setHasInitialized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [requiredCredits, setRequiredCredits] = useState(0);
  const [currentQuestionType, setCurrentQuestionType] = useState('New');
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [lastAssistantMessage, setLastAssistantMessage] = useState('');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState(null); // default to "New"
  const [showResponseTypeDropdown, setShowResponseTypeDropdown] = useState(false);





  const [selectedLanguage, setSelectedLanguage] = useState(
    user?.settings?.Language || 'ENGLISH'
  );
  const [userSettings, setUserSettings] = useState(null);

  const [responseType, setResponseType] = useState(() => {

    const savedType = user?.settings?.responseType || 'NORMAL';
    console.log('🎬 INITIAL responseType from DB:', savedType);
    return savedType || 'NORMAL';
  });

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


  // ✅ UPDATED: Get random typing message from PROMPTS
  const getRandomTypingMessage = (religion) => {
    const religionKey = religion?.toUpperCase() || 'HINDU';
    const messages = PROMPTS.typing[religionKey] || PROMPTS.typing.HINDU;

    if (Array.isArray(messages) && messages.length > 0) {
      return messages[Math.floor(Math.random() * messages.length)];
    }

    return "🔮 AastroG is consulting the cosmic energies... ✨";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLanguageSelect = async (langKey) => {
    if (!userSettings?.SettingId) return;

    setSelectedLanguage(langKey);
    setShowLanguageDropdown(false);

    try {
      await updateUserSettings(userSettings.SettingId, {
        Language: langKey,
        ModifiedBy: user?.full_name || 'User'
      });

      await fetchUserSettings();
    } catch (error) {
      console.error('❌ Failed to update language:', error);
      await fetchUserSettings();
    }
  };

  const chatContainerStyle = {
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url(/uploads/chat.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  // ✅ NEW: Cycle through response types on click
  const toggleResponseType = async () => {
    setResponseType((current) => {
      let next;
      if (current === 'QUICK') next = 'NORMAL';
      else if (current === 'NORMAL') next = 'DETAILED';
      else next = 'QUICK';

      if (userSettings?.SettingId) {
        updateUserSettings(userSettings.SettingId, {
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


  useEffect(() => {
    const checkFeedbackStatus = async () => {
      try {
        const result = await checkUserFeedback(user.userId);
        setHasFeedback(result.hasFeedback);
        console.log('📊 Feedback status loaded:', result.hasFeedback);
      } catch (error) {
        console.error('❌ Error loading feedback status:', error);
      }
    };

    if (user?.userId) {
      checkFeedbackStatus();
    }
  }, [user?.userId]);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load settings on mount
  useEffect(() => {
    if (user?.userId) {
      fetchUserSettings();
    }
  }, [user?.userId]);

  // Close settings on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Close response type dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (responseTypeRef.current && !responseTypeRef.current.contains(event.target)) {
        setShowResponseTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Initialize chat history or generate horoscope
  useEffect(() => {
    if (user?.userId && userSettings && !hasInitialized && !isInitializing.current) {
      const initialize = async () => {
        // ✅ Set flag immediately to prevent double execution
        isInitializing.current = true;

        try {
          const hasHistory = await loadChatHistory();

          if (!hasHistory) {
            await generateFreeHoroscope();
          }

          setHasInitialized(true);
        } catch (error) {
          console.error('❌ Initialization error:', error);
          isInitializing.current = false; // Reset on error
        }
      };

      initialize();
    }
  }, [user?.userId, userSettings, hasInitialized]);


  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target)) {
        setFilteredSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


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

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target)) {
        setFilteredSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target)) {
        setFilteredSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


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

  // ═══════════════════════════════════════════════════════════════════
  // SUGGESTION BOX HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  // Handle input change with suggestions
  const handleInputWithSuggestions = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Filter suggestions based on input
    if (value.trim().length >= 2) {
      const filtered = allSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 10)); // Show max 10 suggestions
    } else {
      setFilteredSuggestions([]);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setFilteredSuggestions([]);
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

  const loadChatHistory = async () => {
    if (!user?.id) return false;

    try {
      console.log('📜 Loading chat history...');
      const response = await getChatHistory(user.id);

      if (response.data.success && response.data.data) {
        const groupedMessages = response.data.data;
        const allMessages = [];
        let lastMsgType = null;

        Object.keys(groupedMessages).sort().forEach(dateKey => {
          groupedMessages[dateKey]
            .reverse() // ✅ Reverse to show oldest first (Question → Response)
            .forEach(msg => {
              allMessages.push({
                message: msg.message,
                direction: msg.direction,
                sender: msg.sender,
                timestamp: msg.timestamp,
                messageType: msg.messageType
              });
            });
        });


        if (allMessages.length > 0) {
          console.log(`✅ Loaded ${allMessages.length} messages`);
          setMessages(allMessages);

          // Extract last user and assistant messages
          const userMessages = allMessages.filter(m => m.sender === 'user');
          const assistantMessages = allMessages.filter(m => m.sender === 'assistant');

          if (userMessages.length > 0) {
            setLastUserMessage(userMessages[userMessages.length - 1].message);
          }
          if (assistantMessages.length > 0) {
            setLastAssistantMessage(assistantMessages[assistantMessages.length - 1].message);
          }

          // ✅ Set message type from last message or default to NQ
          setLastMessageType(lastMsgType || PROMPTS.messageTypes.NQ);
          console.log('✅ Set lastMessageType to:', lastMsgType || 'NQ');

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
      return false;
    }
  };

  const generateFreeHoroscope = async () => {
    console.log('🔮 Generating free horoscope...');
    setIsTyping(true);

    try {
      const birthProfile = {
        name: user?.fullname || user?.givenname || 'User',
        dob: user?.birthdate || 'unknown',
        time: user?.birthtime || 'unknown',
        timezone: user?.timezone || 'IST',
        place: user?.birthplace || 'unknown',
        latLong: user?.latitude && user?.longitude
          ? `${user.latitude}, ${user.longitude}`
          : 'unknown'
      };

      const messageSettings = {
        questionType: 'New',
        language: selectedLanguage,
        maxResponseLength: 50
      };

      // ✅ Use API function instead of direct axios call
      const response = await getQuickResponse(
        PROMPTS.template.HOROSCOPE_PROMPT,  // ✅ Use correct path
        birthProfile,
        messageSettings
      );

      if (response.success) {
        const userName = user?.full_name || user?.given_name || 'Beta';
        const welcomeMessage = (PROMPTS.welcome[selectedLanguage] || PROMPTS.welcome.ENGLISH)
          .replace('{name}', userName);
        const fullMessage = `${welcomeMessage}\n\n${response.reply}`;

        push({
          message: fullMessage,
          direction: 'incoming',
          sender: 'assistant',
          timestamp: new Date().toISOString()
        });

        // Track for analysis buttons
        setLastUserMessage('Daily Horoscope');
        setLastAssistantMessage(fullMessage);
        //setIsFirstMessage(true);
        setLastMessageType(PROMPTS.messageTypes.FH);
      }

    } catch (error) {
      console.error('❌ Error generating horoscope:', error);
      const welcomeMessage = PROMPTS.welcomeMessage[selectedLanguage] || PROMPTS.welcomeMessage.ENGLISH;
      push({
        message: welcomeMessage,
        direction: 'incoming',
        sender: 'assistant',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTyping(false);
    }
  };


  const clearDraft = () => {
    if (user?.id) {
      localStorage.removeItem(`astroguru_draft_${user.id}`);
    }
  };

  // Get credits based on response type
  const getCreditsByResponseType = (responseTypeValue) => {
    switch (responseTypeValue) {
      case 'QUICK':
        return { spendTypeId: 1, creditsRequired: 10 };
      case 'DETAILED':
        return { spendTypeId: 2, creditsRequired: 20 };
      case 'NORMAL':
      default:
        return { spendTypeId: 3, creditsRequired: 15 };
    }
  };
  // Handle analysis button clicks
  const handleAnalysisClick = async (analysisType) => {
    console.log(`🔍 Analysis button clicked: ${analysisType}`);

    // For 'New' type, clear all history and start fresh
    if (analysisType === 'New') {
      setMessages([]);
      setLastUserMessage('');
      setLastAssistantMessage('');
      setCurrentQuestionType('New');
      console.log('🗑️ Chat history cleared for New question');
      return;
    }

    // Build context message based on analysis type
    let contextMessage = lastUserMessage; // Default: use last user message

    if (analysisType === 'followup') {
      contextMessage = `Follow-up on: "${lastUserMessage}" - Previous response: "${lastAssistantMessage.substring(0, 100)}..."`;
    } else if (analysisType === 'detailed') {
      contextMessage = `Provide detailed planetary analysis for: "${lastUserMessage}"`;
    } else if (analysisType === 'remedy') {
      contextMessage = `What remedies do you recommend for: "${lastUserMessage}"?`;
    } else if (analysisType === 'technical') {
      contextMessage = `Technical chart analysis for: "${lastUserMessage}"`;
    }

    // Show the context message as user message
    const userMessage = {
      message: contextMessage,
      direction: 'outgoing',
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    push(userMessage);

    setIsTyping(true);

    try {
      // Build profile
      const profile = tempBirthProfile || user;
      const birthProfile = {
        name: profile?.fullname || profile?.full_name || profile?.givenname || 'User',
        dob: profile?.birthdate || profile?.birth_date || 'unknown',
        time: profile?.birthtime || profile?.birth_time || 'unknown',
        timezone: profile?.timezone || 'IST',
        place: profile?.birthplace || profile?.birth_place || 'unknown',
        latLong: profile?.latitude && profile?.longitude
          ? `${profile.latitude}, ${profile.longitude}`
          : 'unknown',
        religion: profile?.religion || 'Hindu'
      };

      // Get max response length from current responseType setting
      const maxResponseLength = PROMPTS.responseLength[responseType]?.maxWords || 150;

      const messageSettings = {
        questionType: analysisType, // This will be 'followup', 'detailed', 'remedy', 'technical'
        language: selectedLanguage,
        maxResponseLength: maxResponseLength
      };

      console.log('📤 Sending analysis request:', { contextMessage, analysisType, messageSettings });

      // Get credits based on current responseType (QUICK/NORMAL/DETAILED)
      const { spendTypeId, creditsRequired } = getCreditsByResponseType(responseType);

      if (user.credits < creditsRequired) {
        setRequiredCredits(creditsRequired);
        setShowInsufficientModal(true);
        setIsTyping(false);
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      // Send message
      const response = await saveChatMessage(
        user.id,
        contextMessage,
        birthProfile,
        messageSettings,
        contextMessage
      );

      if (response.success) {
        const aiMessage = {
          message: response.reply,
          direction: 'incoming',
          sender: 'assistant',
          timestamp: new Date().toISOString()
        };
        push(aiMessage);

        // Update last messages
        setLastUserMessage(contextMessage);
        setLastAssistantMessage(response.reply);

        // Deduct credits
        await spendCredits(
          user.userId,
          spendTypeId,
          `${analysisType} analysis: ${contextMessage.substring(0, 50)}`,
          null
        );

        await refreshCredits();
      }
    } catch (error) {
      console.error('❌ Analysis error:', error);
      push({
        message: 'Sorry, something went wrong. Please try again.',
        direction: 'incoming',
        sender: 'assistant',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTyping(false);
    }
  };




  // ✅ UPDATED: Clear chat from database
  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear all messages? This will permanently delete your chat history from the database.')) {
      try {
        console.log('🗑️ Deleting chat history from database...');
        const response = await deleteChatHistory(user.id);

        if (response.data.success) {
          setMessages([]);
          //setIsFirstQuestion(true);
          setTempBirthProfile(null);
          sessionStorage.removeItem('astroguru_temp_profile');
          if (user?.id) {
            localStorage.removeItem(`astroguru_first_question_${user.id}`);
          }
          setSelectedAnalysisType(PROMPTS.messageTypes.NQ); // Set to "New Question"
          setLastMessageType(null); // Clear last message type
          setLastUserMessage(''); // Clear last user message
          setLastAssistantMessage(''); // Clear last assistant message
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


  // Fetch user settings from database
  const fetchUserSettings = async () => {
    if (!user?.userId) {
      console.log('⚠️ No userId, using defaults');
      setSelectedLanguage('ENGLISH');
      setResponseType('NORMAL');
      return;
    }

    try {
      console.log('⚙️ Fetching user settings for:', user.userId);
      const response = await getUserSettings(user.userId);

      if (response.data) {
        const settings = response.data;
        console.log('✅ Settings loaded:', settings);

        setUserSettings(settings);
        setSelectedLanguage(settings.Language || 'ENGLISH');
        setResponseType(settings.MessageType || 'NORMAL');
      }
      else {
        // ✅ Handle case when no settings returned
        console.log('No settings returned, using defaults');
        setSelectedLanguage('ENGLISH');
        setResponseType('NORMAL');
      }
    } catch (error) {
      console.error('❌ Failed to fetch settings:', error);
      setSelectedLanguage('ENGLISH');
      setResponseType('NORMAL');
    }
  };

  // ✅ UPDATED: Backend-based religion-specific Guru messages
  const getRandomGuruMessage = () => {
    const religion = tempBirthProfile?.religion || user?.religion || 'Hindu';
    return getRandomTypingMessage(religion);
  };

  async function handleSend() {
    if (!inputValue.trim()) return;

    const originalUserMessage = inputValue.trim();

    // ✅ Auto-select "New" if no type selected and no previous chat
    let messageType = selectedAnalysisType;
    if (!messageType) {
      if (!lastMessageType || lastMessageType === PROMPTS.messageTypes.FH) {
        // First message or after free horoscope - auto-select "New"
        messageType = PROMPTS.messageTypes.NQ;
        setSelectedAnalysisType(messageType);
      }
      else {
        // ✅ NEW: Have previous chat but no type selected - auto-select Follow-up
        console.log('⚡ Auto-selecting Follow-up for continued conversation');
        messageType = PROMPTS.messageTypes.FLUP;
        setSelectedAnalysisType(messageType);
        if (analysisButtonsRef.current) {
          analysisButtonsRef.current.classList.add('highlight');
          setTimeout(() => {
            analysisButtonsRef.current?.classList.remove('highlight');
          }, 3000);
        }

        // Scroll to buttons
        analysisButtonsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        // Have previous chat but no type selected - show alert
        alert('⚠️ Please select a message type (Follow-up, Remedies, Technical, or New Question) before asking AastroG');
        return;
      }
    }

    // Build the message based on selected analysis type
    let finalMessage = originalUserMessage;

    // For followup, include chat history context
    if (messageType === PROMPTS.messageTypes.FLUP && lastUserMessage && lastAssistantMessage) {
      finalMessage = `Previous Question: "${lastUserMessage}"
Previous Response: "${lastAssistantMessage.substring(0, 200)}..."

Follow-up Question: ${originalUserMessage}`;
    }

    // Show user's original message in chat
    const userMessage = {
      message: originalUserMessage,
      direction: 'outgoing',
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // If it's "New", clear chat first, then add message
    if (messageType === PROMPTS.messageTypes.NQ) {
      setMessages([userMessage]);
    } else {
      push(userMessage);
    }

    // Build profile
    const profile = tempBirthProfile || user;
    const birthProfile = {
      name: profile?.fullname || profile?.full_name || profile?.givenname || 'User',
      dob: profile?.birthdate || profile?.birth_date || 'unknown',
      time: profile?.birthtime || profile?.birth_time || 'unknown',
      timezone: profile?.timezone || 'IST',
      place: profile?.birthplace || profile?.birth_place || 'unknown',
      latLong: profile?.latitude && profile?.longitude
        ? `${profile.latitude}, ${profile.longitude}`
        : 'unknown',
      religion: profile?.religion || 'Hindu'
    };

    // Build settings - technical gets 250 words
    const maxResponseLength = messageType === PROMPTS.messageTypes.TL
      ? 250
      : PROMPTS.responseLength[responseType]?.maxWords || 150;

    const messageSettings = {
      questionType: messageType,
      language: selectedLanguage,
      maxResponseLength: maxResponseLength
    };

    console.log('📤 Sending:', {
      originalUserMessage,
      finalMessage,
      messageType,
      messageSettings
    });

    setInputValue('');
    setIsTyping(true);
    setFilteredSuggestions([]);

    try {
      // Get credits based on current responseType
      const { spendTypeId, creditsRequired } = getCreditsByResponseType(responseType);

      if (user.credits < creditsRequired) {
        setRequiredCredits(creditsRequired);
        setShowInsufficientModal(true);
        setIsTyping(false);

        if (messageType === PROMPTS.messageTypes.NQ) {
          setMessages([]);
        } else {
          setMessages(prev => prev.slice(0, -1));
        }
        setInputValue(originalUserMessage);
        return;
      }

      // Send message with context
      const response = await saveChatMessage(
        user.id,
        finalMessage,
        birthProfile,
        messageSettings
      );

      if (response.success) {
        const aiMessage = {
          message: response.reply,
          direction: 'incoming',
          sender: 'assistant',
          timestamp: new Date().toISOString()
        };

        push(aiMessage);

        // Track last messages and type
        setLastUserMessage(originalUserMessage);
        setLastAssistantMessage(response.reply);
        setLastMessageType(messageType); // ✅ Track message type

        // ✅ Increment question count and check for feedback notification
        // ✅ Increment question count for ALL messages
        setQuestionCount(prev => {
          const newCount = prev + 1;
          console.log('📊 Total questions asked:', newCount);

          // Check if user has already given feedback before showing popup
          if (newCount === 3) {
            checkUserFeedback(user.userId)
              .then(result => {
                if (!result.hasFeedback) {
                  console.log('🎉 Showing feedback notification (user has not given feedback)');
                  setTimeout(() => {
                    setShowFeedbackNotification(true);
                  }, 2000);
                } else {
                  console.log('✅ User has already given feedback, skipping notification');
                }
              })
              .catch(error => {
                console.error('❌ Error checking feedback status:', error);
                // Show notification anyway if check fails (fallback)
                setTimeout(() => {
                  setShowFeedbackNotification(true);
                }, 2000);
              });
          }

          return newCount;
        });



        // Deduct credits
        await spendCredits(
          user.userId,
          spendTypeId,
          `${messageType}: ${originalUserMessage.substring(0, 50)}`,
          null
        );

        await refreshCredits();

        // ✅ Reset selection after sending
        setSelectedAnalysisType(null);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      push({
        message: 'Sorry, something went wrong. Please try again.',
        direction: 'incoming',
        sender: 'assistant',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTyping(false);
    }
  }

  const handleDirectAnalysis = async (analysisType) => {
    console.log(`🔍 Direct analysis: ${analysisType}`);

    if (!lastUserMessage || !lastAssistantMessage) {
      alert('⚠️ No previous conversation found to analyze. Please ask a question first.');
      return;
    }

    setIsTyping(true);

    try {
      const profile = tempBirthProfile || user;
      const birthProfile = {
        name: profile?.fullname || profile?.full_name || profile?.givenname || 'User',
        dob: profile?.birthdate || profile?.birth_date || 'unknown',
        time: profile?.birthtime || profile?.birth_time || 'unknown',
        timezone: profile?.timezone || 'IST',
        place: profile?.birthplace || profile?.birth_place || 'unknown',
        latLong: profile?.latitude && profile?.longitude
          ? `${profile.latitude}, ${profile.longitude}`
          : 'unknown',
        religion: profile?.religion || 'Hindu'
      };


      const contextMessage = `Previous Question: "${lastUserMessage}"
Previous Response: "${lastAssistantMessage.substring(0, 200)}..."

Please provide ${analysisType === PROMPTS.messageTypes.RM ? 'specific remedies' : 'detailed technical analysis'} for the above.`;


      const displayMessage = analysisType === PROMPTS.messageTypes.RM
        ? 'Here are the remedies'
        : 'Here is the technical analysis';


      push({
        message: analysisType === PROMPTS.messageTypes.RM
          ? 'Show me remedies'
          : 'Show me technical analysis',
        direction: 'outgoing',
        sender: 'user',
        timestamp: new Date().toISOString()
      });

      // Settings with 250 words for technical
      const messageSettings = {
        questionType: analysisType,
        language: selectedLanguage,
        maxResponseLength: analysisType === PROMPTS.messageTypes.TL ? 250 : PROMPTS.responseLength[responseType]?.maxWords || 150
      };

      // ✅ Create clean message for DB storage
      const cleanMessageForDB = analysisType === PROMPTS.messageTypes.RM
        ? 'Please provide specific remedies for the above.'
        : 'Please provide detailed technical analysis for the above.';

      // ✅ Full context message for AI
      const aiContextMessage = `Previous Question: "${lastUserMessage}" 
Previous Response: "${lastAssistantMessage.substring(0, 200)}..." 
${cleanMessageForDB}`;


      // Get credits
      const { spendTypeId, creditsRequired } = getCreditsByResponseType(responseType);

      if (user.credits < creditsRequired) {
        setRequiredCredits(creditsRequired);
        setShowInsufficientModal(true);
        setIsTyping(false);
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      // ✅ Send context message to AI, but display message will be saved
      // ✅ Store ONLY the actual user message in DB (not the full context)
      // ✅ Store ONLY the actual user message in DB (not the full context)
      // ✅ Send context message to AI, but store clean message in DB
      // ✅ Build query profile if asking for someone else
      let queryProfile = null;
      if (tempBirthProfile && tempBirthProfile.fullname !== user.fullname) {
        queryProfile = {
          name: tempBirthProfile.fullname || tempBirthProfile.name,
          dob: tempBirthProfile.birthdate,
          time: tempBirthProfile.birthtime,
          timezone: tempBirthProfile.timezone || 'IST',
          place: tempBirthProfile.birthplace,
          latLong: tempBirthProfile.latitude && tempBirthProfile.longitude
            ? `${tempBirthProfile.latitude}, ${tempBirthProfile.longitude}`
            : 'unknown'
        };
        console.log('👥 Direct analysis for:', queryProfile.name);
      }

      // ✅ Send context message to AI, but store clean message in DB
      const response = await saveChatMessage(
        user.id,
        cleanMessageForDB,
        birthProfile,
        messageSettings,
        aiContextMessage,
        queryProfile  // ✅ NEW: Pass query profile
      );

      if (response.success) {
        push({
          message: response.reply,
          direction: 'incoming',
          sender: 'assistant',
          timestamp: new Date().toISOString()
        });

        // Track last messages
        setLastUserMessage(displayMessage); // ✅ Store clean message
        setLastAssistantMessage(response.reply);
        setLastMessageType(analysisType);

        // ✅ Increment question count for ALL messages
        setQuestionCount(prev => {
          const newCount = prev + 1;
          console.log('📊 Total questions asked:', newCount);

          // Check if user has already given feedback before showing popup
          if (newCount === 3) {
            checkUserFeedback(user.userId)
              .then(result => {
                if (!result.hasFeedback) {
                  console.log('🎉 Showing feedback notification (user has not given feedback)');
                  setTimeout(() => {
                    setShowFeedbackNotification(true);
                  }, 2000);
                } else {
                  console.log('✅ User has already given feedback, skipping notification');
                }
              })
              .catch(error => {
                console.error('❌ Error checking feedback status:', error);
                // Show notification anyway if check fails (fallback)
                setTimeout(() => {
                  setShowFeedbackNotification(true);
                }, 2000);
              });
          }

          return newCount;
        });



        // Deduct credits
        await spendCredits(
          user.userId,
          spendTypeId,
          `${analysisType}: ${displayMessage}`,
          null
        );

        await refreshCredits();
      }
    } catch (error) {
      console.error('❌ Direct analysis error:', error);
      push({
        message: 'Sorry, something went wrong. Please try again.',
        direction: 'incoming',
        sender: 'assistant',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTyping(false);
    }
  };




  const handleGetCredits = () => {
    console.log('📍 Going to credits page, draft preserved:', inputValue);
    navigate('/credits');
  };

  const handleCloseInsufficientModal = () => {
    setShowInsufficientModal(false);
    console.log('💬 Modal closed, draft preserved:', inputValue);
  };

  // ✅ Show loading if prompts are still loading

  return (
    <div className="chatbot-container" style={chatContainerStyle} >
      {/* Credit Warning Banner */}
      {user?.credits < 10 && (
        <div className="credit-warning" onClick={handleGetCredits}>
          <span>⚠️ Low Credits! You have only {user?.credits} credits left, {user?.given_name || 'beta'}. Click to get more! 💎</span>
        </div>
      )}



      {/* ✅ Show temporary profile indicator */}


      {/* Main Chat Area */}
      <div className="chat-area" >
        <div className="chat-header">
          <span>{PROMPTS.greetings[selectedLanguage] || PROMPTS.greetings.ENGLISH}</span>

          <div className="settings-container">
            <div className="settings-row" ref={settingsRef}>
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
                  <div className="language-dropdown-container" ref={responseTypeRef}>
                    <button
                      className={`language-toggle ${showResponseTypeDropdown ? 'active' : ''}`}
                      onClick={() => setShowResponseTypeDropdown(!showResponseTypeDropdown)}
                    >
                      <span className="language-icon">
                        {/* ✅ Add fallback for icon display */}
                        {(responseType || 'NORMAL') === 'QUICK' ? '⚡' :
                          (responseType || 'NORMAL') === 'NORMAL' ? '📝' :
                            (responseType || 'NORMAL') === 'DETAILED' ? '📚' : '📝'}
                      </span>
                      <span className="language-text">
                        {/* ✅ Add fallback for text display */}
                        {(responseType || 'NORMAL') === 'QUICK' ? 'Quick' :
                          (responseType || 'NORMAL') === 'NORMAL' ? 'Normal' :
                            (responseType || 'NORMAL') === 'DETAILED' ? 'Detailed' : 'Normal'}
                      </span>
                      <span className={`language-arrow ${showResponseTypeDropdown ? 'open' : ''}`}>▼</span>
                    </button>

                    {showResponseTypeDropdown && (
                      <div className="language-dropdown">
                        <button
                          className={`language-option ${responseType === 'QUICK' ? 'selected' : ''}`}
                          onClick={() => {
                            setResponseType('QUICK');
                            setShowResponseTypeDropdown(false);
                          }}
                        >
                          <span className="language-option-text">⚡ Quick Response</span>
                          {responseType === 'QUICK' && <span className="language-selected-icon">✓</span>}
                        </button>
                        <button
                          className={`language-option ${responseType === 'NORMAL' ? 'selected' : ''}`}
                          onClick={() => {
                            setResponseType('NORMAL');
                            setShowResponseTypeDropdown(false);
                          }}
                        >
                          <span className="language-option-text">💬 Normal Response</span>
                          {responseType === 'NORMAL' && <span className="language-selected-icon">✓</span>}
                        </button>
                        <button
                          className={`language-option ${responseType === 'DETAILED' ? 'selected' : ''}`}
                          onClick={() => {
                            setResponseType('DETAILED');
                            setShowResponseTypeDropdown(false);
                          }}
                        >
                          <span className="language-option-text">📖 Detailed Response</span>
                          {responseType === 'DETAILED' && <span className="language-selected-icon">✓</span>}
                        </button>
                      </div>
                    )}
                  </div>


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
          <div ref={messagesEndRef} />
          {/* Enhanced Typing Indicator */}


          {messages.length > 0 && messages[messages.length - 1].sender === 'assistant' && lastMessageType !== PROMPTS.messageTypes.FH && (
            <div className="message-bubble incoming" ref={analysisButtonsRef}>
              <div className="analysis-header">
                <span className="analysis-icon">💡</span>
                <span className="analysis-title">Choose an option to continue:</span>
              </div>

              <div className="analysis-buttons-grid">
                {(() => {
                  // Get button labels based on current language
                  const labels = PROMPTS.buttonLabels[selectedLanguage] || PROMPTS.buttonLabels.ENGLISH;

                  // ✅ If a button is selected, show only that button
                  if (selectedAnalysisType) {
                    return (

                      <div className="selected-button-wrapper">
                        <button
                          className={`analysis-btn ${selectedAnalysisType === PROMPTS.messageTypes.FLUP ? 'followup-btn' :
                            selectedAnalysisType === PROMPTS.messageTypes.RM ? 'remedy-btn' :
                              selectedAnalysisType === PROMPTS.messageTypes.TL ? 'technical-btn' :
                                'new-btn'
                            } selected`}
                          onClick={() => setSelectedAnalysisType(null)}
                          title="Click to unselect and see all options"
                        >
                          <span className="button-label">
                            {selectedAnalysisType === PROMPTS.messageTypes.FLUP && labels.FOLLOWUP}
                            {selectedAnalysisType === PROMPTS.messageTypes.RM && labels.REMEDIES}
                            {selectedAnalysisType === PROMPTS.messageTypes.TL && labels.TECHNICAL}
                            {selectedAnalysisType === PROMPTS.messageTypes.NQ && labels.NEW}
                          </span>
                          <span className="unselect-icon">✕</span>
                        </button>
                      </div>
                    );
                  }

                  // ✅ Show all buttons when none selected
                  return (
                    <>
                      <button
                        className="analysis-btn followup-btn"
                        onClick={() => setSelectedAnalysisType(PROMPTS.messageTypes.FLUP)}
                      >
                        {labels.FOLLOWUP}
                      </button>
                      <button
                        className="analysis-btn remedy-btn"
                        onClick={() => handleDirectAnalysis(PROMPTS.messageTypes.RM)}
                      >
                        {labels.REMEDIES}
                      </button>
                      <button
                        className="analysis-btn technical-btn"
                        onClick={() => handleDirectAnalysis(PROMPTS.messageTypes.TL)}
                      >
                        {labels.TECHNICAL}
                      </button>
                      <button
                        className="analysis-btn new-btn new-question-full"
                        onClick={() => setSelectedAnalysisType(PROMPTS.messageTypes.NQ)}
                      >
                        {labels.NEW}
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          )}



          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-bubble">
                {getRandomGuruMessage()}
              </div>
            </div>
          )}

        </div>

        {/* Analysis Buttons - Show after last assistant message */}
        {/* Analysis Buttons - Show after last assistant message */}
        {/* Analysis Buttons - Smart Display Logic 
{messages.length > 0 && messages[messages.length - 1].sender === 'assistant' && (
  <div className="analysis-buttons-container">
    {(() => {
      // ✅ Hide buttons after Free Horoscope
      if (lastMessageType === PROMPTS.messageTypes.FH) {
        return null;
      }

      // ✅ If a button is selected, show only that button
      if (selectedAnalysisType) {
        return (
          <button
            className={`analysis-btn ${
              selectedAnalysisType === PROMPTS.messageTypes.FLUP ? 'followup-btn' :
              selectedAnalysisType === PROMPTS.messageTypes.RM ? 'remedy-btn' :
              selectedAnalysisType === PROMPTS.messageTypes.TL ? 'technical-btn' :
              'new-btn'
            } selected`}
            onClick={() => setSelectedAnalysisType(null)}
            title="Click to unselect and see all options"
          >
            {selectedAnalysisType === PROMPTS.messageTypes.FLUP && 'Follow-up'}
            {selectedAnalysisType === PROMPTS.messageTypes.NQ && 'New Question'}
            <span style={{ marginLeft: '10px', fontSize: '12px' }}>✕</span>
          </button>
        );
      }

      // ✅ Show all buttons when none selected
      return (
        <>
          <button
            className="analysis-btn followup-btn"
            onClick={() => setSelectedAnalysisType(PROMPTS.messageTypes.FLUP)}
            title="Ask follow-up question with context"
          >
          Follow-up
          </button>
          <button
            className="analysis-btn remedy-btn"
            onClick={() => handleDirectAnalysis(PROMPTS.messageTypes.RM)}
            title="Get remedies immediately for previous question"
          >
          Remedies
          </button>
          <button
            className="analysis-btn technical-btn"
            onClick={() => handleDirectAnalysis(PROMPTS.messageTypes.TL)}
            title="Get technical analysis immediately (detailed)"
          >
          Technical
          </button>
          <button
            className="analysis-btn new-btn"
            onClick={() => setSelectedAnalysisType(PROMPTS.messageTypes.NQ)}
            title="Start new question (clears history)"
          >
          New
          </button>
        </>
      );
    })()}
  </div>
)}
*/}



      </div>
      {/* Message Type Warning Notification */}

      <div className="input-area">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputWithSuggestions}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !filteredSuggestions.length) {
              handleSend();
            }
          }}
          onFocus={() => {
            // Show suggestions on focus if there's input
            if (inputValue.trim().length >= 2) {
              const filtered = allSuggestions.filter(suggestion =>
                suggestion.toLowerCase().includes(inputValue.toLowerCase())
              );
              setFilteredSuggestions(filtered.slice(0, 10));
            }
          }}
          placeholder={PROMPTS.languages[selectedLanguage]?.PLACEHOLDER}
          className="chat-input"
          autoComplete="off"
        />
        {filteredSuggestions.length > 0 && (
          <div className="suggestion-box">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseDown={(e) => e.preventDefault()} // Prevent input blur
              >
                <span className="suggestion-icon">💡</span>
                <span className="suggestion-text">{suggestion}</span>
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
      {/* Feedback Notification - Appears after 3 questions */}
      {showFeedbackNotification && (
        <div className="feedback-notification-overlay">
          <div className="feedback-notification">
            <button
              className="feedback-close-btn"
              onClick={() => setShowFeedbackNotification(false)}
              aria-label="Close feedback notification"
            >
              ✕
            </button>

            <div className="feedback-icon">✨</div>

            <h3 className="feedback-title">Enjoying Your Cosmic Journey?</h3>

            <p className="feedback-description">
              Your insights help us guide you better. Share your experience!
            </p>

            <div className="feedback-actions">
              <button
                className="feedback-btn feedback-btn-primary"
                onClick={() => {
                  setShowFeedbackNotification(false);
                  navigate('/feedback');
                }}
              >
                Give Feedback
              </button>
              <button
                className="feedback-btn feedback-btn-secondary"
                onClick={() => setShowFeedbackNotification(false)}
              >
                Maybe Later
              </button>
            </div>

            <div className="feedback-footer">
              Takes less than a minute ⏱️
            </div>
          </div>
        </div>
      )}


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
