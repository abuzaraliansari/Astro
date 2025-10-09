import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MoonTracker() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentMoonPhase, setCurrentMoonPhase] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [moonData, setMoonData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedView, setSelectedView] = useState('today');
    const [apiData, setApiData] = useState(null);
    const [weeklyMoonData, setWeeklyMoonData] = useState([]);
    const [loadingWeekly, setLoadingWeekly] = useState(false);

    // Moon phase data and calculations
    const moonPhases = [
        { name: 'New Moon', emoji: '🌑', percent: 0, description: 'New beginnings, fresh starts, intention setting' },
        { name: 'Waxing Crescent', emoji: '🌒', percent: 25, description: 'Growth, momentum building, taking action' },
        { name: 'First Quarter', emoji: '🌓', percent: 50, description: 'Challenges, decisions, commitment to goals' },
        { name: 'Waxing Gibbous', emoji: '🌔', percent: 75, description: 'Refinement, adjustment, patience' },
        { name: 'Full Moon', emoji: '🌕', percent: 100, description: 'Culmination, manifestation, heightened energy' },
        { name: 'Waning Gibbous', emoji: '🌖', percent: 75, description: 'Gratitude, sharing wisdom, teaching' },
        { name: 'Last Quarter', emoji: '🌗', percent: 50, description: 'Release, forgiveness, letting go' },
        { name: 'Waning Crescent', emoji: '🌘', percent: 25, description: 'Rest, reflection, spiritual connection' }
    ];

    // ✅ FIXED: Handle negative illumination values
    const fetchMoonDataFromAPI = async (date) => {
        try {
            const API_KEY = '13dde5de84434924991e0baae2d335ef';
            const dateStr = date.toISOString().split('T')[0];

            console.log('🌙 Fetching moon data for date:', dateStr);

            const response = await axios.get(
                `https://api.ipgeolocation.io/astronomy?apiKey=${API_KEY}&date=${dateStr}`
            );

            console.log('✅ Moon API Response:', response.data);

            if (response.data && response.data.moon_illumination_percentage) {
                // ✅ Use absolute value for illumination
                const rawIllumination = parseFloat(response.data.moon_illumination_percentage);
                const illuminationPercent = Math.abs(rawIllumination);

                const moonInfo = {
                    Illumination: illuminationPercent / 100,
                    Phase: calculatePhaseFromIllumination(illuminationPercent),
                    Distance: response.data.moon_distance || null,
                    Age: null,
                    Moonrise: response.data.moonrise || null,
                    Moonset: response.data.moonset || null,
                    MoonPhase: response.data.moon_phase || null,
                    IsWaning: rawIllumination < 0 // Track waning phase
                };

                console.log('✅ Parsed moon data (abs illumination):', moonInfo);
                return moonInfo;
            }
            return null;
        } catch (error) {
            console.error('❌ Error fetching moon data from API:', error);
            return null;
        }
    };

    // ✅ Update the weekly calendar fetch too
    const fetchWeeklyMoonPhases = async () => {
        setLoadingWeekly(true);
        const phases = [];

        try {
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);

                const apiMoonData = await fetchMoonDataFromAPI(date);

                let phaseData;
                if (apiMoonData) {
                    const phaseInfo = getMoonPhaseFromPercentage(apiMoonData.Illumination * 100);
                    phaseData = {
                        date: date,
                        phase: {
                            name: phaseInfo.name,
                            emoji: phaseInfo.emoji,
                            // ✅ Use absolute value
                            illumination: Math.round(apiMoonData.Illumination * 100),
                            index: phaseInfo.index
                        },
                        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                        dayNumber: date.getDate(),
                        source: 'API'
                    };
                } else {
                    phaseData = {
                        date: date,
                        phase: calculateMoonPhase(date),
                        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                        dayNumber: date.getDate(),
                        source: 'Calculated'
                    };
                }

                phases.push(phaseData);
            }

            setWeeklyMoonData(phases);
            console.log('✅ Weekly moon phases loaded with positive values');
        } catch (error) {
            console.error('❌ Error loading weekly moon phases:', error);
        } finally {
            setLoadingWeekly(false);
        }
    };


    // ✅ Load weekly data on mount and when date changes
    useEffect(() => {
        fetchWeeklyMoonPhases();
    }, [selectedDate]);

    const calculatePhaseFromIllumination = (illumination) => {
        const phase = parseFloat(illumination);
        if (phase < 6.25) return 0;
        if (phase < 50) return 0.25;
        if (phase < 93.75) return 0.5;
        return 1;
    };


    // Get moon phase name and emoji from percentage
    const getMoonPhaseFromPercentage = (illumination) => {
        if (illumination < 6.25) return { name: 'New Moon', emoji: '🌑', index: 0 };
        if (illumination < 18.75) return { name: 'Waxing Crescent', emoji: '🌒', index: 1 };
        if (illumination < 31.25) return { name: 'First Quarter', emoji: '🌓', index: 2 };
        if (illumination < 43.75) return { name: 'Waxing Gibbous', emoji: '🌔', index: 3 };
        if (illumination < 56.25) return { name: 'Full Moon', emoji: '🌕', index: 4 };
        if (illumination < 68.75) return { name: 'Waning Gibbous', emoji: '🌖', index: 5 };
        if (illumination < 81.25) return { name: 'Last Quarter', emoji: '🌗', index: 6 };
        return { name: 'Waning Crescent', emoji: '🌘', index: 7 };
    };

    // Calculate moon phase for a given date (fallback)
    const calculateMoonPhase = (date) => {
        const timestamp = date.getTime();
        const newMoon = new Date(2000, 0, 6, 18, 14).getTime();
        const lunarCycle = 29.530588853 * 24 * 60 * 60 * 1000;

        const phase = ((timestamp - newMoon) % lunarCycle) / lunarCycle;
        const adjustedPhase = phase < 0 ? phase + 1 : phase;
        const illumination = Math.round((1 - Math.abs(((adjustedPhase * 2) % 2) - 1)) * 100);

        const phaseInfo = getMoonPhaseFromPercentage(illumination);

        return {
            name: phaseInfo.name,
            emoji: phaseInfo.emoji,
            illumination: illumination,
            phase: adjustedPhase,
            index: phaseInfo.index,
            description: moonPhases[phaseInfo.index].description,
            isWaxing: adjustedPhase < 0.5,
            nextPhase: moonPhases[(phaseInfo.index + 1) % 8],
            daysToNext: Math.round((1 - (adjustedPhase % 0.125)) * 29.53 / 8)
        };
    };

    // Get astrological guidance based on moon phase
    const getAstrologicalGuidance = (moonPhase, userReligion = 'Hindu') => {
        const guidance = {
            'New Moon': {
                Hindu: 'Amavasya - Perfect time for Shiva worship and spiritual practices. Set intentions for new beginnings.',
                Islam: 'New moon marks the beginning of Islamic months. Time for fresh prayers and spiritual renewal.',
                Christianity: 'Time for prayer, reflection, and setting godly intentions for the month ahead.',
                Buddhism: 'Meditate on emptiness and potential. Practice mindfulness and set compassionate intentions.',
                Sikhism: 'New moon reminds us of Waheguru\'s eternal cycle. Perfect time for Naam Simran.',
                Jainism: 'Amavasya is ideal for deep meditation and practicing non-attachment.',
                default: 'New beginnings await. Set clear intentions and plant seeds for future growth.'
            },
            'Full Moon': {
                Hindu: 'Purnima - Highly auspicious for prayers to Lakshmi and spiritual ceremonies. Energy is at peak.',
                Islam: 'Full moon brings blessed energy. Perfect for increased prayers and Quranic recitation.',
                Christianity: 'Full moon illuminates God\'s creation. Time for gratitude prayers and spiritual reflection.',
                Buddhism: 'Full moon is sacred for meditation and dharma practice. Heightened spiritual awareness.',
                Sikhism: 'Purnima symbolizes spiritual enlightenment. Great time for kirtan and seva.',
                Jainism: 'Full moon day is powerful for practicing right conduct and spiritual discipline.',
                default: 'Energy reaches peak. Time for manifestation, gratitude, and spiritual connection.'
            },
            'Waxing Crescent': {
                Hindu: 'Shukla Paksha beginning - Favorable for starting new ventures and positive actions.',
                Islam: 'Growing moon brings hope and progress. Good time for positive intentions.',
                Christianity: 'As moon grows, so can your faith. Time for building spiritual practices.',
                Buddhism: 'Growing energy supports right action and compassionate deeds.',
                Sikhism: 'Waxing moon phase supports growth in devotion and service.',
                Jainism: 'Growing light symbolizes spiritual progress. Perfect for increasing practices.',
                default: 'Building energy supports growth and taking action on your goals.'
            },
            'Waning Crescent': {
                Hindu: 'Krishna Paksha ending - Time for inner reflection and releasing negative patterns.',
                Islam: 'Diminishing moon teaches humility and spiritual focus on Allah.',
                Christianity: 'Time for confession, forgiveness, and preparing for spiritual renewal.',
                Buddhism: 'Practice letting go of attachments and cultivating inner peace.',
                Sikhism: 'Waning moon reminds us to release ego and surrender to Waheguru.',
                Jainism: 'Time for introspection and practicing detachment from material world.',
                default: 'Release what no longer serves you. Prepare for new beginnings.'
            },
            'First Quarter': {
                Hindu: 'Mid-Shukla Paksha - Energy for overcoming obstacles and making decisions.',
                Islam: 'Growing light supports making righteous choices and strengthening faith.',
                Christianity: 'Time to face challenges with faith and commit to your spiritual path.',
                Buddhism: 'Practice right effort and determination in your dharma practice.',
                Sikhism: 'Quarter moon phase supports commitment to the Guru\'s path.',
                Jainism: 'Time for strengthening resolve in spiritual discipline.',
                default: 'Face challenges with courage. Make decisions aligned with your highest self.'
            },
            'Waxing Gibbous': {
                Hindu: 'Shukla Paksha peak - Time for refinement and perfecting spiritual practices.',
                Islam: 'Nearly full moon brings patience and preparation for peak spiritual energy.',
                Christianity: 'Refine your faith and prepare for spiritual fulfillment.',
                Buddhism: 'Practice patience and refine your meditation and mindfulness.',
                Sikhism: 'Time for perfecting devotional practices and selfless service.',
                Jainism: 'Refine your conduct and prepare for spiritual culmination.',
                default: 'Refine your approach. Patience and adjustment lead to success.'
            },
            'Waning Gibbous': {
                Hindu: 'Post-Purnima - Share spiritual wisdom and practice gratitude.',
                Islam: 'After full moon, time to share blessings and express gratitude to Allah.',
                Christianity: 'Share God\'s blessings with others through acts of kindness.',
                Buddhism: 'Practice dana (generosity) and share dharma teachings.',
                Sikhism: 'Time for sharing wisdom through kirtan and teaching Gurbani.',
                Jainism: 'Share spiritual knowledge and practice compassion towards all beings.',
                default: 'Share your wisdom and blessings. Practice gratitude for all you\'ve received.'
            },
            'Last Quarter': {
                Hindu: 'Mid-Krishna Paksha - Release karma and prepare for transformation.',
                Islam: 'Diminishing light teaches letting go and trusting Allah\'s plan.',
                Christianity: 'Time for forgiveness and releasing burdens to God.',
                Buddhism: 'Practice letting go and acceptance of impermanence.',
                Sikhism: 'Release worldly attachments and focus on Naam.',
                Jainism: 'Perfect time for practicing forgiveness and non-attachment.',
                default: 'Let go of what no longer serves. Forgive and release for transformation.'
            }
        };

        return guidance[moonPhase.name]?.[userReligion] || guidance[moonPhase.name]?.default || 'The moon guides your spiritual journey with cosmic wisdom.';
    };

    // ✅ Initialize moon data with API
    useEffect(() => {
        const loadMoonData = async () => {
            setLoading(true);

            // Try to fetch from API first
            const apiMoonData = await fetchMoonDataFromAPI(selectedDate);

            let moonPhase;
            if (apiMoonData) {
                // Use API data
                const phaseInfo = getMoonPhaseFromPercentage(apiMoonData.Illumination * 100);
                moonPhase = {
                    name: phaseInfo.name,
                    emoji: phaseInfo.emoji,
                    illumination: Math.round(apiMoonData.Illumination * 100),
                    phase: apiMoonData.Phase,
                    index: phaseInfo.index,
                    description: moonPhases[phaseInfo.index].description,
                    isWaxing: apiMoonData.Phase < 0.5,
                    nextPhase: moonPhases[(phaseInfo.index + 1) % 8],
                    daysToNext: Math.round(apiMoonData.DaysUntilNewMoon || 0),
                    distance: apiMoonData.Distance || null,
                    age: apiMoonData.Age || null
                };
                console.log('✅ Using real-time API data:', moonPhase);
            } else {
                // Fallback to calculation
                moonPhase = calculateMoonPhase(selectedDate);
                console.log('⚠️ Using calculated data (API unavailable)');
            }

            const guidance = getAstrologicalGuidance(moonPhase, user?.religion);

            setCurrentMoonPhase(moonPhase);
            setMoonData({
                phase: moonPhase,
                guidance: guidance,
                date: selectedDate,
                dayOfWeek: selectedDate.toLocaleDateString('en-US', { weekday: 'long' }),
                formattedDate: selectedDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                source: apiMoonData ? 'Real-time API' : 'Calculated'
            });

            setTimeout(() => setLoading(false), 500);
        };

        loadMoonData();
    }, [selectedDate, user?.religion]);

    // Get next 7 days moon phases
    const getWeeklyMoonPhases = () => {
        const phases = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            phases.push({
                date: date,
                phase: calculateMoonPhase(date),
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNumber: date.getDate()
            });
        }
        return phases;
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setShowDatePicker(false);
    };

    const handleViewChange = (view) => {
        setSelectedView(view);
        if (view === 'today') {
            setSelectedDate(new Date());
        }
    };

    if (loading) {
        return (
            <div className="moon-tracker-container">
                <div className="loading-container">
                    <div className="moon-loading">🌙</div>
                    <p>Loading lunar guidance...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="moon-tracker-container">
            {/* Header */}
            <div className="moon-header">
                <div className="header-content">
                    <h1 className="page-title">🌙 Lunar Guidance</h1>
                    <p className="page-subtitle">
                        Sacred moon wisdom for {user?.given_name || 'you'}
                        <span className="data-source"> • {moonData.source}</span>
                    </p>
                </div>
                <div className="header-actions">
                    <button
                        className={`view-btn ${selectedView === 'today' ? 'active' : ''}`}
                        onClick={() => handleViewChange('today')}
                    >
                        Today
                    </button>
                    <button
                        className={`view-btn ${selectedView === 'custom' ? 'active' : ''}`}
                        onClick={() => {
                            setSelectedView('custom');
                            setShowDatePicker(true);
                        }}
                    >
                        Pick Date
                    </button>
                </div>
            </div>

            {/* Current Moon Phase Display */}
            <div className="current-moon-section">
                <div className="moon-visual">
                    <div className="moon-circle">
                        <span className="moon-emoji">{moonData.phase.emoji}</span>
                        <div className="moon-glow"></div>
                    </div>
                    <div className="illumination-bar">
                        <div
                            className="illumination-fill"
                            style={{ width: `${moonData.phase.illumination}%` }}
                        ></div>
                        <span className="illumination-text">{moonData.phase.illumination}% Illuminated</span>
                    </div>
                </div>

                <div className="moon-info">
                    <div className="moon-date">
                        <h2>{moonData.formattedDate}</h2>
                        <p>{moonData.dayOfWeek}</p>
                    </div>

                    <div className="phase-details">
                        <h3 className="phase-name">{moonData.phase.name}</h3>
                        <p className="phase-description">{moonData.phase.description}</p>

                        <div className="phase-stats">
                            <div className="stat">
                                <span className="stat-label">Direction:</span>
                                <span className="stat-value">
                                    {moonData.phase.isWaxing ? '↗ Waxing' : '↘ Waning'}
                                </span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Next Phase:</span>
                                <span className="stat-value">
                                    {moonData.phase.nextPhase.emoji} {moonData.phase.nextPhase.name}
                                </span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Days Until:</span>
                                <span className="stat-value">{moonData.phase.daysToNext} days</span>
                            </div>
                            {/* ✅ Show API data if available */}
                            {apiData && moonData.phase.age && (
                                <div className="stat">
                                    <span className="stat-label">Moon Age:</span>
                                    <span className="stat-value">{Math.round(moonData.phase.age)} days</span>
                                </div>
                            )}
                            {apiData && moonData.phase.distance && (
                                <div className="stat">
                                    <span className="stat-label">Distance from Earth:</span>
                                    <span className="stat-value">{Math.round(moonData.phase.distance).toLocaleString()} km</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Astrological Guidance */}
            <div className="guidance-section">
                <div className="guidance-header">
                    <h3>🔮 Spiritual Guidance</h3>
                    <span className="religion-badge">{user?.religion || 'Universal'} Wisdom</span>
                </div>
                <div className="guidance-content">
                    <p>{moonData.guidance}</p>
                </div>
            </div>

            {/* Weekly Moon Calendar */}
            <div className="weekly-calendar">
                <div className="calendar-header">
                    <h3>📅 This Week's Lunar Journey</h3>
                    {loadingWeekly && <span className="loading-indicator">⏳ Loading...</span>}
                </div>
                <div className="calendar-grid">
                    {weeklyMoonData.length > 0 ? (
                        weeklyMoonData.map((day, index) => (
                            <div
                                key={index}
                                className={`calendar-day ${day.date.toDateString() === selectedDate.toDateString() ? 'selected' : ''
                                    }`}
                                onClick={() => handleDateSelect(day.date)}
                            >
                                <div className="day-header">
                                    <span className="day-name">{day.dayName}</span>
                                    <span className="day-number">{day.dayNumber}</span>
                                </div>
                                <div className="day-moon">
                                    <span className="day-moon-emoji">{day.phase.emoji}</span>
                                    <span className="day-illumination">{day.phase.illumination}%</span>
                                </div>
                                <span className="day-phase">{day.phase.name}</span>
                                {/* ✅ Show data source indicator */}
                                <span className="data-badge">{day.source === 'API' ? '🟢 Live' : '📊 Calc'}</span>
                            </div>
                        ))
                    ) : (
                        // Loading skeleton
                        Array.from({ length: 7 }).map((_, index) => (
                            <div key={index} className="calendar-day loading-skeleton">
                                <div className="skeleton-header"></div>
                                <div className="skeleton-moon"></div>
                                <div className="skeleton-phase"></div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Moon Phases Reference */}
            <div className="phases-reference">
                <h3>🌙 Moon Phases Guide</h3>
                <div className="phases-grid">
                    {moonPhases.map((phase, index) => (
                        <div key={index} className="phase-card">
                            <div className="phase-visual">
                                <span className="phase-emoji">{phase.emoji}</span>
                            </div>
                            <div className="phase-info">
                                <h4>{phase.name}</h4>
                                <p>{phase.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Date Picker Modal */}
            {showDatePicker && (
                <div className="date-picker-overlay" onClick={() => setShowDatePicker(false)}>
                    <div className="date-picker-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="date-picker-header">
                            <h3>Select Date</h3>
                            <button onClick={() => setShowDatePicker(false)}>✕</button>
                        </div>
                        <input
                            type="date"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => handleDateSelect(new Date(e.target.value))}
                            className="date-input"
                        />
                        <div className="date-picker-actions">
                            <button onClick={() => setShowDatePicker(false)}>Cancel</button>
                            <button onClick={() => setShowDatePicker(false)}>Done</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MoonTracker;
