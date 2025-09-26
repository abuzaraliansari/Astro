import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { sendMessage, getAllPrompts } from '../api';
import InsufficientCreditsModal from './InsufficientCreditsModal';
import ReactMarkdown from 'react-markdown';

function ChatBot() {
  const { user, deductCredits, getReligionGreeting, getReligionBlessing } = useAuth();
  const navigate = useNavigate();
  
  const effectRan = useRef(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [prompts, setPrompts] = useState(null);
  const [promptsLoading, setPromptsLoading] = useState(true);
  
  // Enhanced state management with response length preference
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isFirstQuestion, setIsFirstQuestion] = useState(true);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [requiredCredits, setRequiredCredits] = useState(0);
  const [draftMessage, setDraftMessage] = useState('');
  const [shortResponse, setShortResponse] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

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
        console.log('📚 Prompts keys:', Object.keys(response.data.data || {}).join(', '));
      } else {
        console.error('❌ Failed to load prompts:', response.data.error);
      }
    } catch (error) {
      console.error('❌ Error loading prompts from backend API:', error);
    } finally {
      setPromptsLoading(false);
    }
  };

  // ✅ Helper functions for prompt access
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

  // ✅ Initialize prompts on component mount
  useEffect(() => {
    loadPrompts();
  }, []);

  // Load chat history from localStorage
  const loadChatHistory = () => {
    if (!user?.id) return [];
    
    const savedMessages = localStorage.getItem(`astroguru_chat_${user.id}`);
    if (savedMessages) {
      try {
        return JSON.parse(savedMessages);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
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

  // Initialize messages and preferences when user is available
  useEffect(() => {
    if (user?.id && !hasInitialized && prompts) {
      const savedMessages = loadChatHistory();
      const savedFirstQuestion = loadFirstQuestionStatus();
      const savedDraft = loadDraftMessage();
      const savedResponsePreference = loadResponsePreference();
      
      setMessages(savedMessages);
      setIsFirstQuestion(savedFirstQuestion);
      setDraftMessage(savedDraft);
      setInputValue(savedDraft);
      setShortResponse(savedResponsePreference);
      setHasInitialized(true);
      
      console.log('📚 Loaded chat data with Backend Prompts:', { 
        messagesCount: savedMessages.length, 
        isFirstQuestion: savedFirstQuestion,
        hasDraft: !!savedDraft,
        shortResponse: savedResponsePreference,
        religion: user.religion,
        promptsVersion: prompts?.version
      });
    }
  }, [user?.id, hasInitialized, prompts]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (user?.id && messages.length > 0) {
      localStorage.setItem(`astroguru_chat_${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user?.id]);

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

  // ✅ Clear chat now keeps prompt configuration
  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setMessages([]);
      setIsFirstQuestion(true);
      if (user?.id) {
        localStorage.removeItem(`astroguru_chat_${user.id}`);
        localStorage.removeItem(`astroguru_first_question_${user.id}`);
      }
      setShowSettings(false);
      console.log('🗑️ Chat cleared for user:', user?.full_name);
    }
  };

  const push = msg => setMessages(prev => [...prev, msg]);

  // ✅ UPDATED: Backend-based religion-specific Guru messages
  const getRandomGuruMessage = () => {
    const religion = user?.religion || 'Hindu';
    return getRandomTypingMessage(religion);
  };

  // ✅ UPDATED: Backend-based user profile context
  const getUserProfileContext = () => {
    if (!user || !prompts) return '';

    const religion = user.religion || 'Hindu';
    const guruBase = getPrompt('base.GURU_BASE', 'You are Guru ji, wise astrologer.');
    const responseLength = shortResponse ? 
      getPrompt('base.RESPONSE_SHORT', 'Keep response SHORT (30-50 words max). Simple language.') :
      getPrompt('base.RESPONSE_DETAILED', 'Provide detailed response.');
    
    const religionContext = getReligionPrompt(religion);
    const guruTone = getPrompt('base.GURU_TONE', 'Warm, caring tone.');
    
    const userProfile = replaceTemplate(
      getPrompt('template.USER_PROFILE', 'User: {name}, {religion}, Born: {birthDate} at {birthTime} in {birthPlace}.'),
      {
        name: user.given_name || 'Beta',
        religion: religion,
        birthDate: user.birth_date || 'unknown',
        birthTime: user.birth_time || 'unknown',
        birthPlace: user.birth_place || 'unknown'
      }
    );

    return `${guruBase} ${responseLength}\n\n${religionContext}\n\n${userProfile}\n\n${guruTone}`;
  };

  // ✅ UPDATED: Enhanced welcome message with backend-based greeting
  const showWelcomeAndHoroscope = async () => {
    console.log('🌟 Adding personalized welcome message with Backend Prompts (FREE)');
    
    const userName = user?.full_name || user?.given_name || user?.name || 'seeker';
    const religionGreeting = getReligionGreeting(user?.religion);
    const religionBlessing = getReligionBlessing(user?.religion);
    
    const religionText = user?.religion ? 
      ` ${religionGreeting}! May ${religionBlessing} guide you on your spiritual journey.` : 
      ' Namaste! May divine blessings guide you.';
    
    push({
      message: `**${religionGreeting} ${userName}! ✨ Welcome to your cosmic sanctuary.**${religionText} The stars have been eagerly waiting for your arrival, my child...`,
      direction: 'incoming',
      sender: 'assistant',
      timestamp: new Date().toISOString()
    });

    // ✅ Check if free horoscope already given
    const hasFreeHoroscope = loadFreeHoroscopeStatus();
    
    if (!hasFreeHoroscope) {
      setTimeout(() => {
        loadTodaysHoroscope();
      }, 1500);
    } else {
      console.log('🔮 Free horoscope already provided to user, skipping...');
    }
  };

  // ✅ UPDATED: Backend-based horoscope loading
  const loadTodaysHoroscope = async () => {
    console.log('🔮 Loading personalized horoscope with Backend Prompts (FREE - ONE TIME ONLY)');
    
    const userName = user?.given_name || user?.name?.split(' ')[0] || 'beta';

    setIsTyping(true);

    // ✅ Build horoscope query from backend prompts
    const religion = user?.religion || 'Hindu';
    const guruBase = getPrompt('base.GURU_BASE', 'You are Guru ji, wise astrologer.');
    const horoscopePrompt = getPrompt('template.HOROSCOPE_PROMPT', 'Provide today\'s horoscope in 25-30 words. Keep positive, actionable.');
    const religionContext = getReligionPrompt(religion);
    
    const userInfo = replaceTemplate(
      'User: {name}, {religion} religion. Birth: {birthDate}.',
      {
        name: userName,
        religion: religion,
        birthDate: user.birth_date || 'unknown'
      }
    );
    
    const horoscopeQuery = `${guruBase} ${userInfo}\n\n${horoscopePrompt} Use ${religion} spiritual terms.`;
    
    console.log(`🔮 Auto-loading personalized horoscope for ${religion} devotee (FREE - ONE TIME)`);

    try {
      const { data } = await sendMessage(horoscopeQuery);
      
      setTimeout(() => {
        push({
          message: `**Today's personalized horoscope reveals:** ${data.reply}`,
          direction: 'incoming',
          sender: 'assistant',
          timestamp: new Date().toISOString()
        });

        // ✅ Mark free horoscope as provided
        if (user?.id) {
          localStorage.setItem(`astroguru_free_horoscope_${user.id}`, JSON.stringify(true));
          console.log('✅ Free horoscope marked as provided for user');
        }
      }, 1000);
      
    } catch (err) {
      const religionBlessing = getReligionBlessing(user?.religion);
      
      setTimeout(() => {
        push({
          message: `**Today's cosmic guidance for ${userName}:** The celestial energies are particularly favorable for you today, my child. Your birth chart indicates strong planetary support for new beginnings and spiritual growth. May ${religionBlessing} be with you! 🌟✨`,
          direction: 'incoming',
          sender: 'assistant',
          timestamp: new Date().toISOString()
        });

        // ✅ Mark free horoscope as provided even on error
        if (user?.id) {
          localStorage.setItem(`astroguru_free_horoscope_${user.id}`, JSON.stringify(true));
          console.log('✅ Free horoscope marked as provided for user (fallback)');
        }
      }, 1000);
      console.error('Horoscope loading error:', err);
    } finally {
      setTimeout(() => {
        setIsTyping(false);
      }, 800);
    }
  };

  // Clear draft when message is successfully sent
  const clearDraft = () => {
    if (user?.id) {
      setDraftMessage('');
      localStorage.removeItem(`astroguru_draft_${user.id}`);
    }
  };

  // ✅ UPDATED: Backend-based message handling
  async function handleSend() {
    if (!inputValue.trim()) return;

    const creditsNeeded = isFirstQuestion ? 10 : 5;
    
    if (user.credits < creditsNeeded) {
      setRequiredCredits(creditsNeeded);
      setShowInsufficientModal(true);
      console.log('💰 Insufficient credits - keeping draft:', inputValue);
      return;
    }

    const userMessage = {
      message: inputValue,
      direction: 'outgoing',
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    push(userMessage);

    const religion = user?.religion || 'Hindu';
    
    // ✅ Build message from backend templates
    const baseContext = getUserProfileContext();
    const questionTemplate = replaceTemplate(
      getPrompt('template.QUESTION_TEMPLATE', 'Respond as Guru ji with {religion} context.'),
      { religion: religion }
    );
    const shortLimit = shortResponse ? getPrompt('template.SHORT_LIMIT', 'Max 40-50 words.') : '';
    
    const fullMessageWithProfile = `${baseContext}\n\nQuestion: "I am ${religion}. ${inputValue}"\n\n${questionTemplate}${shortResponse ? ` ${shortLimit}` : ''}`;
    
    console.log(`🔮 Sending Backend-based message with ${religion} context to reduce tokens`);
    console.log('👤 User question with religion prefix:', inputValue);

    setInputValue('');
    clearDraft();
    setIsTyping(true);

    deductCredits(creditsNeeded);
    setIsFirstQuestion(false);

    try {
      const { data } = await sendMessage(fullMessageWithProfile);
      push({ 
        message: data.reply, 
        direction: 'incoming', 
        sender: 'assistant',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      const userName = user?.given_name || user?.name?.split(' ')[0] || 'beta';
      const religionBlessing = getReligionBlessing(user?.religion);
      
      // ✅ Use backend-based error message
      const errorTemplate = getPrompt('template.ERROR_NETWORK', 'the cosmic connection seems disturbed at this moment. May {blessing} be with you, the divine energies are temporarily realigning. Please try again in a moment, my child. **Peace be with you...** 🙏✨');
      const errorMessage = replaceTemplate(errorTemplate, { blessing: religionBlessing });
      
      push({
        message: `Forgive me ${userName}, ${errorMessage}`,
        direction: 'incoming',
        sender: 'assistant',
        timestamp: new Date().toISOString()
      });
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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
  const toggleResponseLength = () => {
    setShortResponse(!shortResponse);
    console.log('📝 Response length changed to:', !shortResponse ? 'SHORT' : 'DETAILED');
  };

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
          <div className="loading-spinner">🔮</div>
          <p>Loading cosmic wisdom from the backend...</p>
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

      {/* ✅ Show prompt version in dev mode 
      {process.env.NODE_ENV === 'development' && prompts && (
        <div className="dev-info">
          <small>Prompts v{prompts.version} | Backend API Active</small>
        </div>
      )}*/}

      {/* ✅ Horizontal Inline Settings */}
      <div className="settings-container">
        <div className="settings-row">
          <button 
            className={`settings-toggle ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
          >
            <span className="settings-icon">⚙️</span>
            <span className="settings-text">Settings</span>
            <span className={`settings-arrow ${showSettings ? 'open' : ''}`}>▼</span>
          </button>

          {showSettings && (
            <>
              {/* Response Length Toggle */}
              <button 
                className={`preference-toggle ${shortResponse ? 'active' : ''}`}
                onClick={toggleResponseLength}
              >
                <span className="toggle-icon">{shortResponse ? '⚡' : '📖'}</span>
                <span className="toggle-text">
                  {shortResponse ? 'Quick' : 'Detailed'}
                </span>
              </button>

              {/* Clear Chat Button */}
              <button 
                className="clear-chat-toggle"
                onClick={handleClearChat}
              >
                <span className="clear-icon">🗑️</span>
                <span className="clear-text">Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-area">
        <div className="chat-header">
          <span>✨ {getReligionGreeting(user?.religion)} {user?.full_name || user?.name || 'seeker'}! Your personalized cosmic journey with Guru ji begins... ✨</span>
        </div>

        <div className="credit-info-bar">
          {messages.length <= 2 ? 
            `🔮 Preparing your ${shortResponse ? 'quick' : 'detailed'} cosmic insights with ${user?.religion || 'spiritual'} context, ${user?.given_name || 'beta'}...` :
            (isFirstQuestion ? 
              '🔮 First divine consultation costs 10 credits' : 
              '💬 Follow-up spiritual guidance costs 5 credits each'
            )
          }
        </div>

        {/* Enhanced Messages Container with Markdown Support */}
        <div className="messages-container">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.direction}`}>
              <div className={`message-bubble ${msg.direction}`}>
                {/* ReactMarkdown with enhanced styling */}
                <ReactMarkdown
                  components={{
                    strong: ({children}) => (
                      <strong className="md-strong">{children}</strong>
                    ),
                    em: ({children}) => (
                      <em className="md-emphasis">{children}</em>
                    ),
                    h1: ({children}) => (
                      <h1 className="md-h1">{children}</h1>
                    ),
                    h2: ({children}) => (
                      <h2 className="md-h2">{children}</h2>
                    ),
                    h3: ({children}) => (
                      <h3 className="md-h3">{children}</h3>
                    ),
                    p: ({children}) => (
                      <p className="md-paragraph">{children}</p>
                    ),
                    ul: ({children}) => (
                      <ul className="md-list">{children}</ul>
                    ),
                    ol: ({children}) => (
                      <ol className="md-list">{children}</ol>
                    ),
                    li: ({children}) => (
                      <li className="md-list-item">{children}</li>
                    ),
                    blockquote: ({children}) => (
                      <blockquote className="md-blockquote">
                        {children}
                      </blockquote>
                    ),
                    code: ({children}) => (
                      <code className="md-code">
                        {children}
                      </code>
                    ),
                    pre: ({children}) => (
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
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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

        {/* Enhanced Input Area */}
        <div className="input-area">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={
              draftMessage 
                ? `Continue your spiritual question, ${user?.given_name || 'beta'}...` 
                : `Ask Guru ji your cosmic question (${user?.religion || 'spiritual'} context will be applied), ${user?.given_name || 'seeker'}...`
            }
            className="chat-input"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className={`send-button ${inputValue.trim() && !isTyping ? 'active' : 'inactive'}`}
          >
            {isTyping ? 'Send' : 'Send'}
          </button>
        </div>
      </div>

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showInsufficientModal}
        onClose={handleCloseInsufficientModal}
        requiredCredits={requiredCredits}
        currentCredits={user?.credits || 0}
      />
    </div>
  );
}

export default ChatBot;
