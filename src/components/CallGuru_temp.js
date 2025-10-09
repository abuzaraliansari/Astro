import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import CustomCalendar from './CustomCalendar';
import {
  getAllGurus,
  getAllConsultationTypes,
  getGuruAvailability,
  createBooking,
  getUserBookings,
  cancelBooking,
} from '../api';

function CallGuru() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(0); // 0 = today, 1 = tomorrow, etc.
  const scrollRef = useRef(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customSelectedDate, setCustomSelectedDate] = useState(null);
  const datePickerRef = useRef(null);

  const [showCalendar, setShowCalendar] = useState(false);

  // ✅ STATE FOR API DATA
  const [gurus, setGurus] = useState([]);
  const [consultationTypes, setConsultationTypes] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);
  const [userCredits, setUserCredits] = useState(0);

  const [loading, setLoading] = useState({
    gurus: false,
    consultations: false,
    slots: false,
    bookings: false,
    booking: false
  });

  const getDateLimits = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    maxDate.setHours(23, 59, 59, 999);
    
    return { min: today, max: maxDate };
  };

   // ✅ Handle date selection from calendar
  const handleCalendarDateSelect = (dateString) => {
    const selectedDate = new Date(dateString);
    setCustomSelectedDate(selectedDate);
    setSelectedDate(null); // Clear week selection
    setSelectedTimeSlot(null);
    setShowCalendar(false);
    
    // Fetch availability for selected date
    if (selectedGuru) {
      fetchAvailableSlots(selectedGuru, dateString);
    }
  };

  // ✅ Handle custom date selection from calendar
  const handleCustomDateSelect = (dateString) => {
    const selectedDateObj = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if date is within allowed range
    const diffDays = Math.floor((selectedDateObj - today) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 60) {
      // Update to custom date
      setCustomSelectedDate(selectedDateObj);
      setSelectedDate(null); // Clear week selection
      setSelectedTimeSlot(null);
      setShowDatePicker(false);

      // Fetch availability for custom date
      if (selectedGuru) {
        fetchAvailableSlots(selectedGuru, dateString);
      }
    } else {
      alert('Please select a date within the next 60 days');
    }
  };

  // ✅ Get formatted date for display
  const getDisplayDate = () => {
    if (customSelectedDate) {
      return {
        dayName: customSelectedDate.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: customSelectedDate.getDate(),
        monthName: customSelectedDate.toLocaleDateString('en-US', { month: 'short' }),
        fullDate: customSelectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        }),
        sqlDate: customSelectedDate.toISOString().split('T')[0]
      };
    }
    return weekDates[selectedDate];
  };

  // ✅ Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDatePicker]);

  // ✅ Update availability fetch when custom date is selected
  useEffect(() => {
    if (selectedGuru && customSelectedDate) {
      const dateStr = customSelectedDate.toISOString().split('T')[0];
      fetchAvailableSlots(selectedGuru, dateStr);
    }
  }, [selectedGuru, customSelectedDate]);

  // ✅ GENERATE WEEKLY DATES
  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0,
        sqlDate: date.toISOString().split('T')[0]
      });
    }
    return dates;
  };

  const [weekDates] = useState(getWeekDates());

  useEffect(() => {
    if (user?.credits !== undefined) {
      setUserCredits(user.credits);
    }
  }, [user]);

  // ✅ FETCH GURUS FROM API
  const fetchGurus = async () => {
    setLoading(prev => ({ ...prev, gurus: true }));
    try {
      console.log('🧙‍♂️ FETCHING GURUS FROM API...');
      const response = await getAllGurus();

      if (response.data.success) {
        setGurus(response.data.data);
        console.log('✅ Loaded gurus from API:', response.data.count);
      } else {
        console.error('Error fetching gurus:', response.data.message);
        alert('Error loading guru data: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error fetching gurus:', error);
      alert('Error connecting to server: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, gurus: false }));
    }
  };

  // ✅ FETCH CONSULTATION TYPES FROM API
  const fetchConsultationTypes = async () => {
    setLoading(prev => ({ ...prev, consultations: true }));
    try {
      console.log('🔮 FETCHING CONSULTATION TYPES FROM API...');
      const response = await getAllConsultationTypes();

      if (response.data.success) {
        setConsultationTypes(response.data.data);
        console.log('✅ Loaded consultation types from API:', response.data.count);
      } else {
        console.error('Error fetching consultation types:', response.data.message);
        alert('Error loading consultation options: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error fetching consultation types:', error);
      alert('Error connecting to server: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, consultations: false }));
    }
  };

  // ✅ FETCH AVAILABLE SLOTS FROM API
  const fetchAvailableSlots = async (guruId, date) => {
    if (!guruId || !date) {
      setAvailableSlots([]);
      return;
    }

    setLoading(prev => ({ ...prev, slots: true }));
    try {
      console.log('📅 FETCHING AVAILABILITY FROM API:', { guruId, date });
      const response = await getGuruAvailability(guruId, date, date);

      if (response.data.success) {
        setAvailableSlots(response.data.data);
        console.log('✅ Loaded availability from API:', response.data.count);
      } else {
        console.error('Error fetching slots:', response.data.message);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
      alert('Error loading time slots: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, slots: false }));
    }
  };

  // ✅ FETCH USER BOOKINGS FROM API
  const fetchUserBookings = async () => {
    if (!user?.id) return;

    setLoading(prev => ({ ...prev, bookings: true }));
    try {
      console.log('📋 FETCHING USER BOOKINGS FROM API...');
      const response = await getUserBookings(user.id);

      if (response.data.success) {
        setExistingBookings(response.data.data);
        console.log('✅ Loaded user bookings from API:', response.data.count);
      } else {
        console.error('Error fetching bookings:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      alert('Error loading your bookings: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, bookings: false }));
    }
  };

  // ✅ INITIAL DATA LOADING
  useEffect(() => {
    fetchGurus();
    fetchConsultationTypes();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserBookings();
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedGuru && selectedDate !== null) {
      const selectedDateObj = weekDates[selectedDate];
      fetchAvailableSlots(selectedGuru, selectedDateObj.sqlDate);
    }
  }, [selectedGuru, selectedDate]);

  // ✅ FORMAT TIME HELPER
  const formatTime = (hour, minute = 0) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMinute = minute === 0 ? '00' : minute;
    return `${displayHour}:${displayMinute} ${period}`;
  };

  // ✅ GENERATE DISPLAY SLOTS FROM API DATA
  const generateAvailableSlots = () => {
    return availableSlots.map(slot => {
      const startTime = formatTime(slot.start_hour, slot.start_minute);
      const endHour = slot.start_minute + slot.duration_minutes >= 60
        ? slot.start_hour + 1
        : slot.start_hour;
      const endMinute = (slot.start_minute + slot.duration_minutes) % 60;
      const endTime = formatTime(endHour, endMinute);

      return {
        id: `${slot.start_hour}-${slot.start_minute}`,
        start_hour: slot.start_hour,
        start_minute: slot.start_minute,
        duration: slot.duration_minutes,
        label: `${startTime} - ${endTime}`,
        available: true,
        type: slot.duration_minutes === 60 ? 'full' : 'half'
      };
    });
  };

  // ✅ HORIZONTAL SCROLL FUNCTIONS
  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };
  // ✅ Add this at the top of your component (before return statement)
  const GURU_AVATARS = [
    '👨‍🏫', '👨‍🎓', '🧙‍♂️', '👳‍♂️', '🧙', '👴', '🧑‍🏫', '👨‍⚕️',
    '👨‍🔬', '🧑‍💼', '👨‍🚀', '🧝‍♂️', '🧑‍🎨', '👨‍🍳'
  ];

  // ✅ Create persistent avatar mapping using useState
  const [guruAvatars, setGuruAvatars] = useState({});

  // ✅ Function to get consistent avatar for each guru
  const getGuruAvatar = (guruId) => {
    // If avatar already assigned, return it
    if (guruAvatars[guruId]) {
      return guruAvatars[guruId];
    }

    // Otherwise, assign a new random avatar and save it
    const randomAvatar = GURU_AVATARS[Math.floor(Math.random() * GURU_AVATARS.length)];
    setGuruAvatars(prev => ({ ...prev, [guruId]: randomAvatar }));
    return randomAvatar;
  };

  /*/ ✅ Alternative: Use guru ID to deterministically pick avatar (no randomness)
  const getGuruAvatarDeterministic = (guruId) => {
    // Use guru ID to always get the same avatar
    const index = guruId % GURU_AVATARS.length;
    return GURU_AVATARS[index];
  };*/


  // ✅ BOOK CALL API INTEGRATION
 // ✅ FIXED: BOOK CALL API INTEGRATION
const bookCall = async () => {
  if (!selectedGuru || !selectedConsultation || !selectedTimeSlot || !user) {
    alert('Please select Guru, consultation type, and time slot');
    return;
  }

  const selectedSlot = generateAvailableSlots().find(slot => slot.id === selectedTimeSlot);
  
  // ✅ FIXED: Get date from custom calendar OR week selector
  const selectedDateObj = customSelectedDate 
    ? {
        sqlDate: customSelectedDate.toISOString().split('T')[0],
        dayName: customSelectedDate.toLocaleDateString('en-US', { weekday: 'short' }),
        monthName: customSelectedDate.toLocaleDateString('en-US', { month: 'short' }),
        dayNumber: customSelectedDate.getDate()
      }
    : weekDates[selectedDate];

  // ✅ Check if we have a valid date
  if (!selectedDateObj || !selectedDateObj.sqlDate) {
    alert('Please select a valid date');
    return;
  }

  const consultationType = consultationTypes.find(c => c.id === selectedConsultation);
  const guruInfo = gurus.find(g => g.id === selectedGuru);

  if (!selectedSlot || !consultationType || !guruInfo) {
    alert('Invalid selection. Please try again.');
    return;
  }

  // Check if consultation duration fits in selected slot
  if (consultationType.duration_minutes > selectedSlot.duration) {
    alert('Selected consultation duration does not fit in the selected time slot');
    return;
  }

  // ✅ UPDATED: Check user credits instead of payment
  if (userCredits < consultationType.credits_required) {
    alert(`❌ Insufficient Credits!\n\nYou need ${consultationType.credits_required} credits but only have ${userCredits} credits.\n\nPlease purchase more credits to continue.`);
    return;
  }

  try {
    setLoading(prev => ({ ...prev, booking: true }));

    const bookingData = {
      userId: user.id,
      guruId: selectedGuru,
      consultationTypeId: selectedConsultation,
      bookingDate: selectedDateObj.sqlDate,
      startHour: selectedSlot.start_hour,
      startMinute: selectedSlot.start_minute,
      notes: `Booked via web app - ${consultationType.name}`
    };

    console.log('📞 CREATING BOOKING:', bookingData);
    const response = await createBooking(bookingData);

    if (response.data.success) {
      // ✅ UPDATED: Show credits deducted instead of price
      const newBalance = response.data.user?.newCreditBalance || (userCredits - consultationType.credits_required);
      
      alert(`✅ ${response.data.message}\n\nConsultation: ${consultationType.name} (${consultationType.duration_minutes} min)\nDate: ${selectedDateObj.dayName}, ${selectedDateObj.monthName} ${selectedDateObj.dayNumber}\nTime: ${selectedSlot.label}\n\n💳 Credits Used: ${consultationType.credits_required}\n💰 Remaining Credits: ${newBalance}`);

      // ✅ UPDATED: Update user credits
      setUserCredits(newBalance);

      // Reset selections
      setSelectedGuru(null);
      setSelectedConsultation(null);
      setSelectedTimeSlot(null);
      setCustomSelectedDate(null); // ✅ Also reset custom date
      setSelectedDate(0); // Reset to today

      // Refresh data
      fetchUserBookings();
      setAvailableSlots([]);

      console.log('✅ Booking created successfully:', response.data.booking);
    } else {
      alert(`❌ Booking Error: ${response.data.message}`);
      console.error('Booking failed:', response.data);
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    
    // ✅ UPDATED: Better error handling for insufficient credits
    if (error.response?.status === 402) {
      alert(`❌ Insufficient Credits!\n\n${error.response.data.message}`);
    } else {
      alert('❌ Error creating booking: ' + error.message);
    }
  } finally {
    setLoading(prev => ({ ...prev, booking: false }));
  }
};


  const handleCancelBooking = async (bookingId) => {
    if (!bookingId || !user?.id) {
      alert('Unable to cancel booking. Please try again.');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, booking: true }));

      console.log('❌ CANCELLING BOOKING:', bookingId);
      const response = await cancelBooking(bookingId, user.id, 'Cancelled by user from web app');

      if (response.data.success) {
        // ✅ UPDATED: Show credits refunded
        const refundedCredits = response.data.booking?.creditsRefunded || 0;

        alert(`✅ ${response.data.message}\n\n💳 Credits Refunded: ${refundedCredits}\n💰 New Balance: ${userCredits + refundedCredits}`);

        // ✅ UPDATED: Update user credits
        setUserCredits(prev => prev + refundedCredits);

        fetchUserBookings();

        if (selectedGuru && selectedDate !== null) {
          const selectedDateObj = weekDates[selectedDate];
          fetchAvailableSlots(selectedGuru, selectedDateObj.sqlDate);
        }

        console.log('✅ Booking cancelled successfully:', response.data.booking);
      } else {
        alert(`❌ Error: ${response.data.message}`);
        console.error('Cancellation failed:', response.data);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('❌ Error cancelling booking: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, booking: false }));
    }
  };

  // ✅ GET SELECTED ITEMS FOR DISPLAY
  const getSelectedGuru = () => gurus.find(g => g.id === selectedGuru);
  const getSelectedConsultation = () => consultationTypes.find(c => c.id === selectedConsultation);
  const getSelectedTimeSlot = () => {
    const slots = generateAvailableSlots();
    return slots.find(slot => slot.id === selectedTimeSlot);
  };

  return (
    <div className="call-container">
      <div className="call-header">
        <h1 className="page-title">📞 Schedule With Guru Ji</h1>
        <p className="page-subtitle">Direct personal consultation with expert astrologers</p>
      </div>

      {/* ✅ LOADING STATES */}
      {(loading.gurus || loading.consultations) && (
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Loading guru data...</p>
        </div>
      )}

      {/* ✅ HORIZONTAL SCROLLING GURU PROFILES */}
      <div className="guru-profiles-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <div className="section-icon">🧙‍♂️</div>
            <h3 className="section-title">Choose Your Spiritual Guide</h3>
          </div>
          <div className="scroll-controls">
            <button className="scroll-btn scroll-left" onClick={scrollLeft}>
              <span>‹</span>
            </button>
            <button className="scroll-btn scroll-right" onClick={scrollRight}>
              <span>›</span>
            </button>
          </div>
        </div>

        <div className="guru-profiles-container" ref={scrollRef}>
          {loading.gurus ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Finding your perfect guide...</p>
            </div>
          ) : gurus.length > 0 ? (
            gurus.map((guru) => (
              <div
                key={guru.id}
                className={`guru-card ${selectedGuru === guru.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedGuru(guru.id);
                  setSelectedTimeSlot(null);
                }}
              >
                {/* ✅ Verified Badge */}

                {/* ✅ Avatar with persistent icon */}
                <div className="guru-avatar-wrapper">
                  <div className="guru-avatar">
                    <span className="avatar-icon">{getGuruAvatar(guru.id)}</span>
                    <div className="avatar-ring"></div>
                  </div>
                  <div className="online-indicator"></div>
                  {/* ✅ Rating */}
                  <div className="guru-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="star" style={{ '--i': i }}>⭐</span>
                      ))}

                    </div>

                  </div>
                </div>

                {/* ✅ Guru Info */}
                <div className="guru-info">
                  <h4 className="guru-name">{guru.name}</h4>
                  <p className="guru-qualification">{guru.qualification}</p>



                  {/* ✅ Specialties */}
                  <div className="guru-specialties">
                    {guru.specialties && guru.specialties.slice(0, 3).map((specialty, idx) => (
                      <span key={idx} className="specialty-tag">
                        <span className="tag-dot"></span>
                        {specialty}
                      </span>
                    ))}
                  </div>

                  {/* ✅ Languages */}
                  <div className="guru-languages">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2" />
                    </svg>
                    <span>{guru.languages && guru.languages.join(', ')}</span>
                  </div>

                  {/* ✅ Call Button */}
                </div>

                {/* ✅ Selected Indicator */}
                {selectedGuru === guru.id && (
                  <div className="selected-indicator">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#FFD700" />
                      <path d="M8 12l3 3l5-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-data">
              <div className="no-data-icon">😔</div>
              <p>No spiritual guides available</p>
              <span>Please check back later</span>
            </div>
          )}
        </div>
      </div>

      {/* ✅ CONSULTATION TYPES */}
      <div className="consultation-types">
        <h3>🔮 Choose Consultation Type</h3>
        <div className="types-grid">
          {loading.consultations ? (
            <div className="loading-container">Loading consultation types...</div>
          ) : consultationTypes.length > 0 ? (
            consultationTypes.map((type) => (
              <div
                key={type.id}
                className={`consultation-card ${selectedConsultation === type.id ? 'selected' : ''}`}
                onClick={() => setSelectedConsultation(type.id)}
              >
                <div className="consult-info">
                  <h4 className="consult-name">{type.name}</h4>
                  {/* <p className="consult-description">{type.description}</p>*/}
                  <div className="consult-details">
                    <span className="consult-duration">⏱️ {type.duration_minutes} min</span>
                    <span className="consult-price">{type.credits_required} credits</span>
                  </div>
                </div>
                {selectedConsultation === type.id && <div className="selected-indicator">✓</div>}
              </div>
            ))
          ) : (
            <div className="no-data">No consultation types available</div>
          )}
        </div>
      </div>

      {/* ✅ WEEKLY DATE SELECTOR */}
      <div className="date-selector">
        <div className="date-selector-header">
          <h3>📅 Select Date</h3>
          {/* ✅ Pick Date Button */}
          <button 
            className="pick-date-btn date-btn"
            onClick={() => setShowCalendar(true)}
          >
            <span className="calendar-icon">📆</span>
            <span>Pick Date</span>
          </button>
        </div>

        {/* ✅ Show custom date if selected */}
        {customSelectedDate && (
          <div className="custom-date-display">
            <div className="custom-date-info">
              <span className="custom-date-icon">📅</span>
              <span className="custom-date-text">
                Selected: {getDisplayDate().fullDate}
              </span>
            </div>
            <button 
              className="clear-custom-date-btn"
              onClick={() => {
                setCustomSelectedDate(null);
                setSelectedDate(0);
                setSelectedTimeSlot(null);
              }}
            >
              ← Back to Week View
            </button>
          </div>
        )}

        {/* Week dates grid */}
        {!customSelectedDate && (
          <div className="dates-grid">
            {weekDates.map((dateObj, index) => (
              <button
                key={index}
                className={`date-btn ${selectedDate === index ? 'selected' : ''} ${dateObj.isToday ? 'today' : ''}`}
                onClick={() => {
                  setSelectedDate(index);
                  setCustomSelectedDate(null);
                  setSelectedTimeSlot(null);
                }}
              >
                <div className="date-day">{dateObj.dayName}</div>
                <div className="date-number">{dateObj.dayNumber}</div>
                <div className="date-month">{dateObj.monthName}</div>
                {dateObj.isToday && <div className="today-indicator">Today</div>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Custom Calendar Modal */}
      {showCalendar && (
        <CustomCalendar
          onDateSelect={handleCalendarDateSelect}
          minDate={getDateLimits().min}
          maxDate={getDateLimits().max}
          onClose={() => setShowCalendar(false)}
        />
      )}


      {/* ✅ DYNAMIC TIME SLOTS */}
      {selectedGuru && (
        <div className="time-slots">
          <h3>
            ⏰ Available Time Slots - {getDisplayDate().dayName}, {getDisplayDate().monthName} {getDisplayDate().dayNumber}
          </h3>
          <div className="slots-grid">
            {loading.slots ? (
              <div className="loading-container">Loading available slots...</div>
            ) : generateAvailableSlots().length > 0 ? (
              generateAvailableSlots().map((slot) => (
                <button
                  key={slot.id}
                  className={`slot-btn ${selectedTimeSlot === slot.id ? 'selected' : ''} ${slot.type}`}
                  onClick={() => setSelectedTimeSlot(slot.id)}
                >
                  <span className="slot-time">{slot.label}</span>
                  <span className="slot-duration">{slot.duration} min available</span>
                  <span className="slot-status">✅ Available</span>
                </button>
              ))
            ) : (
              <div className="no-slots">
                <p>😔 No available slots for this day</p>
                <p>Please select another date</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="booking-section">
        <div className="booking-info">
          <h3>📋 Your Booking Details</h3>
          <div className="booking-details">
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{user?.full_name || user?.name || 'Please login'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Current Credits:</span>
              <span className="detail-value credit-highlight">💰 {userCredits}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Selected Guru:</span>
              <span className="detail-value">
                {getSelectedGuru()?.name || 'Please select a Guru'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Consultation:</span>
              <span className="detail-value">
                {getSelectedConsultation() ?
                  `${getSelectedConsultation().name} (${getSelectedConsultation().duration_minutes} min)` :
                  'Please select consultation type'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">
                {getDisplayDate().fullDate || `${getDisplayDate().dayName}, ${getDisplayDate().monthName} ${getDisplayDate().dayNumber}`}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Time Slot:</span>
              <span className="detail-value">
                {getSelectedTimeSlot()?.label || 'Please select time slot'}
              </span>
            </div>
            {/* ✅ UPDATED: Show credits required instead of price */}
            <div className="detail-row total-row">
              <span className="detail-label">Credits Required:</span>
              <span className="detail-value price-highlight">
                💳 {getSelectedConsultation()?.credits_required || '0'}
              </span>
            </div>
            {/* ✅ NEW: Show remaining credits after booking */}
            {getSelectedConsultation() && (
              <div className="detail-row">
                <span className="detail-label">Remaining After Booking:</span>
                <span className="detail-value">
                  {userCredits - (getSelectedConsultation()?.credits_required || 0)} credits
                </span>
              </div>
            )}
          </div>
        </div>
        <button
          className="book-call-btn"
          onClick={bookCall}
          disabled={!selectedTimeSlot || !selectedGuru || !selectedConsultation || !user || loading.booking}
        >
          {loading.booking ? '⏳ Booking...' : '📞 Book Call - Use Credits'}
        </button>
      </div>

      {/* ✅ UPDATED: EXISTING BOOKINGS - Show credits_used */}
      {existingBookings.length > 0 && (
        <div className="existing-bookings">
          <h3>📅 Your Bookings</h3>
          {loading.bookings ? (
            <div className="loading-container">Loading your bookings...</div>
          ) : (
            <div className="bookings-list">
              {existingBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-guru">
                    <span className="booking-avatar">{getGuruAvatar(booking.guru_id) || '🧙‍♂️'}</span>
                    <div className="booking-info-mini">
                      <div className="booking-name">{booking.guru_name}</div>
                      <div className="booking-consultation">{booking.consultation_name}</div>
                    </div>
                  </div>
                  <div className="booking-details-mini">
                    <div className="booking-date">
                      {new Date(booking.booking_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="booking-time">
                      {formatTime(booking.start_hour, booking.start_minute)}
                    </div>
                    {/* ✅ UPDATED: Show credits_used instead of total_price */}
                    <div className="booking-credits">💳 {booking.credits_used} credits</div>
                    <div className={`booking-status status-${booking.status}`}>
                      {booking.status}
                    </div>
                  </div>
                  <div className="booking-actions">
                    {booking.status === 'confirmed' && (
                      <button
                        className="cancel-btn"
                        onClick={() => {
                          if (window.confirm(`Cancel booking with ${booking.guru_name}?\n\nDate: ${new Date(booking.booking_date).toLocaleDateString()}\nTime: ${formatTime(booking.start_hour, booking.start_minute)}\n\n${booking.credits_used} credits will be refunded.`)) {
                            handleCancelBooking(booking.id);
                          }
                        }}
                        disabled={loading.booking}
                      >
                        {loading.booking ? '...' : '❌ Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* ✅ CALL FEATURES */}
      <div className="call-features">
        <h3>🌟 What You Get</h3>
        <div className="features-list">
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">Personalized guidance based on your birth chart</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📞</span>
            <span className="feature-text">Direct phone consultation with expert</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📝</span>
            <span className="feature-text">Detailed remedies and suggestions</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔄</span>
            <span className="feature-text">Follow-up support via chat</span>
          </div>
        </div>
      </div>

      {/* ✅ EMERGENCY CHAT */}
      <div className="emergency-chat">
        <button
          className="emergency-btn"
          onClick={() => navigate('/chat')}
        >
          💬 Need Immediate Help? Chat Now
        </button>
      </div>
    </div>
  );
}

export default CallGuru;
