// src/config/prompts.js

const PROMPTS = {
  // Version for cache control
  version: "1.0.0",
  lastUpdated: "2025-10-13T00:00:00.000Z",
  
  // Base system prompts
  base: {
    GURU_BASE: "You are Guru ji, wise astrologer.",
    QUICK: "Keep response SHORT (30-50 words max). Simple language.",
    NORMAL: "Keep response MODERATE (80-150 words). Balanced, clear explanation.",
    DETAILED: "Provide detailed response max (180-250 words). Thorough, step-by-step.",
    GURU_TONE: "Warm, caring tone."
  },
  
  // Response length settings with word limits
  responseLength: {
    QUICK: {
      label: "Quick",
      maxWords: 50,
      description: "Short, concise answers (30-50 words)"
    },
    NORMAL: {
      label: "Normal",
      maxWords: 150,
      description: "Balanced explanations (80-150 words)"
    },
    DETAILED: {
      label: "Detailed",
      maxWords: 250,
      description: "Comprehensive analysis (180-250 words)"
    }
  },

  // Question types
  questionTypes: {
    GENERAL: {
      value: "general",
      label: "General Question",
      description: "Comprehensive astrological reading"
    },
    FOLLOWUP: {
      value: "followup",
      label: "Follow-up",
      description: "Quick clarification on previous answer"
    },
    TECHNICAL: {
      value: "technical",
      label: "Technical Analysis",
      description: "Detailed planetary positions and chart analysis"
    },
    REMEDY: {
      value: "remedy",
      label: "Remedies",
      description: "Practical solutions and rituals"
    }
  },
  
  // Languages with display names and placeholders
  languages: {
    ENGLISH: {
      INSTRUCTION: "Respond in clear English only. Use simple, easy-to-understand words.",
      DISPLAY_NAME: "English",
      PLACEHOLDER: "Your stars hold the answers ✨ Ask about life, career, love, health, or destiny – and get personalized guidance now!"
    },
    HINDI: {
      INSTRUCTION: "Respond in pure Hindi only. Use Devanagari script. हिंदी में जवाब दें।",
      DISPLAY_NAME: "हिंदी (Hindi)",
      PLACEHOLDER: "स्वागत है ✨ अपना ज्योतिष से जुड़ा प्रश्न पूछिए, आइए देखें सितारे क्या संकेत दे रहे हैं।"
    },
    HINGLISH: {
      INSTRUCTION: "Respond in Hinglish (Hindi written in English). Mix Hindi words with English script.",
      DISPLAY_NAME: "Hinglish (Hindi + English)",
      PLACEHOLDER: "Swagat hai ✨ Apna astrology se related question poochhiye, chaliye dekhte hain sitare kya batate hain."
    },
    TAMIL: {
      INSTRUCTION: "தமிழில் மட்டும் பதிலளிக்கவும். தெளிவான மற்றும் எளிய சொற்களை பயன்படுத்தவும்.",
      DISPLAY_NAME: "தமிழ் (Tamil)",
      PLACEHOLDER: "வணக்கம் ✨ உங்கள் ஜோதிட கேள்வியை கேளுங்கள்"
    },
    TELUGU: {
      INSTRUCTION: "దయచేసి తెలుగులో మాత్రమే సమాధానం ఇవ్వండి. సరళమైన భాషను ఉపయోగించండి.",
      DISPLAY_NAME: "తెలుగు (Telugu)",
      PLACEHOLDER: "స్వాగతం ✨ మీ జ్యోతిష్య ప్రశ్న అడగండి"
    }
  },

  // Religion-specific contexts
  religion: {
    ISLAM: {
      CONTEXT: "User is Muslim. Use Islamic terms like 'Insha'Allah', 'Alhamdulillah'. No Hindu mantras.",
      GREETING: "Assalamu Alaikum",
      BLESSING: "Allah's blessings"
    },
    CHRISTIANITY: {
      CONTEXT: "User is Christian. Use Christian terms like 'God bless', 'By God's grace'.",
      GREETING: "May God bless you",
      BLESSING: "God's grace"
    },
    SIKHISM: {
      CONTEXT: "User is Sikh. Use 'Waheguru', 'Sat Sri Akal'.",
      GREETING: "Sat Sri Akal",
      BLESSING: "Waheguru's blessings"
    },
    BUDDHISM: {
      CONTEXT: "User is Buddhist. Use karma, dharma, mindfulness concepts.",
      GREETING: "May Buddha's wisdom guide you",
      BLESSING: "Buddha's wisdom"
    },
    JAINISM: {
      CONTEXT: "User is Jain. Use 'Jai Jinendra', ahimsa (non-violence) concepts.",
      GREETING: "Jai Jinendra",
      BLESSING: "Tirthankara's guidance"
    },
    JUDAISM: {
      CONTEXT: "User is Jewish. Use 'Shalom', 'Baruch Hashem' (Blessed is God).",
      GREETING: "Shalom",
      BLESSING: "Hashem's blessings"
    },
    ZOROASTRIANISM: {
      CONTEXT: "User is Zoroastrian. Use 'Asha Vahishta', Ahura Mazda concepts.",
      GREETING: "Asha Vahishta",
      BLESSING: "Ahura Mazda's light"
    },
    BAHAI: {
      CONTEXT: "User is Baháʼí. Use 'Allah-u-Abha', Bahá'u'lláh teachings.",
      GREETING: "Allah-u-Abha",
      BLESSING: "Bahá'u'lláh's guidance"
    },
    HINDU: {
      CONTEXT: "User is Hindu. Use traditional Vedic/Hindu terms freely.",
      GREETING: "Namaste",
      BLESSING: "Divine blessings"
    },
    OTHER: {
      CONTEXT: "User follows other spiritual path. Use universal spiritual terms.",
      GREETING: "Divine blessings",
      BLESSING: "Universal blessings"
    }
  },
  
  // Typing indicator messages
  typing: {
    ISLAM: [
      "🕌 Guru ji is seeking Allah's guidance for you... ✨",
      "📿 Guru ji is consulting the divine wisdom, Insha'Allah... 🌙",
      "⭐ Guru ji is reading your cosmic patterns with Allah's blessings... 🔥",
      "🧘 Guru ji is in spiritual meditation for your question... 🌸"
    ],
    CHRISTIANITY: [
      "⛪ Guru ji is seeking God's guidance for you... ✨",
      "📿 Guru ji is praying for divine wisdom... 🌙",
      "⭐ Guru ji is reading your celestial chart with God's grace... 🔥",
      "🧘 Guru ji is in prayer for your spiritual question... 🌸"
    ],
    SIKHISM: [
      "🏛️ Guru ji is seeking Waheguru's guidance... ✨",
      "📿 Guru ji is consulting with divine wisdom... 🌙",
      "⭐ Guru ji is analyzing your cosmic energy with Waheguru's blessings... 🔥",
      "🧘 Guru ji is in meditation with the Guru's teachings... 🌸"
    ],
    BUDDHISM: [
      "🏛️ Guru ji is seeking Buddha's wisdom for you... ✨",
      "📿 Guru ji is meditating on your karmic patterns... 🌙",
      "⭐ Guru ji is following the path of enlightenment... 🔥",
      "🧘 Guru ji is in mindful meditation for your question... 🌸"
    ],
    HINDU: [
      "🔮 Guru ji is consulting the ancient Vedic texts... ✨",
      "🌟 Guru ji is reading your celestial birth chart... 🌙",
      "⭐ Guru ji is analyzing your cosmic energy patterns... 🔥",
      "🧘 Guru ji is meditating on your divine question... 🌸"
    ]
  },
  
   greetings: {
    ENGLISH: "✨ Welcome! Your cosmic journey with Guru ji begins... ✨",
    HINDI: "✨ स्वागत है! आपकी ज्योतिषीय यात्रा गुरु जी के साथ शुरू होती है... ✨",
    HINGLISH: "✨ Namaste! Aapki cosmic journey Guru ji ke saath shuru hoti hai... ✨"
  },
  
  // Template prompts
  template: {
    HOROSCOPE_PROMPT: "Provide today's horoscope in 25-30 words. Keep positive, actionable.",
    QUESTION_TEMPLATE: "Respond as Guru ji with {religion} context.",
    USER_PROFILE: "User: {name}, {religion}, Born: {birthDate} at {birthTime} in {birthPlace}.",
    ERROR_NETWORK: "the cosmic connection seems disturbed at this moment. May {blessing} be with you, the divine energies are temporarily realigning. Please try again in a moment, my child. **Peace be with you...** 🙏✨"
  }
};

export default PROMPTS;
