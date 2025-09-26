/*/ ✅ Centralized prompt configuration
export const PROMPTS = {
  // Base configurations
  GURU_BASE: "You are Guru ji, wise astrologer.",
  RESPONSE_SHORT: "Keep response SHORT (30-50 words max). Simple language.",
  RESPONSE_DETAILED: "Provide detailed response.",
  GURU_TONE: "Warm, caring tone.",
  
  // Religion-specific contexts
  RELIGION: {
    ISLAM: "User is Muslim. Use Islamic terms like 'Insha'Allah', 'Alhamdulillah'. No Hindu mantras.",
    CHRISTIANITY: "User is Christian. Use Christian terms like 'God bless', 'By God's grace'.",
    SIKHISM: "User is Sikh. Use 'Waheguru', 'Sat Sri Akal'.",
    BUDDHISM: "User is Buddhist. Use karma, dharma, mindfulness concepts.",
    JAINISM: "User is Jain. Use 'Jai Jinendra', ahimsa (non-violence) concepts.",
    JUDAISM: "User is Jewish. Use 'Shalom', 'Baruch Hashem' (Blessed is God).",
    ZOROASTRIANISM: "User is Zoroastrian. Use 'Asha Vahishta', Ahura Mazda concepts.",
    BAHAI: "User is Baháʼí. Use 'Allah-u-Abha', Bahá'u'lláh teachings.",
    HINDU: "User is Hindu. Use traditional Vedic/Hindu terms freely.",
    OTHER: "User follows other spiritual path. Use universal spiritual terms."
  },
  
  // ✅ FIXED: Typing indicator messages as arrays
  TYPING: {
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
  
  // Templates
  HOROSCOPE_PROMPT: "Provide today's horoscope in 25-30 words. Keep positive, actionable.",
  QUESTION_TEMPLATE: "Respond as Guru ji with {religion} context.",
  SHORT_LIMIT: "Max 40-50 words.",
  USER_PROFILE: "User: {name}, {religion}, Born: {birthDate} at {birthTime} in {birthPlace}.",
  ERROR_NETWORK: "the cosmic connection seems disturbed at this moment. May {blessing} be with you, the divine energies are temporarily realigning. Please try again in a moment, my child. **Peace be with you...** 🙏✨"
};

// ✅ Utility functions
export const getPrompt = (path, fallback = '') => {
  const keys = path.split('.');
  let result = PROMPTS;
  
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) return fallback;
  }
  
  return result || fallback;
};

export const getReligionPrompt = (religion, type = 'RELIGION') => {
  const religionKey = religion?.toUpperCase() || 'HINDU';
  return getPrompt(`${type}.${religionKey}`, getPrompt(`${type}.HINDU`));
};

export const replaceTemplate = (template, replacements) => {
  let result = template;
  Object.keys(replacements).forEach(key => {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacements[key] || '');
  });
  return result;
};

export const getRandomTypingMessage = (religion) => {
  const messages = getReligionPrompt(religion, 'TYPING');
  if (Array.isArray(messages) && messages.length > 0) {
    return messages[Math.floor(Math.random() * messages.length)];
  }
  return "🔮 Guru ji is consulting the cosmic energies... ✨";
};
*/